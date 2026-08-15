import { describe, expect, it } from "vitest";
import { crashSeedProcess, processCanUse, spawnSeedProcess, stopSeedProcess } from "./seedProcess";

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
