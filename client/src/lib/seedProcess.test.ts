import { describe, expect, it } from "vitest";
import { crashSeedProcess, migrateSeedProcess, processCanUse, spawnSeedProcess, stopSeedProcess, validateProcessSpec } from "./seedProcess";

describe("Seed process isolation", () => {
  it("allocates an unused PID and bounds process resources", () => {
    const first = spawnSeedProcess([], { path: "/apps/sniff.PROC", memory: 99, ports: [7, 7, 8], openFiles: ["/a", "/a"], capabilities: ["NETWORK"] }, 12);
    const second = spawnSeedProcess([first], { path: "/apps/calc.PROC", memory: 0 }, 13);
    expect(first.pid).toBe(100);
    expect(second.pid).toBe(101);
    expect(first.memory).toBe(32);
    expect(first.ports).toEqual([7, 8]);
    expect(first.openFiles).toEqual(["/a"]);
  });

  it("rejects missing dependencies and incompatible firmware before spawn", () => {
    const issues = validateProcessSpec({ path: "/apps/repaired.PROC", memory: 2, compatibleFirmware: "0.9.1", requiredDependencies: ["/lib/seed-net"] }, { firmware: "0.8.0", installedDependencies: [] });
    expect(issues).toEqual(["FIRMWARE_INCOMPATIBLE", "DEPENDENCY_MISSING:/lib/seed-net"]);
  });

  it("records migration metadata while preserving process resources", () => {
    const process = spawnSeedProcess([], { path: "/apps/calc.PROC", memory: 2, ports: [9], openFiles: ["/tmp/x"] }, 4);
    const migrated = migrateSeedProcess(process, "0.8", "0.9");
    expect(migrated.fault).toBe("MIGRATED:0.8->0.9");
    expect(migrated.ports).toEqual([9]);
    expect(migrated.openFiles).toEqual(["/tmp/x"]);
  });

  it("gates capabilities and releases resources on exit or crash", () => {
    const process = spawnSeedProcess([], { path: "/apps/sniff.PROC", memory: 4, ports: [44], capabilities: ["NETWORK"] }, 1);
    expect(processCanUse(process, "NETWORK")).toBe(true);
    expect(processCanUse(process, "AUDIO")).toBe(false);
    const crashed = crashSeedProcess(process, "PORT_COLLISION");
    expect(crashed.state).toBe("CRASHED");
    expect(crashed.ports).toEqual([]);
    expect(processCanUse(crashed, "NETWORK")).toBe(false);
    const exited = stopSeedProcess(process, 0);
    expect(exited.state).toBe("EXITED");
    expect(exited.openFiles).toEqual([]);
  });
});
