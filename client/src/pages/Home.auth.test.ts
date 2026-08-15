import { describe, expect, it } from "vitest";
import { createSeedIndex } from "@/lib/seedData";
import { createRuntimeIndex, initialRuntime, runCommand } from "./Home";

describe("Seed OS AUTH dispatcher", () => {
  it("records failed attempts, locks temporarily, emits a notice, then expires and authenticates", () => {
    const index = createSeedIndex();
    const base = structuredClone(initialRuntime);
    const first = runCommand("AUTH I.CHEN WRONG", "/", index, base);
    const second = runCommand("AUTH I.CHEN WRONG", "/", index, first.nextRuntime!);
    const third = runCommand("AUTH I.CHEN WRONG", "/", index, second.nextRuntime!);
    const fourth = runCommand("AUTH I.CHEN WRONG", "/", index, third.nextRuntime!);
    const locked = fourth.nextRuntime!;

    expect(locked.failedLogins["I.CHEN"]).toBe(4);
    expect(locked.lockedUsers).toContain("I.CHEN");
    expect(locked.lockedUntil["I.CHEN"]).toBe(15);
    expect(locked.systems.notices).toContain("AUTH.LOCKOUT.I.CHEN");
    expect(fourth.lines.some((line) => line.text.includes("account locked"))).toBe(true);

    const blocked = runCommand("AUTH I.CHEN TIDAL-04", "/", index, locked);
    expect(blocked.nextRuntime?.lockedUsers).toContain("I.CHEN");
    expect(blocked.nextRuntime?.lockedUntil["I.CHEN"]).toBe(15);
    expect(blocked.lines.some((line) => line.text.includes("account locked"))).toBe(true);

    const expiredClock = { ...locked, systems: { ...locked.systems, clock: 15 } };
    const authenticated = runCommand("AUTH I.CHEN TIDAL-04", "/", index, expiredClock);
    expect(authenticated.nextRuntime?.lockedUsers).not.toContain("I.CHEN");
    expect(authenticated.nextRuntime?.authenticatedUsers).toContain("I.CHEN");
    expect(authenticated.nextRuntime?.authority).toBe("OFFICER");
    expect(authenticated.lines.some((line) => line.text.includes("session attached"))).toBe(true);
  });

  it("blocks a real PROC launch when its dependency is not present", () => {
    const index = createSeedIndex();
    const base = { ...structuredClone(initialRuntime), authority: "CREW" as const };
    const result = runCommand("RUN /personal/passenger-014/seed-tool.PROC", "/", index, base);
    expect(result.nextRuntime?.processes ?? []).toHaveLength(0);
    expect(result.lines.some((line) => line.text.includes("launch rejected"))).toBe(true);
    expect(result.lines.some((line) => line.text.includes("LOOP_02"))).toBe(true);
  });

  it("rejects a real corrupted PROC before spawning it", () => {
    const index = createSeedIndex();
    const root = { ...structuredClone(initialRuntime), authority: "ROOT" as const };
    const result = runCommand("RUN /apps/backdoor_exploit.PROC", "/", index, root);
    expect(result.nextRuntime?.processes ?? []).toHaveLength(0);
    expect(result.lines.some((line) => line.text.includes("binary unreadable"))).toBe(true);
  });

  it("rejects a real PROC when the active firmware is incompatible", () => {
    const index = createSeedIndex();
    const base = { ...structuredClone(initialRuntime), authority: "CREW" as const, firmwareVersion: "0.8.4" };
    const result = runCommand("RUN /personal/passenger-344/memory-grid.PROC", "/", index, base);
    expect(result.nextRuntime?.processes ?? []).toHaveLength(0);
    expect(result.lines.some((line) => line.text.includes("FIRMWARE_INCOMPATIBLE"))).toBe(true);
  });

  it("makes migration and rollback affect the real process version", () => {
    const index = createSeedIndex();
    const base = { ...structuredClone(initialRuntime), authority: "CREW" as const, services: ["LOOP_02"] };
    const installResult = runCommand("INSTALL /personal/passenger-014/seed-tool.PROC", "/", index, base);
    expect(installResult.nextRuntime?.installedApps.length ?? 0, installResult.lines.map((line) => line.text).join(" | ")).toBe(1);
    const baseline = installResult.nextRuntime!;
    const baselineRun = runCommand("RUN /apps/passenger-014-seed-tool.PROC", "/", createRuntimeIndex(index, baseline.installedApps), { ...baseline, seedVersion: "0.9.1" });
    const baselineOutput = baselineRun.lines.map((line) => line.text).join(" | ");
    expect(baselineOutput).toContain("compatibility legacy 0.9.1");
    const migrateResult = runCommand("MIGRATE /apps/passenger-014-seed-tool.PROC 0.9.2", "/", index, installResult.nextRuntime!);
    expect(migrateResult.nextRuntime, migrateResult.lines.map((line) => line.text).join(" | ")).toBeDefined();
    const migrated = migrateResult.nextRuntime!;
    const migratedRun = runCommand("RUN /apps/passenger-014-seed-tool.PROC", "/", createRuntimeIndex(index, migrated.installedApps), { ...migrated, seedVersion: "0.9.2" });
    expect(migratedRun.nextRuntime?.processes[0]?.version, `${migratedRun.lines.map((line) => line.text).join(" | ")} :: ${(migratedRun.nextRuntime?.installedApps ?? []).map((app) => app.installedPath).join(",")}`).toBe("0.9.2");
    expect(migratedRun.nextRuntime?.services).toContain("LOOP_02");
    const migratedOutput = migratedRun.lines.map((line) => line.text).join(" | ");
    expect(migratedOutput).toContain("compatibility patch 0.9.2");
    expect(migratedOutput).not.toContain("compatibility legacy 0.9.1");
    const rolledBack = runCommand("ROLLBACK /apps/passenger-014-seed-tool.PROC", "/", index, migrated).nextRuntime!;
    const rollbackRun = runCommand("RUN /apps/passenger-014-seed-tool.PROC", "/", createRuntimeIndex(index, rolledBack.installedApps), { ...rolledBack, seedVersion: "0.9.1" });
    expect(rollbackRun.nextRuntime?.processes[0]?.version).toBe("0.9.1");
    expect(rollbackRun.nextRuntime?.services).toContain("LOOP_02");
    const rollbackOutput = rollbackRun.lines.map((line) => line.text).join(" | ");
    expect(rollbackOutput).toContain("compatibility legacy 0.9.1");
  });

  it("migrates and rolls back an installed application through the registry", () => {
    const index = createSeedIndex();
    const base = { ...structuredClone(initialRuntime), authority: "CREW" as const };
    const installResult = runCommand("INSTALL /personal/passenger-344/memory-grid.PROC", "/", index, base);
    expect(installResult.nextRuntime?.installedApps.length ?? 0, installResult.lines.map((line) => line.text).join(" | ")).toBe(1);
    const installed = installResult.nextRuntime!;
    const migrated = runCommand("MIGRATE /apps/passenger-344-memory-grid.PROC 0.9.2", "/", index, installed).nextRuntime!;
    expect(migrated.installedApps[0]?.version).toBe("0.9.2");
    expect(migrated.appMigrations.at(-1)?.rollback).toBe(false);
    const rolledBack = runCommand("ROLLBACK /apps/passenger-344-memory-grid.PROC", "/", index, migrated).nextRuntime!;
    expect(rolledBack.installedApps[0]?.version).toBe("0.9.1");
    expect(rolledBack.appMigrations.at(-1)?.rollback).toBe(true);
  });
});
