/**
 * Style reminder: these are machine states, not game objectives. Keep labels
 * terse, diagnostic and cross-referenceable from the Seed OS VFS.
 */

export type GeneratorState = "ONLINE" | "STANDBY" | "FAULT" | "OFFLINE";
export type BusState = "STABLE" | "DEGRADED" | "OFFLINE";

export interface GeneratorUnit {
  id: string;
  label: string;
  bus: string;
  state: GeneratorState;
  health: number;
  output: number;
  fault?: string;
}

export interface PowerBus {
  id: string;
  state: BusState;
  load: number;
  capacity: number;
}

export interface LifeSupportState {
  scrubberA: "ONLINE" | "FAULT" | "OFFLINE";
  scrubberB: "ONLINE" | "FAULT" | "OFFLINE";
  cycle: "RUNNING" | "PAUSED" | "DEGRADED";
  forecast: number;
}

export interface ShipSystemsState {
  clock: number;
  generators: GeneratorUnit[];
  buses: PowerBus[];
  lifeSupport: LifeSupportState;
  notices: string[];
  lastNoticeAt: number;
}

export type ShipTickInput = {
  activeServices: number;
  audioPlaying: boolean;
  boot: "RUNNING" | "HALTED" | "DIAGNOSTIC" | "SAFE_MODE" | "RECOVERY" | "BIOS";
};

export type ShipTickResult = {
  systems: ShipSystemsState;
  energyDelta: number;
  oxygenDelta: number;
  network: "FRAGMENTED" | "STABLE";
};

export function createInitialShipSystems(): ShipSystemsState {
  return {
    clock: 0,
    generators: [
      { id: "GEN-01", label: "PRIMARY FUSION", bus: "MAIN", state: "ONLINE", health: 68, output: 58 },
      { id: "GEN-02", label: "AUXILIARY TURBINE", bus: "AUX", state: "FAULT", health: 19, output: 0, fault: "controller checksum mismatch" },
      { id: "GEN-03", label: "LIFE SUPPORT CELL", bus: "LIFE", state: "STANDBY", health: 51, output: 20 },
    ],
    buses: [
      { id: "MAIN", state: "STABLE", load: 44, capacity: 72 },
      { id: "AUX", state: "OFFLINE", load: 0, capacity: 28 },
      { id: "LIFE", state: "DEGRADED", load: 18, capacity: 20 },
    ],
    lifeSupport: { scrubberA: "ONLINE", scrubberB: "FAULT", cycle: "DEGRADED", forecast: 14 },
    notices: ["LIFE.O2.DRIFT", "PWR.GEN.02.FAULT", "MEM.SECTOR.03.BAD"],
    lastNoticeAt: 0,
  };
}

function clamp(value: number, min = 0, max = 100) { return Math.min(max, Math.max(min, value)); }

function pushNotice(systems: ShipSystemsState, notice: string): ShipSystemsState {
  if (systems.notices.at(-1) === notice || systems.notices.includes(notice)) return systems;
  return { ...systems, notices: [...systems.notices, notice].slice(-24), lastNoticeAt: systems.clock };
}

export function tickShipSystems(systems: ShipSystemsState, input: ShipTickInput): ShipTickResult {
  const clock = systems.clock + (input.boot === "RUNNING" ? 1 : 0);
  const runningGenerators = systems.generators.filter((generator) => generator.state === "ONLINE");
  const generated = runningGenerators.reduce((sum, generator) => sum + generator.output, 0);
  const demand = 48 + input.activeServices * 3 + (input.audioPlaying ? 2 : 0);
  const shortfall = Math.max(0, demand - generated);
  let energyDelta = input.boot === "RUNNING" ? -(0.18 + shortfall * 0.025) : -0.03;

  const life = systems.lifeSupport;
  const lifeOnline = life.scrubberA === "ONLINE" && life.scrubberB === "ONLINE";
  const lifePartial = life.scrubberA !== "OFFLINE" || life.scrubberB !== "OFFLINE";
  let oxygenDelta = input.boot === "RUNNING" ? (life.cycle === "RUNNING" && lifeOnline ? 0.08 : lifePartial ? -0.18 : -0.42) : 0;
  let next = { ...systems, clock, buses: systems.buses.map((bus) => ({ ...bus })) };

  next.buses = next.buses.map((bus) => {
    const busOutput = runningGenerators.filter((generator) => generator.bus === bus.id).reduce((sum, generator) => sum + generator.output, 0);
    const state: BusState = busOutput === 0 ? "OFFLINE" : busOutput < bus.load ? "DEGRADED" : "STABLE";
    return { ...bus, state, load: clamp(bus.load + (input.boot === "RUNNING" ? 0.04 : 0), 0, bus.capacity) };
  });

  if (shortfall > 0) next = pushNotice(next, "PWR.BUS.LOAD_SHED");
  if (next.generators.some((generator) => generator.state === "FAULT")) next = pushNotice(next, "PWR.GEN.FAULT_PRESENT");
  if (!lifeOnline) next = pushNotice(next, "LIFE.O2.DRIFT");
  if (oxygenDelta < -0.3) next = pushNotice(next, "LIFE.RESERVE.DESCENDING");
  if (energyDelta < -0.7) next = pushNotice(next, "PWR.RESERVE.DESCENDING");

  const network = next.buses.find((bus) => bus.id === "MAIN")?.state === "STABLE" && next.buses.find((bus) => bus.id === "LIFE")?.state !== "OFFLINE" ? "STABLE" : "FRAGMENTED";
  return { systems: next, energyDelta, oxygenDelta, network };
}

export function repairGenerator(systems: ShipSystemsState, id: string): ShipSystemsState | null {
  const target = systems.generators.find((generator) => generator.id === id.toUpperCase());
  if (!target || target.state === "ONLINE") return null;
  const generators = systems.generators.map((generator) => generator.id === target.id ? { ...generator, state: "ONLINE" as const, health: Math.max(generator.health, 62), output: generator.id === "GEN-02" ? 26 : generator.output, fault: undefined } : generator);
  return { ...systems, generators, notices: systems.notices.filter((notice) => !notice.includes(target.id.replace("-", "."))).concat("PWR.REPAIR.APPLIED").slice(-24) };
}

export function repairLifeSupport(systems: ShipSystemsState, target: string): ShipSystemsState | null {
  const normalized = target.toUpperCase();
  if (normalized === "RING-04" || normalized === "BOTANY") return { ...systems, lifeSupport: { ...systems.lifeSupport, cycle: "RUNNING", forecast: Math.max(systems.lifeSupport.forecast, 28) }, notices: [...systems.notices, "LIFE.RING04.CYCLE_RESTORED"].slice(-24) };
  if (normalized === "SCRUBBER-B" || normalized === "SCRUBBER_B") return { ...systems, lifeSupport: { ...systems.lifeSupport, scrubberB: "ONLINE", cycle: systems.lifeSupport.scrubberA === "ONLINE" ? "RUNNING" : "DEGRADED" }, notices: [...systems.notices, "LIFE.SCRUBBER.B_RESTORED"].slice(-24) };
  return null;
}
