import { describe, expect, it } from "vitest";
import { createSeedIndex } from "@/lib/seedData";
import { initialRuntime, runCommand } from "./Home";

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
});
