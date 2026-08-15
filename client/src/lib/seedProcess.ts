export type SeedProcessState = "RUNNING" | "PAUSED" | "CRASHED" | "EXITED";

export type SeedProcess = {
  pid: number;
  path: string;
  state: SeedProcessState;
  memory: number;
  ports: number[];
  openFiles: string[];
  outputDevice: string;
  capabilities: string[];
  startedAt: number;
  exitCode?: number;
  fault?: string;
};

export type ProcessSpec = {
  path: string;
  memory: number;
  ports?: number[];
  openFiles?: string[];
  outputDevice?: string;
  capabilities?: string[];
};

export function spawnSeedProcess(existing: SeedProcess[], spec: ProcessSpec, clock: number): SeedProcess {
  const used = new Set(existing.map((process) => process.pid));
  let pid = 100;
  while (used.has(pid)) pid += 1;
  return { pid, path: spec.path, state: "RUNNING", memory: Math.max(1, Math.min(32, spec.memory)), ports: Array.from(new Set(spec.ports ?? [])).slice(0, 4), openFiles: Array.from(new Set(spec.openFiles ?? [])).slice(0, 16), outputDevice: spec.outputDevice ?? "/dev/stdout", capabilities: Array.from(new Set(spec.capabilities ?? [])), startedAt: clock };
}

export function stopSeedProcess(process: SeedProcess, exitCode = 0): SeedProcess {
  if (process.state === "EXITED") return process;
  return { ...process, state: "EXITED", exitCode, ports: [], openFiles: [] };
}

export function crashSeedProcess(process: SeedProcess, fault: string): SeedProcess {
  if (process.state === "EXITED") return process;
  return { ...process, state: "CRASHED", fault, exitCode: 139, ports: [], openFiles: [] };
}

export function processCanUse(process: SeedProcess, capability: string): boolean {
  return process.state === "RUNNING" && process.capabilities.includes(capability);
}
