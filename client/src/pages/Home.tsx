/**
 * Style reminder: Seed OS is a diegetic Evidence Mesh, never a desktop clone.
 * The central command channel remains authoritative; the Matter Index and
 * Connection Lens are mouse-operable views of the same VFS and permissions.
 * Phosphor green is live output; amber is a clue; red is danger.
 */
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createSeedIndex, FilePayload, SeedFile, SeedIndex, listDirectory, normalizePath, resolveFile } from "@/lib/seedData";
import { loadSeedSession, saveSeedSession } from "@/lib/seedPersistence";
import { createInitialShipSystems, repairGenerator, repairLifeSupport, ShipSystemsState, tickShipSystems } from "@/lib/shipSystems";
import { compileSeedScript, runSeedScript, SeedScriptEffects } from "@/lib/seedScript";
import { closeNanoPanel, focusNanoPanel, nanoPanelStatus, pushNanoPanel, toggleNanoPanel, visibleNanoPanels, NanoPanel } from "@/lib/nanoPanels";
import { configureLofiGraph } from "@/lib/audioPipeline";

type Tone = "system" | "output" | "error" | "amber" | "prompt" | "dim";
type TerminalLine = { text: string; tone?: Tone };
type BootState = "RUNNING" | "HALTED" | "DIAGNOSTIC" | "SAFE_MODE" | "RECOVERY" | "BIOS";
type FirmwareFlags = { maintenancePort: boolean; ghostBus: boolean; cryo601: boolean; rootWrite: boolean; hiddenVolume: boolean; debugConsole: boolean };
type AudioState = { path?: string; source?: string; title?: string; artist?: string; duration?: string; status: "STOPPED" | "PLAYING" | "PAUSED" | "REMOTE" | "SOURCE_MISSING"; position: number; lofi: boolean };
type InstalledApp = { sourcePath: string; installedPath: string; installedAt: string; owner?: string };
type SeedWorkspaceProgram = { path: string; code: string[]; compiled: boolean; compiledAt?: string };
type RuntimeState = { energy: number; oxygen: number; hull: number; memory: number; network: "FRAGMENTED" | "STABLE"; authority: "GUEST" | "CREW" | "OFFICER" | "ROOT"; credentials: string[]; services: string[]; installedApps: InstalledApp[]; workspacePrograms: SeedWorkspaceProgram[]; authenticatedUsers: string[]; failedLogins: Record<string, number>; lockedUsers: string[]; recoveredPaths: string[]; boot: BootState; firmware: FirmwareFlags; mountedVolumes: string[]; nvram: Record<string, string>; bootSequence: number; audio: AudioState; systems: ShipSystemsState };
type SessionSnapshot = { version: 1; savedAt: string; cwd: string; runtime: RuntimeState; history: string[]; focusPath: string; lines: TerminalLine[] };

const initialRuntime: RuntimeState = { energy: 31, oxygen: 14, hull: 72, memory: 86, network: "FRAGMENTED", authority: "GUEST", credentials: [], services: [], installedApps: [], workspacePrograms: [], authenticatedUsers: [], failedLogins: {}, lockedUsers: [], recoveredPaths: [], boot: "RUNNING", firmware: { maintenancePort: false, ghostBus: false, cryo601: false, rootWrite: false, hiddenVolume: false, debugConsole: false }, mountedVolumes: ["/ship"], nvram: { BOOT_TARGET: "FALLBACK", POST: "FULL", DEBUG: "OFF" }, bootSequence: 0, audio: { status: "STOPPED", position: 0, lofi: true }, systems: createInitialShipSystems() };

const clearanceRank: Record<RuntimeState["authority"], number> = { GUEST: 0, CREW: 1, OFFICER: 2, ROOT: 3 };
const firmwareFlagMap: Record<string, keyof FirmwareFlags> = { MAINTENANCE_PORT: "maintenancePort", GHOST_BUS: "ghostBus", CRYO_601: "cryo601", ROOT_WRITE: "rootWrite", HIDDEN_VOLUME: "hiddenVolume", DEBUG_CONSOLE: "debugConsole" };

function initialLines(): TerminalLine[] {
  return [
    { text: "SEED OS v0.9.1 // FALLBACK SHELL", tone: "system" },
    { text: "VFS mounted READ_ONLY :: /ship", tone: "system" },
    { text: "PASSENGERS 600 :: FAMILIES 150 :: LANGUAGES 08", tone: "system" },
    { text: "MEMORY WIPE DETECTED :: neural_buffer_corrupted", tone: "error" },
    { text: "SUPPORT LIFE 14% :: capsule 601 has no owner", tone: "amber" },
    { text: "", tone: "dim" },
    { text: "stdin attached :: local command buffer ready", tone: "output" },
    { text: "session inherits legacy command aliases", tone: "dim" },
    { text: "firmware console locked :: POST key window not observed", tone: "dim" },
    { text: "", tone: "dim" },
  ];
}

type BootStep = { at: number; lines: TerminalLine[] };

const BOOT_STEPS: BootStep[] = [
  { at: 0, lines: [
    { text: "SEED FIRMWARE 0.9.1 // COLD START", tone: "system" },
    { text: "POWER RAIL ................. ONLINE", tone: "output" },
    { text: "POST CONTROLLER ............ WAIT", tone: "dim" },
  ] },
  { at: 5000, lines: [
    { text: "HARDWARE INITIALIZATION", tone: "system" },
    { text: "MEMORY CHECK ............... 65536 MB / PASS", tone: "output" },
    { text: "VFS /SHIP .................. MOUNT READ_ONLY", tone: "output" },
    { text: "SECTOR SCAN ................ 03 BAD / QUARANTINED", tone: "amber" },
  ] },
  { at: 10000, lines: [
    { text: "SEED CORP // SYSTEM TREE", tone: "system" },
    { text: "        ████████", tone: "output" },
    { text: "    ████████████████", tone: "output" },
    { text: "  █████  SEED  █████", tone: "output" },
    { text: "████████████████████████", tone: "output" },
    { text: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓", tone: "dim" },
  ] },
  { at: 15000, lines: [
    { text: "CRYOGENIC ARRAY SCAN", tone: "system" },
    { text: "CAPSULES 001—600 .......... RECORDS PRESENT", tone: "output" },
    { text: "CAPSULE 601 ............... OWNER NULL", tone: "amber" },
    { text: "NEURAL LINK ................ SIGNATURE UNRESOLVED", tone: "amber" },
  ] },
  { at: 25000, lines: [
    { text: "FATAL ERROR: Neural_Buffer_Corrupted", tone: "error" },
    { text: "MEMORY WIPE DETECTED :: IDENTITY HASH INCOMPLETE", tone: "error" },
    { text: "SUPPORT LIFE ................ 14% / RESERVE UNSTABLE", tone: "amber" },
  ] },
  { at: 30000, lines: [
    { text: "KERNEL PANIC // FALLBACK", tone: "error" },
    { text: "AUTHORITY .................. GUEST", tone: "amber" },
    { text: "STDIN ATTACHED ............. LOCAL COMMAND BUFFER READY", tone: "system" },
    { text: "FIRMWARE CONSOLE ........... LOCKED", tone: "dim" },
  ] },
];

function prompt(cwd: string, input = "", runtime?: RuntimeState) { const user = runtime?.authenticatedUsers.at(-1)?.toLowerCase() ?? "guest"; return `${user}@seed:${cwd}$${input ? ` ${input}` : ""}`; }

function identityLabel(value: string | undefined, index?: SeedIndex) {
  if (!value) return "SYSTEM";
  const member = index?.crew.find((candidate) => candidate.id === value || candidate.handle === value);
  return member ? `${member.handle} / ${member.name}` : value;
}

function renderBookPage(payload: Extract<FilePayload, { kind: "book" }>, requestedPage = 1): TerminalLine[] {
  const pages = payload.pages?.length ? payload.pages : [{ number: 1, heading: "CONTENTS", lines: payload.chapters }];
  const page = pages[Math.min(Math.max(1, requestedPage), pages.length) - 1];
  return [
    { text: `BOOK :: ${payload.title}`, tone: "system" },
    { text: `LANGUAGE :: ${payload.language}    LEVEL :: ${payload.level}    PAGE :: ${page.number}/${pages.length}`, tone: "dim" },
    { text: `AUTHOR   :: ${payload.author}`, tone: "output" },
    { text: `SUBJECT  :: ${payload.subject}`, tone: "output" },
    { text: "", tone: "dim" },
    { text: page.heading, tone: "amber" },
    { text: "", tone: "dim" },
    ...page.lines.map((line) => ({ text: line, tone: "output" as Tone })),
    { text: "", tone: "dim" },
    { text: `READER :: BOOK <path> <page 1-${pages.length}>`, tone: "dim" },
  ];
}

function renderPayload(payload: FilePayload, index?: SeedIndex): TerminalLine[] {
  if (payload.kind === "text") return [{ text: `LANGUAGE :: ${payload.language}`, tone: "dim" }, ...payload.lines.map((text) => ({ text, tone: "output" as Tone }))];
  if (payload.kind === "audio") return [{ text: `LANGUAGE :: ${payload.language}`, tone: "dim" }, { text: `AUDIO BUFFER :: ${payload.duration}`, tone: "system" }, ...(payload.audioType === "MUSIC" ? [{ text: `CONTAINER :: .MUS / ${payload.codec ?? "SEED-AUDIO"}`, tone: "dim" as Tone }, { text: `TITLE     :: ${payload.title ?? "UNNAMED"}`, tone: "output" as Tone }, { text: `ARTIST    :: ${payload.artist ?? "UNKNOWN"}`, tone: "output" as Tone }] : []), { text: "", tone: "dim" }, { text: payload.transcript, tone: "output" }];
  if (payload.kind === "visual") return [{ text: `LANGUAGE :: ${payload.language}`, tone: "dim" }, { text: payload.caption, tone: "system" }, { text: payload.alt, tone: "output" }, { text: "", tone: "dim" }, ...payload.telemetry.map((text) => ({ text, tone: "output" as Tone }))];
  if (payload.kind === "health") return [{ text: `LANGUAGE :: ${payload.language}`, tone: "dim" }, ...payload.vitals.map((vital) => ({ text: `${vital.label.padEnd(18)} : ${vital.value}`, tone: vital.status === "critical" ? "error" as Tone : vital.status === "warning" ? "amber" as Tone : "output" as Tone })), { text: "", tone: "dim" }, { text: payload.note, tone: "output" }];
  if (payload.kind === "incident") return [{ text: `LANGUAGE :: ${payload.language}`, tone: "dim" }, { text: `SEVERITY :: ${payload.severity}`, tone: payload.severity === "CRITICAL" ? "error" : "amber" }, ...payload.events.map((event) => ({ text: event, tone: "output" as Tone }))];
  if (payload.kind === "program") return [{ text: `PROGRAM :: ${payload.programType}`, tone: "system" }, { text: `LANGUAGE :: ${payload.language}`, tone: "dim" }, ...payload.code.map((line) => ({ text: line, tone: "output" as Tone })), ...(payload.action ? [{ text: `ACTION :: ${payload.action.label}`, tone: "amber" as Tone }, { text: `REQUIRES :: ${(payload.action.requires ?? []).join(", ") || "NONE"}`, tone: "dim" as Tone }] : [])];
  if (payload.kind === "book") return renderBookPage(payload);
  if (payload.kind === "message") return [{ text: `MESSAGE :: ${payload.channel} / ${payload.status}`, tone: payload.channel === "GHOST" ? "error" : "system" }, { text: `LANGUAGE :: ${payload.language}    SENT :: ${payload.sentAt}`, tone: "dim" }, { text: `FROM     :: ${identityLabel(payload.senderId, index)}`, tone: "output" }, { text: `TO       :: ${payload.recipientIds.map((recipient) => identityLabel(recipient, index)).join(", ") || "LOCAL"}`, tone: "output" }, { text: "", tone: "dim" }, ...payload.body.map((line) => ({ text: line, tone: "output" as Tone })), ...(payload.attachments.length ? [{ text: "", tone: "dim" as Tone }, { text: `ATTACHMENTS :: ${payload.attachments.join(" | ")}`, tone: "amber" as Tone }] : [])];
  return [{ text: `CREDENTIAL STORE :: ${payload.service}`, tone: "amber" }, { text: `LANGUAGE :: ${payload.language}`, tone: "dim" }, { text: `USERNAME : ${payload.username}`, tone: "output" }, { text: `SECRET   : ${payload.secret}`, tone: "amber" }, { text: `TARGET   : ${payload.target}`, tone: "output" }, { text: `HINT     : ${payload.hint}`, tone: "dim" }];
}

function openLines(file: SeedFile, index: SeedIndex, runtime: RuntimeState): TerminalLine[] {
  const owner = file.ownerId ? index.crew.find((member) => member.id === file.ownerId) : undefined;
  const header: TerminalLine[] = [
    { text: `OPEN ${file.path}`, tone: "system" },
    { text: `LAYER    :: ${file.layer}    LANGUAGE :: ${file.language}`, tone: "dim" },
    { text: `TYPE     :: ${file.extension} / ${file.kind.toUpperCase()}    SIZE :: ${file.size}`, tone: "dim" },
    ...(file.documentType ? [{ text: `DOC      :: ${file.documentType}    EVENT :: ${file.eventTime ?? file.updated}`, tone: "dim" as Tone }] : []),
    ...(file.department || file.accessTerminal ? [{ text: `SOURCE   :: ${file.department ?? "-"} / ${file.accessTerminal ?? "-"}`, tone: "dim" as Tone }] : []),
    ...(file.authorId || file.recipientIds?.length ? [{ text: `ROUTE    :: ${file.authorId ?? "SYSTEM"} -> ${(file.recipientIds ?? []).join(", ") || "LOCAL"}`, tone: "dim" as Tone }] : []),
    ...(file.supersedes ? [{ text: `REV      :: supersedes ${file.supersedes}`, tone: "amber" as Tone }] : []),
    ...(owner ? [{ text: `OWNER    :: ${owner.name} / ${owner.nationality} / ${owner.familyId}`, tone: "dim" as Tone }] : []),
    { text: "────────────────────────────────────────────────────────", tone: "dim" },
  ];
  const links = file.links.length ? [{ text: "", tone: "dim" as Tone }, { text: `LINKS    :: ${file.links.map((link) => `${link.label} (${link.target})`).join(" | ")}`, tone: "dim" as Tone }] : [];
  const hasClearance = clearanceRank[runtime.authority] >= clearanceRank[file.clearance];
  const hasAccount = Boolean(file.access && runtime.authenticatedUsers.includes(file.access.username));
  if (!hasClearance && !hasAccount && file.integrity !== "CORRUPTED") return [...header, { text: `ACCESS   :: DENIED / required ${file.clearance}`, tone: "error" }, { text: "payload not mounted for this session", tone: "dim" }];
  if (!hasClearance && !hasAccount && file.integrity === "CORRUPTED") return [...header, { text: `ACCESS   :: DENIED / required ${file.clearance}`, tone: "error" }, { text: "INTEGRITY :: CORRUPTED", tone: "error" }, ...(file.corruption ?? []).map((entry) => ({ text: entry, tone: "amber" as Tone })), { text: `ACCOUNT  :: ${file.access?.username ?? "UNKNOWN"}`, tone: "dim" }, { text: "payload not mounted for this session", tone: "dim" }, ...links];
  if (file.integrity === "CORRUPTED" && !runtime.recoveredPaths.includes(file.path)) return [...header, { text: "INTEGRITY :: CORRUPTED", tone: "error" }, ...(file.corruption ?? []).map((entry) => ({ text: entry, tone: "amber" as Tone })), { text: "payload unavailable", tone: "dim" }, ...links];
  const integrity = file.integrity && file.integrity !== "CLEAN" ? [{ text: `INTEGRITY :: ${file.integrity}`, tone: file.integrity === "ENCRYPTED" ? "amber" as Tone : "error" as Tone }, ...(file.corruption ?? []).map((entry) => ({ text: entry, tone: "dim" as Tone }))] : [];
  return [...header, ...integrity, ...renderPayload(file.payload, index), ...links];
}

function fileLine(file: SeedFile) { return `${file.name.padEnd(28)} ${file.extension.padEnd(6)} ${file.layer.padEnd(9)} ${file.language.padEnd(7)} ${file.size}`; }

function restoreSnapshot(snapshot: SessionSnapshot | null, index: SeedIndex): SessionSnapshot | null {
  if (!snapshot || snapshot.version !== 1 || !snapshot.runtime || typeof snapshot.runtime !== "object") return null;
  const runtime = snapshot.runtime;
  const installedApps = Array.isArray(runtime.installedApps) ? runtime.installedApps.filter((app) => Boolean(app && typeof app.sourcePath === "string" && typeof app.installedPath === "string")) : [];
  const workspacePrograms = Array.isArray(runtime.workspacePrograms) ? runtime.workspacePrograms.filter((program) => Boolean(program && typeof program.path === "string" && Array.isArray(program.code))).map((program) => ({ path: program.path, code: program.code.filter((line): line is string => typeof line === "string").slice(0, 160), compiled: Boolean(program.compiled), compiledAt: typeof program.compiledAt === "string" ? program.compiledAt : undefined })) : [];
  const sessionIndex = createRuntimeIndex(index, installedApps, workspacePrograms);
  const cwd = typeof snapshot.cwd === "string" && sessionIndex.directories.includes(snapshot.cwd) ? snapshot.cwd : "/";
  const focusPath = typeof snapshot.focusPath === "string" && sessionIndex.fileMap.has(snapshot.focusPath.toLowerCase()) ? snapshot.focusPath : "/BOOT.ATA";
  const audioFile = runtime.audio?.path ? sessionIndex.fileMap.get(runtime.audio.path.toLowerCase()) : undefined;
  const audioPayload = audioFile?.payload.kind === "audio" ? audioFile.payload : undefined;
  return {
    version: 1,
    savedAt: typeof snapshot.savedAt === "string" ? snapshot.savedAt : new Date().toISOString(),
    cwd,
    runtime: {
      ...initialRuntime,
      ...runtime,
      installedApps: Array.isArray(runtime.installedApps) ? runtime.installedApps.filter((app) => Boolean(app && typeof app.sourcePath === "string" && typeof app.installedPath === "string")) : [],
      workspacePrograms,
      firmware: { ...initialRuntime.firmware, ...(runtime.firmware ?? {}) },
      nvram: { ...initialRuntime.nvram, ...(runtime.nvram ?? {}) },
      systems: {
        ...initialRuntime.systems,
        ...(runtime.systems ?? {}),
        generators: runtime.systems?.generators ?? initialRuntime.systems.generators,
        buses: runtime.systems?.buses ?? initialRuntime.systems.buses,
        lifeSupport: { ...initialRuntime.systems.lifeSupport, ...(runtime.systems?.lifeSupport ?? {}) },
      },
      audio: {
        ...initialRuntime.audio,
        ...(runtime.audio ?? {}),
        source: audioPayload?.mediaSrc,
        title: runtime.audio?.title ?? audioPayload?.title,
        artist: runtime.audio?.artist ?? audioPayload?.artist,
        duration: runtime.audio?.duration ?? audioPayload?.duration,
        lofi: true,
      },
    },
    history: Array.isArray(snapshot.history) ? snapshot.history.filter((entry): entry is string => typeof entry === "string").slice(-80) : [],
    focusPath,
    lines: Array.isArray(snapshot.lines) ? snapshot.lines.slice(-320) : initialLines(),
  };
}

function workspaceProgramFile(program: SeedWorkspaceProgram): SeedFile {
  const slash = program.path.lastIndexOf("/");
  return { path: program.path, name: program.path.slice(slash + 1), extension: ".PROC", kind: "program", directory: slash <= 0 ? "/" : program.path.slice(0, slash), size: `${Math.max(1, Math.round(program.code.join("\n").length / 12))} B`, updated: program.compiledAt ?? "WORKSPACE", layer: "SYSTEM", language: "SEED-OPS", summary: `${program.compiled ? "Compiled" : "Source"} Seed Script workspace program.`, clearance: "GUEST", payload: { kind: "program", language: "SEED-OPS", programType: "SCRIPT", code: program.code }, links: [{ target: "/apps/ide.PROC", label: "IDE", relation: "editor" }], keywords: ["seed script", "workspace", "source", program.path], system: true };
}

function createRuntimeIndex(index: SeedIndex, installedApps: InstalledApp[], workspacePrograms: SeedWorkspaceProgram[] = []): SeedIndex {
  const workspaceFiles = workspacePrograms.map(workspaceProgramFile);
  const sourceFiles = [...index.files, ...workspaceFiles];
  const sourceMap = new Map(sourceFiles.map((file) => [file.path.toLowerCase(), file]));
  const installedFiles = installedApps.flatMap((app) => {
    const source = sourceMap.get(app.sourcePath.toLowerCase());
    if (!source || source.extension !== ".PROC" || source.payload.kind !== "program") return [];
    const slash = app.installedPath.lastIndexOf("/");
    const directory = slash <= 0 ? "/" : app.installedPath.slice(0, slash);
    const name = app.installedPath.slice(slash + 1);
    return [{ ...source, path: app.installedPath, directory, name, layer: "SYSTEM" as const, system: true, updated: "INSTALLED", summary: `Aplicativo instalado a partir de ${source.path}.`, links: [...source.links, { target: source.path, label: "SOURCE", relation: "origem do pacote" }] }];
  });
  const files = [...sourceFiles, ...installedFiles];
  const fileMap = new Map(files.map((file) => [file.path.toLowerCase(), file]));
  const directories = new Set(index.directories);
  workspaceFiles.forEach((file) => { let current = file.directory; while (current && current !== "/") { directories.add(current); current = current.slice(0, current.lastIndexOf("/")) || "/"; } });
  installedFiles.forEach((file) => { let current = file.directory; while (current && current !== "/") { directories.add(current); current = current.slice(0, current.lastIndexOf("/")) || "/"; } });
  const counts = { ...index.counts };
  installedFiles.forEach((file) => { counts[file.extension] += 1; });
  return { ...index, files, fileMap, directories: Array.from(directories).sort(), counts };
}

function resolveAppFile(index: SeedIndex, rawPath: string, cwd: string): SeedFile | undefined {
  return resolveFile(index, rawPath, cwd) ?? index.files.find((file) => file.directory === "/apps" && file.name.toLowerCase() === rawPath.trim().toLowerCase());
}

function snapshotForStorage(cwd: string, runtime: RuntimeState, history: string[], focusPath: string, lines: TerminalLine[]): SessionSnapshot {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    cwd,
    runtime: { ...runtime, audio: { ...runtime.audio, source: undefined } },
    history: history.slice(-80),
    focusPath,
    lines: lines.slice(-320),
  };
}

function tickRuntime(runtime: RuntimeState): RuntimeState {
  const tick = tickShipSystems(runtime.systems, { activeServices: runtime.services.length, audioPlaying: runtime.audio.status === "PLAYING", boot: runtime.boot });
  return { ...runtime, energy: Math.max(0, Math.min(100, runtime.energy + tick.energyDelta)), oxygen: Math.max(0, Math.min(100, runtime.oxygen + tick.oxygenDelta)), network: tick.network, systems: tick.systems };
}

function helpLines(): TerminalLine[] {
  return [
    { text: "COMMANDS // HYBRID SHELL", tone: "system" },
    { text: "LS / DIR [path]       list directory entries", tone: "output" },
    { text: "CD <path>             change directory", tone: "output" },
    { text: "PWD                  print working directory", tone: "output" },
    { text: "CAT / TYPE / OPEN     render a proprietary file", tone: "output" },
    { text: "LIBRARY [term]        list searchable .BOOK knowledge records", tone: "output" },
    { text: "BOOK <path> [page]     read a paginated .BOOK knowledge record", tone: "output" },
    { text: "MSG [INBOX|GHOST]      inspect official or unregistered messages", tone: "output" },
    { text: "TREE [path]           print a compact directory tree", tone: "output" },
    { text: "FIND / SEARCH <term>  search indexed paths and metadata", tone: "output" },
    { text: "DOCS [type]           list indexed corporate documents", tone: "output" },
    { text: "PASSENGER <term>      print a passenger record", tone: "output" },
    { text: "LANGUAGES             list passenger language distribution", tone: "output" },
    { text: "USE <service> <key>   apply a saved credential to a target", tone: "amber" },
    { text: "AUTH <user> <key>     attach a local user account", tone: "amber" },
    { text: "FSCK [path]           inspect file integrity", tone: "output" },
    { text: "RECOVER [path]        mount a recovered payload", tone: "amber" },
    { text: "REBOOT [mode]         restart into BIOS / DIAGNOSTIC / SAFE", tone: "amber" },
    { text: "BIOS [SET flag ON]    inspect or change firmware flags", tone: "amber" },
    { text: "NVRAM [SET k v]       inspect boot variables", tone: "output" },
    { text: "MOUNT / UMOUNT        attach or remove firmware volumes", tone: "output" },
    { text: "BOOT [mode]           leave firmware and start a mode", tone: "amber" },
    { text: "PLAY <file.MUS>       attach a music container to /dev/audio0", tone: "amber" },
    { text: "PAUSE / RESUME        control the active audio process", tone: "amber" },
    { text: "STOP                  terminate the active audio process", tone: "amber" },
    { text: "AUDIO / PLAYER        inspect audio process and device state", tone: "output" },
    { text: "RUN / EXEC / START    execute a .PROC program", tone: "amber" },
    { text: "EDIT <path>            open or modify a Seed Script workspace", tone: "amber" },
    { text: "COMPILE <path>         validate and derive a Seed Script .PROC", tone: "amber" },
    { text: "APPS                  list registered applications in /apps", tone: "system" },
    { text: "INSTALL <file.PROC>   register a discovered program in /apps", tone: "amber" },
    { text: "UNINSTALL <app.PROC> remove a user-installed application", tone: "amber" },
    { text: "SEED / STATUS         read live ship telemetry", tone: "output" },
    { text: "POWER / GENERATORS    inspect generator and bus state", tone: "output" },
    { text: "LIFE / O2             inspect life-support state", tone: "output" },
    { text: "SYSLOG / NOTICES      read buffered system notices", tone: "output" },
    { text: "REPAIR <target>       apply a maintenance procedure", tone: "amber" },
    { text: "WHOAMI / SUDO         inspect or request authority", tone: "output" },
    { text: "CLEAR / CLS            clear terminal output", tone: "output" },
    { text: "", tone: "dim" },
    { text: "legacy aliases: linux / dos / seed", tone: "dim" },
  ];
}

function runCommand(raw: string, cwd: string, index: SeedIndex, runtime: RuntimeState): { nextCwd: string; lines: TerminalLine[]; nextRuntime?: RuntimeState; focus?: string } {
  const input = raw.trim();
  const [command = "", ...args] = input.split(/\s+/);
  const normalized = command.toLowerCase();
  const arg = args.join(" ");
  const promptLine: TerminalLine = { text: prompt(cwd, input, runtime), tone: "prompt" };
  const result = (lines: TerminalLine[], extra: Partial<{ nextCwd: string; nextRuntime: RuntimeState; focus: string }> = {}) => {
    const baseRuntime = extra.nextRuntime ?? runtime;
    return { nextCwd: extra.nextCwd ?? cwd, lines: [promptLine, ...lines], ...extra, nextRuntime: tickRuntime(baseRuntime) };
  };
  if (!input) return result([]);
  if (["help", "?"].includes(normalized)) return result(helpLines());
  if (["clear", "cls"].includes(normalized)) return { nextCwd: cwd, lines: [] };
  const firmwareCommands = ["help", "?", "clear", "cls", "reboot", "bios", "nvram", "mount", "umount", "boot", "fsck", "check", "recover", "repair", "seed", "status", "power", "generators", "life", "o2", "syslog", "notices", "whoami", "pwd"];
  if (runtime.boot !== "RUNNING" && !firmwareCommands.includes(normalized)) return result([{ text: `shell: ${runtime.boot.toLowerCase()} state :: command bus unavailable`, tone: "error" }, { text: "firmware commands only", tone: "dim" }]);
  if (["pwd"].includes(normalized)) return result([{ text: cwd, tone: "output" }]);
  if (normalized === "reboot") {
    const requested = (args[0] ?? "normal").toLowerCase();
    const boot: BootState = requested === "bios" ? "BIOS" : requested === "diagnostic" || requested === "diag" ? "DIAGNOSTIC" : requested === "safe" || requested === "safe_mode" ? "SAFE_MODE" : requested === "recovery" ? "RECOVERY" : requested === "halt" ? "HALTED" : "RUNNING";
    const nextRuntime = { ...runtime, boot, bootSequence: runtime.bootSequence + 1, network: boot === "RUNNING" ? runtime.network : "FRAGMENTED" as const, services: boot === "RUNNING" ? runtime.services : [] };
    const lines: TerminalLine[] = [{ text: `REBOOT REQUEST :: ${boot}`, tone: "amber" }, { text: "power rail ............. cycle", tone: "dim" }, { text: "memory buffer .......... flushed", tone: "dim" }, { text: `POST sequence ........... ${nextRuntime.bootSequence.toString().padStart(4, "0")}`, tone: "system" }, { text: `BOOT STATE .............. ${boot}`, tone: boot === "RUNNING" ? "output" : "amber" }];
    if (boot === "BIOS") lines.push({ text: "SEED FIRMWARE CONSOLE :: NVRAM ACCESS AVAILABLE", tone: "system" });
    if (boot === "DIAGNOSTIC") lines.push({ text: "diagnostic devices enumerated :: hidden volumes not mounted", tone: "dim" });
    if (boot === "RECOVERY") lines.push({ text: "recovery image selected :: /recovery/seed-rescue", tone: "amber" });
    return result(lines, { nextRuntime });
  }
  if (normalized === "boot") {
    if (runtime.boot === "RUNNING") return result([{ text: "boot: system already running", tone: "dim" }]);
    const requested = (args[0] ?? runtime.nvram.BOOT_TARGET ?? "fallback").toLowerCase();
    const boot: BootState = requested === "diagnostic" || requested === "diag" ? "DIAGNOSTIC" : requested === "safe" ? "SAFE_MODE" : requested === "recovery" ? "RECOVERY" : "RUNNING";
    return result([{ text: `BOOT TARGET :: ${requested.toUpperCase()}`, tone: "system" }, { text: `kernel state :: ${boot}`, tone: boot === "RUNNING" ? "output" : "amber" }], { nextRuntime: { ...runtime, boot, mountedVolumes: boot === "RECOVERY" ? ["/recovery"] : runtime.mountedVolumes } });
  }
  if (normalized === "bios") {
    if (runtime.boot !== "BIOS") return result([{ text: `bios: firmware console unavailable :: state ${runtime.boot}`, tone: "error" }]);
    if ((args[0] ?? "").toLowerCase() === "set") {
      const flag = firmwareFlagMap[(args[1] ?? "").toUpperCase()];
      const value = (args[2] ?? "").toUpperCase();
      if (!flag || !["ON", "OFF"].includes(value)) return result([{ text: "bios: syntax :: BIOS SET <flag> ON|OFF", tone: "error" }]);
      if (flag === "rootWrite" && runtime.authority !== "ROOT") return result([{ text: "bios: write-protect :: ROOT authority required", tone: "error" }]);
      const firmware = { ...runtime.firmware, [flag]: value === "ON" };
      return result([{ text: `NVRAM WRITE :: ${(args[1] ?? "").toUpperCase()}=${value}`, tone: "amber" }], { nextRuntime: { ...runtime, firmware } });
    }
    return result([{ text: "SEED FIRMWARE / BIOS 0.9.1", tone: "system" }, { text: `BOOT_TARGET  : ${runtime.nvram.BOOT_TARGET}`, tone: "output" }, ...Object.entries(runtime.firmware).map(([key, value]) => ({ text: `${key.toUpperCase().padEnd(16)}: ${value ? "ON" : "OFF"}`, tone: value ? "amber" as Tone : "dim" as Tone }))]);
  }
  if (normalized === "nvram") {
    if (!["BIOS", "DIAGNOSTIC", "RECOVERY"].includes(runtime.boot)) return result([{ text: `nvram: protected :: state ${runtime.boot}`, tone: "error" }]);
    if ((args[0] ?? "").toLowerCase() === "set") {
      const key = (args[1] ?? "").toUpperCase();
      const value = args[2] ?? "";
      if (!(key in runtime.nvram) || !value) return result([{ text: `nvram: variable unavailable :: ${key || "<empty>"}`, tone: "error" }]);
      return result([{ text: `NVRAM WRITE :: ${key}=${value}`, tone: "amber" }], { nextRuntime: { ...runtime, nvram: { ...runtime.nvram, [key]: value } } });
    }
    return result(Object.entries(runtime.nvram).map(([key, value]) => ({ text: `${key.padEnd(14)} = ${value}`, tone: "output" as Tone })));
  }
  if (["mount", "umount"].includes(normalized)) {
    if (!["BIOS", "DIAGNOSTIC", "RECOVERY"].includes(runtime.boot)) return result([{ text: `${normalized}: firmware state required`, tone: "error" }]);
    const target = args[0] ?? "--all";
    if (normalized === "mount" && target === "/ghost" && !runtime.firmware.ghostBus) return result([{ text: "mount: ghost bus disabled in firmware", tone: "error" }]);
    if (normalized === "mount" && target === "/maintenance" && !runtime.firmware.maintenancePort) return result([{ text: "mount: maintenance port disabled in firmware", tone: "error" }]);
    if (normalized === "mount" && target === "/cryo601" && !runtime.firmware.cryo601) return result([{ text: "mount: cryo601 device hidden by firmware", tone: "error" }]);
    const mounted = normalized === "mount" ? Array.from(new Set([...runtime.mountedVolumes, ...(target === "--all" ? ["/recovery", ...(runtime.firmware.hiddenVolume ? ["/ghost"] : [])] : [normalizePath(target, cwd)])])) : runtime.mountedVolumes.filter((volume) => volume !== normalizePath(target, cwd));
    return result([{ text: `${normalized.toUpperCase()} ${target} :: ${normalized === "mount" ? "attached" : "detached"}`, tone: "system" }, { text: `volumes :: ${mounted.join(" ")}`, tone: "output" }], { nextRuntime: { ...runtime, mountedVolumes: mounted } });
  }
  if (["whoami"].includes(normalized)) { const user = runtime.authenticatedUsers.at(-1) ?? "GUEST"; return result([{ text: `${user} // identity hash ${user === "GUEST" ? "unresolved" : "attached"} // clearance ${runtime.authority}`, tone: "amber" }, { text: `session owner: ${user}`, tone: "dim" }]); }
  if (["seed", "status"].includes(normalized)) return result([{ text: `POWER ${runtime.energy.toFixed(1)}% | O2 ${runtime.oxygen.toFixed(1)}% | HULL ${runtime.hull}% | MEMORY ${runtime.memory}%`, tone: "amber" }, { text: `NETWORK ${runtime.network} | AUTHORITY ${runtime.authority} | BOOT ${runtime.boot}`, tone: runtime.network === "STABLE" ? "output" : "error" }, { text: `GEN ${runtime.systems.generators.filter((generator) => generator.state === "ONLINE").length}/${runtime.systems.generators.length} ONLINE | LIFE ${runtime.systems.lifeSupport.cycle} | FORECAST ${runtime.systems.lifeSupport.forecast}%`, tone: runtime.systems.lifeSupport.cycle === "RUNNING" ? "output" : "amber" }, { text: `${runtime.services.length} ship service(s) altered | ${runtime.credentials.length} credential(s) accepted | ${runtime.mountedVolumes.length} volume(s)`, tone: "dim" }, ...(runtime.systems.notices.at(-1) ? [{ text: `LAST EVENT :: ${runtime.systems.notices.at(-1)}`, tone: "dim" as Tone }] : [])]);
  if (["power", "generators"].includes(normalized)) return result([{ text: "POWER DISTRIBUTION // LIVE", tone: "system" }, ...runtime.systems.generators.map((generator) => ({ text: `${generator.id} ${generator.state.padEnd(8)} ${String(generator.health).padStart(3)}% ${String(generator.output).padStart(3)}kW :: ${generator.bus}${generator.fault ? ` // ${generator.fault}` : ""}`, tone: generator.state === "ONLINE" ? "output" as Tone : "amber" as Tone })), ...runtime.systems.buses.map((bus) => ({ text: `BUS ${bus.id.padEnd(5)} ${bus.state.padEnd(9)} LOAD ${bus.load.toFixed(1)}/${bus.capacity}kW`, tone: bus.state === "STABLE" ? "output" as Tone : "amber" as Tone }))]);
  if (["life", "o2"].includes(normalized)) return result([{ text: "LIFE SUPPORT // CONTROL READOUT", tone: "system" }, { text: `SCRUBBER-A :: ${runtime.systems.lifeSupport.scrubberA}`, tone: (runtime.systems.lifeSupport.scrubberA === "ONLINE" ? "output" : "amber") as Tone }, { text: `SCRUBBER-B :: ${runtime.systems.lifeSupport.scrubberB}`, tone: (runtime.systems.lifeSupport.scrubberB === "ONLINE" ? "output" : "amber") as Tone }, { text: `CYCLE      :: ${runtime.systems.lifeSupport.cycle}`, tone: (runtime.systems.lifeSupport.cycle === "RUNNING" ? "output" : "amber") as Tone }, { text: `FORECAST   :: ${runtime.systems.lifeSupport.forecast}%`, tone: "amber" }]);
  if (["syslog", "notices"].includes(normalized)) return result([{ text: "SYSTEM NOTICE BUFFER // LOCAL", tone: "system" }, ...(runtime.systems.notices.length ? runtime.systems.notices.slice(-12).map((notice, index) => ({ text: `${String(index + 1).padStart(2, "0")}  ${notice}`, tone: notice.includes("FAULT") || notice.includes("DESCENDING") ? "amber" as Tone : "dim" as Tone })) : [{ text: "buffer empty", tone: "dim" as Tone }])]);
  if (normalized === "repair") {
    const target = (args[0] ?? "").toUpperCase();
    if (!target) return result([{ text: "repair: target required", tone: "error" }]);
    if (!runtime.firmware.maintenancePort || !runtime.mountedVolumes.includes("/maintenance")) return result([{ text: "repair: maintenance channel unavailable", tone: "error" }, { text: "device: /maintenance // firmware port not mounted", tone: "dim" }]);
    const authorized = clearanceRank[runtime.authority] >= clearanceRank.OFFICER || runtime.credentials.includes("LOOP_02") || runtime.credentials.includes("BOTANY") || runtime.services.includes("ENGINEERING");
    if (!authorized) return result([{ text: "repair: operator clearance insufficient", tone: "error" }]);
    const repairedGenerator = repairGenerator(runtime.systems, target);
    if (repairedGenerator) return result([{ text: `maintenance procedure accepted :: ${target}`, tone: "system" }, { text: "controller checksum :: restored", tone: "output" }, { text: "generator state :: ONLINE", tone: "amber" }], { nextRuntime: { ...runtime, systems: repairedGenerator } });
    const repairedLife = repairLifeSupport(runtime.systems, target);
    if (repairedLife) return result([{ text: `maintenance procedure accepted :: ${target}`, tone: "system" }, { text: "life-support cycle :: state transition recorded", tone: "output" }], { nextRuntime: { ...runtime, systems: repairedLife } });
    return result([{ text: `repair: target unavailable or no procedure :: ${target}`, tone: "error" }]);
  }
  if (["audio", "player"].includes(normalized)) return result([{ text: "AUDIO DEVICE // /dev/audio0", tone: "system" }, { text: `STATE    :: ${runtime.audio.status}`, tone: runtime.audio.status === "PLAYING" ? "amber" : "output" }, { text: `FILE     :: ${runtime.audio.path ?? "<none>"}`, tone: "output" }, { text: `TITLE    :: ${runtime.audio.title ?? "<none>"}`, tone: "output" }, { text: `BUFFER   :: ${runtime.audio.position}s / ${runtime.audio.duration ?? "--"}`, tone: "dim" }]);
  if (["library", "books"].includes(normalized)) {
    const query = arg.toLowerCase();
    const books = index.files.filter((file) => {
      if (file.extension !== ".BOOK" || file.payload.kind !== "book") return false;
      return !query || [file.path, file.summary, file.language, file.payload.title, file.payload.author, file.payload.subject, file.payload.level, ...file.keywords].join(" ").toLowerCase().includes(query);
    }).slice(0, 48);
    return result([{ text: `LIBRARY INDEX // ${books.length} RECORD(S)${query ? ` :: ${query}` : ""}`, tone: "system" }, ...books.map((file) => ({ text: `${file.name.padEnd(38)} ${file.language.padEnd(8)} ${file.payload.kind === "book" ? file.payload.level.padEnd(7) : ""} P${String(file.payload.kind === "book" ? (file.payload.pages?.length ?? 1) : 1).padStart(2, "0")} :: ${file.payload.kind === "book" ? file.payload.subject : file.summary}`, tone: file.clearance === "GUEST" ? "output" as Tone : "amber" as Tone }))]);
  }
  if (normalized === "book") {
    const maybePage = args.at(-1);
    const pageNumber = maybePage && /^\d+$/.test(maybePage) ? Number(maybePage) : 1;
    const path = maybePage && /^\d+$/.test(maybePage) ? args.slice(0, -1).join(" ") : arg;
    const file = resolveFile(index, path, cwd);
    if (!file || file.extension !== ".BOOK" || file.payload.kind !== "book") return result([{ text: `book: knowledge record not found: ${path || "<empty>"}`, tone: "error" }]);
    const accessCheck = openLines(file, index, runtime);
    if (accessCheck.some((line) => line.text === "payload not mounted for this session" || line.text === "payload unavailable")) return result(accessCheck, { focus: file.path });
    return result(renderBookPage(file.payload, pageNumber), { focus: file.path });
  }
  if (["msg", "messages", "inbox"].includes(normalized)) {
    const mode = (args[0] ?? "INBOX").toUpperCase();
    if (mode === "OPEN") {
      const file = resolveFile(index, args.slice(1).join(" "), cwd);
      if (!file || file.extension !== ".MSG" || file.payload.kind !== "message") return result([{ text: `msg: message not found: ${args.slice(1).join(" ") || "<empty>"}`, tone: "error" }]);
      return result(openLines(file, index, runtime), { focus: file.path });
    }
    const channel = mode === "GHOST" ? "GHOST" : "OFFICIAL";
    const messages = index.files.filter((file) => file.extension === ".MSG" && file.payload.kind === "message" && file.payload.channel === channel).slice(0, 48);
    return result([{ text: `MESSAGE QUEUE // ${channel} // ${messages.length} RECORD(S)`, tone: channel === "GHOST" ? "error" : "system" }, ...messages.map((file) => ({ text: `${file.name.padEnd(38)} ${file.payload.kind === "message" ? file.payload.status.padEnd(8) : ""} ${file.payload.kind === "message" ? file.payload.sentAt : file.updated} :: ${file.path}`, tone: channel === "GHOST" ? "amber" as Tone : "output" as Tone }))]);
  }
  if (["apps", "applications"].includes(normalized)) {
    const apps = index.files.filter((file) => file.directory === "/apps" && file.extension === ".PROC");
    return result([{ text: "APPLICATION REGISTRY // /apps", tone: "system" }, { text: `${apps.length} executable(s) registered :: ${runtime.installedApps.length} user install(s)`, tone: "dim" }, ...apps.map((file) => ({ text: `${file.name.padEnd(28)} ${file.clearance.padEnd(8)} ${runtime.installedApps.some((app) => app.installedPath.toLowerCase() === file.path.toLowerCase()) ? "USER" : "SYSTEM"} :: ${file.summary}`, tone: file.clearance === "GUEST" ? "output" as Tone : "amber" as Tone }))]);
  }
  if (["install", "install-app"].includes(normalized)) {
    const source = resolveFile(index, arg, cwd);
    if (!source || source.extension !== ".PROC" || source.payload.kind !== "program") return result([{ text: `install: executable .PROC not found: ${arg || "<empty>"}`, tone: "error" }]);
    if (source.path.startsWith("/apps/")) return result([{ text: `install: already registered :: ${source.path}`, tone: "dim" }]);
    const hasAccount = Boolean(source.access && runtime.authenticatedUsers.includes(source.access.username));
    if (clearanceRank[runtime.authority] < clearanceRank[source.clearance] && !hasAccount) return result([{ text: `install: permission denied :: required ${source.clearance}`, tone: "error" }]);
    if (source.integrity === "CORRUPTED" && !runtime.recoveredPaths.includes(source.path)) return result([{ text: `install: package unreadable :: ${source.path}`, tone: "error" }]);
    const installedPath = `/apps/${source.ownerId ? `${source.ownerId}-${source.name}` : source.name}`;
    if (index.fileMap.has(installedPath.toLowerCase())) return result([{ text: `install: target reserved :: ${installedPath}`, tone: "error" }]);
    const installedApp: InstalledApp = { sourcePath: source.path, installedPath, installedAt: new Date().toISOString(), owner: runtime.authenticatedUsers.at(-1) };
    const nextRuntime = { ...runtime, installedApps: [...runtime.installedApps, installedApp] };
    return result([{ text: `INSTALL ${source.path}`, tone: "system" }, { text: `registry entry :: ${installedPath}`, tone: "output" }, { text: "application state :: REGISTERED / READY", tone: "amber" }], { nextRuntime, focus: installedPath });
  }
  if (["uninstall", "remove-app"].includes(normalized)) {
    const target = normalizePath(arg || "", cwd).toLowerCase();
    const installed = runtime.installedApps.find((app) => app.installedPath.toLowerCase() === target || app.installedPath.toLowerCase() === `/apps/${arg.trim().toLowerCase()}`);
    if (!installed) return result([{ text: `uninstall: user application not registered :: ${arg || "<empty>"}`, tone: "error" }]);
    const nextRuntime = { ...runtime, installedApps: runtime.installedApps.filter((app) => app.installedPath !== installed.installedPath) };
    return result([{ text: `UNINSTALL ${installed.installedPath}`, tone: "system" }, { text: "registry entry :: removed", tone: "output" }, { text: `source preserved :: ${installed.sourcePath}`, tone: "dim" }], { nextRuntime });
  }
  if (normalized === "edit") {
    const requested = args[0] ?? "/workspace/untitled.PROC";
    const path = normalizePath(requested, cwd).replace(/\.SCR$/i, ".PROC");
    const mode = (args[1] ?? "open").toLowerCase();
    const existing = runtime.workspacePrograms.find((program) => program.path.toLowerCase() === path.toLowerCase());
    const source = existing?.code ?? [];
    if (mode === "append") {
      const line = args.slice(2).join(" ");
      if (!line) return result([{ text: "edit: append requires one Seed Script source line", tone: "error" }]);
      const nextProgram: SeedWorkspaceProgram = { path, code: [...source, line].slice(-160), compiled: false };
      const nextRuntime = { ...runtime, workspacePrograms: [...runtime.workspacePrograms.filter((program) => program.path.toLowerCase() !== path.toLowerCase()), nextProgram] };
      return result([{ text: `SOURCE APPEND :: ${path}`, tone: "system" }, { text: line, tone: "output" }, { text: "compile state :: DIRTY", tone: "amber" }], { nextRuntime, focus: path });
    }
    if (mode === "clear") {
      const nextProgram: SeedWorkspaceProgram = { path, code: [], compiled: false };
      const nextRuntime = { ...runtime, workspacePrograms: [...runtime.workspacePrograms.filter((program) => program.path.toLowerCase() !== path.toLowerCase()), nextProgram] };
      return result([{ text: `SOURCE CLEAR :: ${path}`, tone: "system" }, { text: "buffer :: empty / compile required", tone: "dim" }], { nextRuntime, focus: path });
    }
    if (!existing) {
      const nextProgram: SeedWorkspaceProgram = { path, code: [], compiled: false };
      return result([{ text: `WORKSPACE OPEN :: ${path}`, tone: "system" }, { text: "buffer :: new / empty", tone: "output" }, { text: "syntax :: EDIT <path> APPEND <source line>", tone: "dim" }], { nextRuntime: { ...runtime, workspacePrograms: [...runtime.workspacePrograms, nextProgram] }, focus: path });
    }
    return result([{ text: `WORKSPACE OPEN :: ${path}`, tone: "system" }, { text: `compile state :: ${existing.compiled ? "COMPILED" : "DIRTY"}`, tone: existing.compiled ? "output" : "amber" }, ...existing.code.map((line, index) => ({ text: `${String(index + 1).padStart(3, "0")}  ${line}`, tone: "output" as Tone }))], { focus: path });
  }
  if (["compile", "build"].includes(normalized)) {
    const requested = args[0] ?? "";
    const normalizedTarget = normalizePath(requested, cwd).replace(/\.SCR$/i, ".PROC");
    const workspace = runtime.workspacePrograms.find((program) => program.path.toLowerCase() === normalizedTarget.toLowerCase());
    if (!workspace) return result([{ text: `compile: workspace source not found: ${requested || "<empty>"}`, tone: "error" }, { text: "use EDIT /workspace/name.PROC to create a source buffer", tone: "dim" }]);
    const compilation = compileSeedScript(workspace.code);
    const compileLines: TerminalLine[] = [{ text: `COMPILE ${workspace.path}`, tone: "system" }, ...(compilation.errors.length ? compilation.errors.map((error) => ({ text: error, tone: "error" as Tone })) : [{ text: "syntax :: accepted", tone: "output" as Tone }]), ...compilation.warnings.map((warning) => ({ text: warning, tone: "amber" as Tone }))];
    if (!compilation.ok) return result(compileLines, { focus: workspace.path });
    const compiledAt = new Date().toISOString();
    const nextProgram: SeedWorkspaceProgram = { ...workspace, code: compilation.code, compiled: true, compiledAt };
    const nextRuntime = { ...runtime, workspacePrograms: [...runtime.workspacePrograms.filter((program) => program.path.toLowerCase() !== workspace.path.toLowerCase()), nextProgram] };
    return result([...compileLines, { text: `entrypoint :: ${workspace.path}`, tone: "amber" }, { text: "artifact :: .PROC / READY", tone: "output" }], { nextRuntime, focus: workspace.path });
  }
  if (["play", "music"].includes(normalized)) {
    const target = args.length ? resolveFile(index, arg, cwd) : runtime.audio.path ? resolveFile(index, runtime.audio.path, cwd) : undefined;
    if (!target || target.extension !== ".MUS" || target.payload.kind !== "audio" || target.payload.audioType !== "MUSIC") return result([{ text: `play: .MUS container not found: ${arg || "<empty>"}`, tone: "error" }]);
    const hasClearance = clearanceRank[runtime.authority] >= clearanceRank[target.clearance];
    const hasAccount = Boolean(target.access && runtime.authenticatedUsers.includes(target.access.username));
    if (!hasClearance && !hasAccount) return result([{ text: `play: permission denied :: required ${target.clearance}`, tone: "error" }]);
    if (target.integrity === "CORRUPTED" && !runtime.recoveredPaths.includes(target.path)) return result([{ text: `play: container unreadable :: ${target.path}`, tone: "error" }]);
    const audio: AudioState = { path: target.path, source: target.payload.mediaSrc, title: target.payload.title ?? target.name, artist: target.payload.artist, duration: target.payload.duration, status: target.payload.remoteEmbed ? "REMOTE" : target.payload.mediaSrc ? "PLAYING" : "SOURCE_MISSING", position: 0, lofi: true };
    return result([{ text: `AUDIO OPEN :: ${target.path}`, tone: "system" }, { text: `DEVICE     :: /dev/audio0`, tone: "output" }, { text: `CONTAINER  :: ${target.payload.codec ?? "SEED-AUDIO"}`, tone: "dim" }, { text: target.payload.remoteEmbed ? "PLAYBACK   :: REMOTE CONTAINER / PRIVATE CHANNEL" : target.payload.mediaSrc ? `PLAYBACK   :: ${audio.title ?? "UNNAMED"}` : "SOURCE    :: NOT MOUNTED / metadata only", tone: target.payload.remoteEmbed || target.payload.mediaSrc ? "amber" : "dim" }], { nextRuntime: { ...runtime, audio } });
  }
  if (["pause", "resume", "stop"].includes(normalized)) {
    if (!runtime.audio.path) return result([{ text: `audio: no active process :: ${normalized}`, tone: "error" }]);
    const status: AudioState["status"] = normalized === "pause" ? "PAUSED" : normalized === "stop" ? "STOPPED" : runtime.audio.source ? "PLAYING" : runtime.audio.status === "REMOTE" ? "REMOTE" : "SOURCE_MISSING";
    return result([{ text: `AUDIO ${normalized.toUpperCase()} :: ${runtime.audio.path}`, tone: normalized === "stop" ? "dim" : "amber" }], { nextRuntime: { ...runtime, audio: { ...runtime.audio, status, ...(normalized === "stop" ? { position: 0 } : {}) } } });
  }
  if (normalized === "sudo") return result([{ text: "sudo: clearance required :: request denied", tone: "error" }]);
  if (["ls", "dir"].includes(normalized)) {
    const target = arg ? normalizePath(arg, cwd) : cwd;
    const entries = listDirectory(index, target);
    return result(entries.length ? entries.map((entry) => ({ text: entry.type === "dir" ? `<DIR>  ${entry.name}/` : fileLine(entry.file!), tone: entry.type === "dir" ? "system" as Tone : "output" as Tone })) : [{ text: `directory is empty or unavailable: ${target}`, tone: "error" }]);
  }
  if (normalized === "cd") {
    const target = normalizePath(arg || "/", cwd);
    return index.directories.includes(target) ? result([{ text: `mounted ${target}`, tone: "system" }], { nextCwd: target }) : result([{ text: `cd: no such directory: ${target}`, tone: "error" }]);
  }
  if (normalized === "tree") {
    const target = normalizePath(arg || cwd, cwd);
    const directories = index.directories.filter((path) => path === target || path.startsWith(`${target === "/" ? "" : target}/`)).slice(0, 28);
    return result(directories.map((path) => ({ text: `${path === target ? "" : "├─ "}${path}`, tone: "output" as Tone })));
  }
  if (["cat", "type", "open"].includes(normalized)) {
    const file = resolveFile(index, arg, cwd);
    return file ? result(openLines(file, index, runtime), { focus: file.path }) : result([{ text: `open: file not found: ${arg || "<empty>"}`, tone: "error" }]);
  }
  if (["find", "search"].includes(normalized)) {
    const query = arg.toLowerCase();
    const found = index.files.filter((file) => [file.path, file.summary, file.language, file.layer, file.documentType ?? "", file.eventTime ?? "", file.authorId ?? "", ...(file.recipientIds ?? []), file.department ?? "", file.accessTerminal ?? "", file.contradiction ?? "", ...file.keywords].join(" ").toLowerCase().includes(query)).slice(0, 24);
    return result([{ text: `${found.length} match(es) for ${query || "<empty>"}`, tone: "system" }, ...found.map((file) => ({ text: `${file.path} :: ${file.language} :: ${file.layer}`, tone: "output" as Tone }))]);
  }
  if (["docs", "records", "index"].includes(normalized)) {
    const type = args[0]?.toUpperCase();
    const docs = index.files.filter((file) => file.documentType && (!type || file.documentType.includes(type))).slice(0, 40);
    return result([{ text: `DOCUMENT INDEX :: ${docs.length} RECORD(S)`, tone: "system" }, ...docs.map((file) => ({ text: `${(file.eventTime ?? file.updated).padEnd(12)} ${(file.documentType ?? "FILE").padEnd(22)} ${file.path}`, tone: "output" as Tone }))]);
  }
  if (["fsck", "check"].includes(normalized)) {
    const file = resolveFile(index, arg, cwd);
    if (!file) return result([{ text: `fsck: path not found: ${arg || "<empty>"}`, tone: "error" }]);
    return result([{ text: `FSCK ${file.path}`, tone: "system" }, { text: `STATE      :: ${file.integrity ?? "CLEAN"}`, tone: file.integrity && file.integrity !== "CLEAN" ? "amber" : "output" }, ...(file.access ? [{ text: `ACCOUNT    :: ${file.access.username} / LOCKOUT ${file.access.lockoutAfter}`, tone: "dim" as Tone }] : []), ...(file.corruption ?? []).map((entry) => ({ text: entry, tone: "dim" as Tone }))]);
  }
  if (["recover", "repair"].includes(normalized)) {
    const file = resolveFile(index, arg, cwd);
    if (!file) return result([{ text: `recover: path not found: ${arg || "<empty>"}`, tone: "error" }]);
    if (!file.integrity || file.integrity === "CLEAN") return result([{ text: `recover: ${file.path} :: no recovery stream`, tone: "dim" }]);
    if (file.access && !runtime.authenticatedUsers.includes(file.access.username)) return result([{ text: `recover: account required :: ${file.access.username}`, tone: "error" }]);
    const nextRuntime = { ...runtime, recoveredPaths: Array.from(new Set([...runtime.recoveredPaths, file.path])) };
    return result([{ text: `recovery stream attached :: ${file.path}`, tone: "system" }, { text: `payload state :: ${file.integrity} / mounted`, tone: "output" }], { nextRuntime, focus: file.path });
  }
  if (normalized === "passenger") {
    const query = arg.toLowerCase();
    const member = index.crew.find((item) => [item.id, item.name, item.handle, item.familyId, item.familyName, item.nationality, item.language].join(" ").toLowerCase().includes(query));
    if (!member) return result([{ text: `passenger not found: ${arg}`, tone: "error" }]);
    const files = index.files.filter((file) => file.ownerId === member.id);
    return result([{ text: `${member.name} // ${member.handle}`, tone: "system" }, { text: `ID ${member.id} | FAMILY ${member.familyId} | ${member.nationality} | ${member.language}`, tone: "output" }, { text: `${member.role} / ${member.department} / ${member.status}`, tone: "output" }, ...files.map((file) => ({ text: file.path, tone: file.layer === "CORPORATE" ? "dim" as Tone : "output" as Tone }))], { focus: files[0]?.path });
  }
  if (normalized === "languages" || normalized === "lang") {
    const counts = index.crew.reduce<Record<string, number>>((acc, member) => { acc[member.language] = (acc[member.language] ?? 0) + 1; return acc; }, {});
    return result([{ text: "PASSENGER LANGUAGE INDEX", tone: "system" }, ...Object.entries(counts).map(([language, count]) => ({ text: `${language.padEnd(8)} ${String(count).padStart(3, "0")} passenger(s)`, tone: "output" as Tone }))]);
  }
  if (["auth", "login"].includes(normalized)) {
    const [username = "", secret = ""] = args;
    const target = index.files.find((file) => file.access?.username.toLowerCase() === username.toLowerCase());
    const account = target?.access;
    const key = account?.username ?? username.toUpperCase();
    const attempts = runtime.failedLogins[key] ?? 0;
    if (!account) return result([{ text: `auth: account not found :: ${username || "<empty>"}`, tone: "error" }]);
    if (runtime.lockedUsers.includes(account.username)) return result([{ text: `auth: account locked :: ${account.username}`, tone: "error" }]);
    if (account.secret.toLowerCase() !== secret.toLowerCase()) {
      const nextAttempts = attempts + 1;
      const locked = nextAttempts >= account.lockoutAfter;
      const nextRuntime = { ...runtime, failedLogins: { ...runtime.failedLogins, [account.username]: nextAttempts }, lockedUsers: locked ? Array.from(new Set([...runtime.lockedUsers, account.username])) : runtime.lockedUsers };
      return result([{ text: `auth: rejected :: attempt ${nextAttempts}/${account.lockoutAfter}`, tone: "error" }, ...(locked ? [{ text: "auth: account locked", tone: "error" as Tone }] : [])], { nextRuntime });
    }
    const authority = clearanceRank[account.authority] > clearanceRank[runtime.authority] ? account.authority : runtime.authority;
    const nextRuntime = { ...runtime, authority, authenticatedUsers: Array.from(new Set([...runtime.authenticatedUsers, account.username])), failedLogins: { ...runtime.failedLogins, [account.username]: 0 } };
    return result([{ text: `auth: session attached :: ${account.username}`, tone: "amber" }, { text: `clearance :: ${authority}`, tone: "system" }], { nextRuntime });
  }
  if (["use"].includes(normalized)) {
    const [service = "", secret = ""] = args;
    const credential = index.files.find((file) => { if (file.payload.kind !== "credential") return false; return file.payload.service.toLowerCase() === service.toLowerCase(); });
    if (!credential || credential.payload.kind !== "credential") return result([{ text: `use: service not found in saved credentials: ${service || "<empty>"}`, tone: "error" }]);
    if (credential.payload.secret.toLowerCase() !== secret.toLowerCase()) return result([{ text: `use: rejected // incorrect key for ${credential.payload.service}`, tone: "error" }]);
    const nextRuntime = { ...runtime, credentials: Array.from(new Set([...runtime.credentials, credential.payload.service])) };
    return result([{ text: `credential accepted :: ${credential.payload.service}`, tone: "amber" }, { text: `target available :: ${credential.payload.target}`, tone: "system" }], { nextRuntime });
  }
  if (["run", "exec", "start"].includes(normalized)) {
    const file = resolveAppFile(index, arg, cwd);
    if (!file || file.kind !== "program" || file.payload.kind !== "program") return result([{ text: `run: executable .PROC not found: ${arg || "<empty>"}`, tone: "error" }]);
    const hasAccount = Boolean(file.access && runtime.authenticatedUsers.includes(file.access.username));
    if (clearanceRank[runtime.authority] < clearanceRank[file.clearance] && !hasAccount) return result([{ text: `run: permission denied :: required ${file.clearance}`, tone: "error" }]);
    if (file.integrity === "CORRUPTED" && !runtime.recoveredPaths.includes(file.path)) return result([{ text: `run: binary unreadable :: ${file.path}`, tone: "error" }]);
    const workspace = runtime.workspacePrograms.find((program) => program.path.toLowerCase() === file.path.toLowerCase());
    if (workspace && !workspace.compiled) return result([{ text: `run: source not compiled :: ${file.path}`, tone: "error" }, { text: "compile the workspace artifact before execution", tone: "dim" }]);
    if (workspace) {
      let scriptSystems = runtime.systems;
      const scriptRead = (key: string) => {
        const values: Record<string, string | number | boolean> = { energy: runtime.energy, power: runtime.energy, oxygen: runtime.oxygen, o2: runtime.oxygen, hull: runtime.hull, network: runtime.network, authority: runtime.authority, memory: runtime.memory };
        return values[key.toLowerCase()] ?? "UNKNOWN";
      };
      const scriptRepair = (target: string) => {
        const normalizedTarget = target.toUpperCase();
        const authorized = runtime.firmware.maintenancePort && runtime.mountedVolumes.includes("/maintenance") && (clearanceRank[runtime.authority] >= clearanceRank.OFFICER || runtime.credentials.includes("LOOP_02") || runtime.credentials.includes("BOTANY") || runtime.services.includes("ENGINEERING"));
        if (!authorized) return { ok: false, output: [`REPAIR ${normalizedTarget} :: REJECTED / maintenance channel unavailable`], target: normalizedTarget };
        const repairedGenerator = repairGenerator(scriptSystems, normalizedTarget);
        if (repairedGenerator) { scriptSystems = repairedGenerator; return { ok: true, output: [`REPAIR ${normalizedTarget} :: ACCEPTED / generator online`], target: normalizedTarget }; }
        const repairedLife = repairLifeSupport(scriptSystems, normalizedTarget);
        if (repairedLife) { scriptSystems = repairedLife; return { ok: true, output: [`REPAIR ${normalizedTarget} :: ACCEPTED / life-support state transitioned`], target: normalizedTarget }; }
        return { ok: false, output: [`REPAIR ${normalizedTarget} :: REJECTED / procedure unavailable`], target: normalizedTarget };
      };
      const execution = runSeedScript(workspace.code, { read: scriptRead, repair: scriptRepair });
      const effect = execution.effects as SeedScriptEffects;
      const nextRuntime = { ...runtime, energy: Math.max(0, Math.min(100, runtime.energy + (effect.energy ?? 0))), oxygen: Math.max(0, Math.min(100, runtime.oxygen + (effect.oxygen ?? 0))), hull: Math.max(0, Math.min(100, runtime.hull + (effect.hull ?? 0))), network: effect.network ?? runtime.network, systems: scriptSystems, services: effect.service ? Array.from(new Set([...runtime.services, effect.service])) : runtime.services };
      return result([{ text: `SEED SCRIPT EXEC :: ${file.path}`, tone: "system" }, ...execution.output.map((text) => ({ text, tone: "output" as Tone })), ...execution.errors.map((error) => ({ text: error, tone: "error" as Tone }))], { nextRuntime, focus: file.path });
    }
    if (file.path.toLowerCase() === "/apps/ide.proc") return result([{ text: "SEED IDE 1.0 // WORKBENCH ATTACHED", tone: "system" }, { text: "SOURCE :: /workspace/*.PROC", tone: "output" }, { text: "EDIT <path> [APPEND|CLEAR]", tone: "amber" }, { text: "COMPILE <path> :: syntax / bounds / policy", tone: "amber" }, { text: "RUN <path> :: mediated execution", tone: "amber" }, { text: "INSTALL <path> :: register derived artifact", tone: "dim" }], { focus: file.path });
    if (file.path.toLowerCase() === "/apps/msg.proc") return result([{ text: "SEED MSG 2.2 // OFFICIAL QUEUE ATTACHED", tone: "system" }, { text: "QUEUE :: /comms/seed", tone: "output" }, { text: "MSG INBOX :: list official delivery records", tone: "amber" }, { text: "MSG OPEN <path> :: inspect body and attachments", tone: "amber" }, { text: "GHOST QUEUE :: excluded from official client", tone: "dim" }], { focus: file.path });
    const action = file.payload.action;
    if (!action) return result([{ text: `executing ${file.path}`, tone: "system" }, ...file.payload.code.map((line) => ({ text: line, tone: "output" as Tone }))]);
    const missing = (action.requires ?? []).filter((requirement) => !runtime.credentials.includes(requirement) && !runtime.services.includes(requirement) && !(requirement === "BOTANY" && file.ownerId === "passenger-600"));
    if (missing.length) return result([{ text: `execution blocked :: dependency unavailable [${missing.join(", ")}]`, tone: "error" }]);
    const effects = action.effects ?? {};
    const nextRuntime: RuntimeState = { ...runtime, energy: Math.max(0, runtime.energy + (effects.energy ?? 0)), oxygen: Math.min(100, runtime.oxygen + (effects.oxygen ?? 0)), hull: Math.min(100, runtime.hull + (effects.hull ?? 0)), network: effects.network ?? runtime.network, authority: effects.authority ?? runtime.authority, services: Array.from(new Set([...runtime.services, ...(effects.service ? [effects.service] : [] )])) };
    return result([{ text: `executing ${file.path}`, tone: "system" }, ...action.output.map((text) => ({ text, tone: "output" as Tone }))], { nextRuntime, focus: file.path });
  }
  if (normalized === "echo") return result([{ text: arg, tone: "output" }]);
  return result([{ text: `${command}: command not found // try HELP`, tone: "error" }]);
}

export default function Home() {
  const index = useMemo(createSeedIndex, []);
  const [cwd, setCwd] = useState("/");
  const [command, setCommand] = useState("");
  const [bootComplete, setBootComplete] = useState(false);
  const [bootPhase, setBootPhase] = useState(0);
  const [bootLines, setBootLines] = useState<TerminalLine[]>(BOOT_STEPS[0].lines);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [runtime, setRuntime] = useState<RuntimeState>(initialRuntime);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [focusPath, setFocusPath] = useState("/BOOT.ATA");
  const [nanoPanels, setNanoPanels] = useState<NanoPanel[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioGraphRef = useRef<{ context: AudioContext; source: MediaElementAudioSourceNode; lowpass: BiquadFilterNode; compressor: DynamicsCompressorNode; gain: GainNode } | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const restoredRef = useRef(false);
  const pendingSnapshotRef = useRef<SessionSnapshot | null>(null);
  const runtimeIndex = useMemo(() => createRuntimeIndex(index, runtime.installedApps), [index, runtime.installedApps]);
  const activeFile = runtimeIndex.fileMap.get(focusPath.toLowerCase());

  useEffect(() => {
    let alive = true;
    void loadSeedSession<SessionSnapshot>().then((snapshot) => {
      if (!alive) return;
      pendingSnapshotRef.current = restoreSnapshot(snapshot, index);
      setStorageReady(true);
    }).catch(() => {
      if (alive) setStorageReady(true);
    });
    return () => { alive = false; };
  }, [index]);

  useEffect(() => {
    if (bootComplete) return;
    const next = BOOT_STEPS[bootPhase + 1];
    if (!next) {
      setBootComplete(true);
      setLines(initialLines());
      return;
    }
    const timer = window.setTimeout(() => {
      setBootPhase((current) => current + 1);
      setBootLines((current) => [...current, ...next.lines]);
    }, next.at - BOOT_STEPS[bootPhase].at);
    return () => window.clearTimeout(timer);
  }, [bootComplete, bootPhase]);
  useEffect(() => {
    if (bootComplete) return;
    const interruptBoot = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setBootComplete(true);
      setBootPhase(BOOT_STEPS.length - 1);
      setLines(initialLines());
    };
    window.addEventListener("keydown", interruptBoot);
    return () => window.removeEventListener("keydown", interruptBoot);
  }, [bootComplete]);
  useEffect(() => { if (bootComplete) inputRef.current?.focus(); }, [bootComplete]);
  useEffect(() => { outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight }); }, [lines]);
  useEffect(() => {
    if (!bootComplete || !storageReady || restoredRef.current) return;
    const snapshot = pendingSnapshotRef.current;
    if (snapshot) {
      setCwd(snapshot.cwd);
      setRuntime(snapshot.runtime);
      setHistory(snapshot.history);
      setFocusPath(snapshot.focusPath);
      setLines(snapshot.lines);
    }
    restoredRef.current = true;
  }, [bootComplete, storageReady]);
  useEffect(() => {
    if (!bootComplete || !storageReady || !restoredRef.current) return;
    const snapshot = snapshotForStorage(cwd, runtime, history, focusPath, lines);
    void saveSeedSession(snapshot);
  }, [bootComplete, storageReady, cwd, runtime, history, focusPath, lines]);
  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;
    if (!bootComplete || !runtime.audio.source || !runtime.audio.path || runtime.audio.status === "REMOTE") {
      element.pause();
      return;
    }
    if (element.dataset.path !== runtime.audio.path) {
      element.src = runtime.audio.source;
      element.dataset.path = runtime.audio.path;
      element.currentTime = runtime.audio.position;
    }
    const AudioContextCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextCtor && !audioGraphRef.current) {
      const context = new AudioContextCtor();
      const source = context.createMediaElementSource(element);
      const lowpass = context.createBiquadFilter();
      const compressor = context.createDynamicsCompressor();
      const gain = context.createGain();
      configureLofiGraph(lowpass, compressor, gain);
      source.connect(lowpass).connect(compressor).connect(gain).connect(context.destination);
      audioGraphRef.current = { context, source, lowpass, compressor, gain };
    }
    if (runtime.audio.status === "PLAYING") {
      const graphContext = audioGraphRef.current?.context;
      if (graphContext?.state === "suspended") void graphContext.resume();
      void element.play().catch(() => undefined);
    } else {
      element.pause();
    }
  }, [bootComplete, runtime.audio]);
  useEffect(() => () => {
    const graph = audioGraphRef.current;
    if (graph) {
      graph.source.disconnect();
      graph.lowpass.disconnect();
      graph.compressor.disconnect();
      graph.gain.disconnect();
      void graph.context.close();
      audioGraphRef.current = null;
    }
  }, []);

  const executeCommand = (rawInput: string) => {
    const raw = rawInput.trim();
    if (!raw) return;
    const result = runCommand(raw, cwd, runtimeIndex, runtime);
    setCwd(result.nextCwd);
    setRuntime(result.nextRuntime ?? runtime);
    setLines((current) => raw.toLowerCase() === "clear" || raw.toLowerCase() === "cls" ? [] : [...current, ...result.lines]);
    if (result.focus) setFocusPath(result.focus);
    setHistory((current) => [...current.filter((entry) => entry !== raw), raw].slice(-80));
    setHistoryIndex(-1);
    setCommand("");
    const [verb, ...args] = raw.split(/\s+/);
    if (["run", "exec", "start"].includes(verb.toLowerCase())) {
      const app = resolveAppFile(runtimeIndex, args.join(" "), cwd);
      if (app?.extension === ".PROC") openNanoPanel(app.path);
    }
  };

  const openNanoPanel = (path: string) => {
    setNanoPanels((current) => pushNanoPanel(current, path));
    setFocusPath(path);
  };
  const closePanel = (path: string) => setNanoPanels((current) => closeNanoPanel(current, path));
  const togglePanel = (path: string) => setNanoPanels((current) => toggleNanoPanel(current, path));
  const focusPanel = (path: string) => { setNanoPanels((current) => focusNanoPanel(current, path)); setFocusPath(path); };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    executeCommand(command);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") { event.preventDefault(); setLines([]); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); const next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1); setHistoryIndex(next); setCommand(history[next] ?? ""); return; }
    if (event.key === "ArrowDown") { event.preventDefault(); const next = historyIndex < 0 ? -1 : historyIndex + 1; setHistoryIndex(next); setCommand(next >= 0 ? history[next] ?? "" : ""); return; }
    if (event.key === "Tab") { event.preventDefault(); const partial = command.split(/\s+/).pop()?.toLowerCase() ?? ""; const candidate = listDirectory(runtimeIndex, cwd).find((entry) => entry.name.toLowerCase().startsWith(partial)); if (candidate) setCommand(command.slice(0, command.length - partial.length) + candidate.name); }
  };

  const directoryEntries = useMemo(() => listDirectory(runtimeIndex, cwd), [runtimeIndex, cwd]);
  const appFiles = useMemo(() => runtimeIndex.files.filter((file) => file.directory === "/apps" && file.extension === ".PROC").slice(0, 5), [runtimeIndex]);
  const visibleLinks = activeFile?.links.slice(0, 6) ?? [];
  const selectedReadable = activeFile ? clearanceRank[runtime.authority] >= clearanceRank[activeFile.clearance] || Boolean(activeFile.access && runtime.authenticatedUsers.includes(activeFile.access.username)) : false;
  const inspectEntry = (entry: ReturnType<typeof listDirectory>[number]) => {
    if (entry.type === "dir") { executeCommand(`CD ${normalizePath(entry.name, cwd)}`); return; }
    if (!entry.file) return;
    setFocusPath(entry.file.path);
    executeCommand(`OPEN ${entry.file.path}`);
  };
  const traceLink = (target: string) => {
    setFocusPath(target);
    executeCommand(`OPEN ${target}`);
  };

  if (!bootComplete) {
    const progress = Math.round((BOOT_STEPS[bootPhase].at / BOOT_STEPS[BOOT_STEPS.length - 1].at) * 100);
    return <main className="terminal-app boot-app mesh-app">
      <header className="terminal-header"><div className="brand-lockup"><span className="brand-glyph">✣</span><div><strong>SEED OS</strong><span>FIRMWARE // COLD START</span></div></div><div className="header-readout"><span>POST: <b>ACTIVE</b></span><span>BUS: <b>LOCKED</b></span><span>PHASE: <b>{String(bootPhase + 1).padStart(2, "0")}/06</b></span></div></header>
      <div className="terminal-warning boot-warning"><span>● FIRMWARE STATE / NO USER SESSION</span><span className="warning-text">! IDENTITY HASH UNRESOLVED</span><span>VFS: READ_ONLY / BUS: LOCKED</span></div>
      <section className="evidence-mesh boot-evidence-mesh" aria-label="Seed OS pre-session evidence mesh">
        <aside className="mesh-panel matter-index boot-matter"><div className="mesh-panel-title"><span>MATTER INDEX</span><span>UNMOUNTED</span></div><div className="boot-static-index"><span className="signal-good">▱ /ship</span><span className="signal-amber">▱ /recovery</span><span className="signal-red">× /cryo601</span><span>· crew.registry</span><span>· neural.buffer</span></div><div className="mesh-index-stats"><span>VFS WAIT</span><span>BAD 03</span><span className="signal-amber">LINK OFF</span></div></aside>
        <section className="boot-window boot-command-channel"><div className="boot-title"><span>SEED FIRMWARE // HARDWARE INITIALIZATION</span><span>NO USER SESSION</span></div><div className="boot-output">{bootLines.map((line, indexLine) => <div key={`${indexLine}-${line.text}`} className={`terminal-line tone-${line.tone ?? "output"}`}><span className="line-prefix">{line.tone === "error" ? "!" : line.tone === "amber" ? "~" : "·"}</span><span>{line.text || "\u00a0"}</span></div>)}<div className="boot-progress"><span style={{ width: `${progress}%` }} /></div><div className="boot-progress-label">POST {String(progress).padStart(3, "0")}% :: COMMAND BUS LOCKED</div></div></section>
        <aside className="mesh-panel connection-lens boot-lens"><div className="mesh-panel-title"><span>CONNECTION LENS</span><span>LOCKED</span></div><div className="boot-lens-body"><span className="lens-extension signal-red">NULL</span><strong>NEURAL BUFFER</strong><small>CAPSULE_601 / owner: unresolved</small><div className="boot-lens-readout"><span>ACCESS <b className="signal-amber">GUEST</b></span><span>INTEGRITY <b className="signal-red">PARTIAL</b></span><span>TRACE <b className="signal-amber">PENDING</b></span></div><p>Projection lens awaits a mounted VFS object.</p></div></aside>
      </section>
      <footer className="terminal-footer"><span>SEED OS v0.9.1</span><span>FIRMWARE / POST</span><span>STDIN OFFLINE</span></footer>
    </main>;
  }

  return <main className="terminal-app mesh-app" onClick={() => inputRef.current?.focus()}>
    <header className="terminal-header"><div className="brand-lockup"><span className="brand-glyph">✣</span><div><strong>SEED OS</strong><span>SEED FIRMWARE // FALLBACK SHELL</span></div></div><div className="header-readout"><span>VFS: <b>READ_ONLY</b></span><span>PASSENGERS: <b>600</b></span><span>O2: <b className="danger">{runtime.oxygen.toFixed(1)}%</b></span></div></header>
    <div className="terminal-warning"><span>● {runtime.authenticatedUsers.at(-1) ?? "GUEST SESSION"} / {runtime.boot} SHELL</span><span className="warning-text">! NEURAL_BUFFER_CORRUPTED</span><span>FAMILY INDEX: 150 / LANGUAGE TABLE: 08</span></div>
    <section className="evidence-mesh" aria-label="Seed OS evidence mesh">
      <aside className="mesh-panel matter-index" aria-label="Matter Index">
        <div className="mesh-panel-title"><span>MATTER INDEX</span><span>VFS / PATH</span></div>
        <div className="mesh-path"><span>{cwd}</span><b>{String(directoryEntries.length).padStart(2, "0")} NODES</b></div>
        <div className="mesh-directory" role="list">
          {cwd !== "/" && <button type="button" className="mesh-entry parent-entry" onClick={() => executeCommand("CD ..")}><span className="entry-mark">↶</span><span>../</span><small>RETURN</small></button>}
          {directoryEntries.map((entry) => <button type="button" className={`mesh-entry ${entry.type === "dir" ? "is-directory" : ""} ${entry.file?.path === focusPath ? "is-focused" : ""}`} key={`${entry.type}-${entry.name}`} onClick={() => inspectEntry(entry)} role="listitem" aria-label={`${entry.type === "dir" ? "Abrir diretório" : "Inspecionar arquivo"} ${entry.name}`}>
            <span className="entry-mark">{entry.type === "dir" ? "▱" : entry.file?.extension === ".MUS" ? "≋" : entry.file?.extension === ".BOOK" ? "▤" : entry.file?.integrity === "CORRUPTED" ? "×" : "·"}</span>
            <span className="entry-name">{entry.name}{entry.type === "dir" ? "/" : ""}</span>
            <small>{entry.type === "dir" ? "SECTOR" : entry.file?.extension}</small>
          </button>)}
        </div>
        <div className="mesh-index-stats"><span>VOLUMES {runtime.mountedVolumes.length}</span><span>FILES {runtimeIndex.files.length}</span><span className={runtime.network === "STABLE" ? "signal-good" : "signal-amber"}>NET {runtime.network}</span></div>
      </aside>

      <section className="terminal-window command-channel">
        <div className="terminal-title"><span>COMMAND CHANNEL // {cwd}</span><span>PID 0001 // LOCAL EXECUTION</span></div>
        <div className="terminal-output" ref={outputRef}>{lines.map((line, indexLine) => <div key={`${indexLine}-${line.text}`} className={`terminal-line tone-${line.tone ?? "output"}`}><span className="line-prefix">{line.tone === "error" ? "!" : line.tone === "amber" ? "~" : line.tone === "prompt" ? ">" : "·"}</span><span>{line.text || "\u00a0"}</span></div>)}<div className="terminal-cursor-line"><span>{prompt(cwd, "", runtime)}</span><i /></div></div>
        <form className="terminal-input-row" onSubmit={submit}><span>{prompt(cwd, "", runtime)}</span><input ref={inputRef} value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={onKeyDown} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Seed OS command input" /><button type="submit">EXEC</button></form>
      </section>

      <aside className="mesh-panel connection-lens" aria-label="Connection Lens">
        <div className="mesh-panel-title"><span>CONNECTION LENS</span><span>FOCUS / 01</span></div>
        {activeFile ? <>
          <div className="lens-identity"><span className="lens-extension">{activeFile.extension}</span><div><strong>{activeFile.name}</strong><span>{activeFile.layer} // {activeFile.language}</span></div></div>
          <div className="lens-summary">{activeFile.summary}</div>
          <dl className="lens-metadata"><div><dt>PATH</dt><dd>{activeFile.path}</dd></div><div><dt>ACCESS</dt><dd className={selectedReadable ? "signal-good" : "signal-amber"}>{selectedReadable ? "MOUNTED" : `REQUIRES ${activeFile.clearance}`}</dd></div><div><dt>INTEGRITY</dt><dd className={activeFile.integrity === "CLEAN" || !activeFile.integrity ? "signal-good" : activeFile.integrity === "ENCRYPTED" ? "signal-amber" : "signal-red"}>{activeFile.integrity ?? "CLEAN"}</dd></div><div><dt>REVISION</dt><dd>{activeFile.updated}</dd></div></dl>
          <button type="button" className="lens-action" onClick={() => executeCommand(`OPEN ${activeFile.path}`)}><span>↳</span> PROJECT TO CHANNEL</button>
          <div className="lens-links-title">RELATION TRACES // {String(visibleLinks.length).padStart(2, "0")}</div>
          <div className="lens-links">{visibleLinks.length ? visibleLinks.map((link) => <button type="button" className={`trace-link signal-${link.signal ?? "clear"}`} key={`${link.label}-${link.target}`} onClick={() => traceLink(link.target)}><span>{link.relation}</span><strong>{link.label}</strong><small>{link.target}</small></button>) : <div className="trace-empty">No related traces indexed for this record.</div>}</div>
        </> : <div className="lens-empty">No VFS object is fixed to this lens. Select a trace from the Matter Index.</div>}
        <div className="nano-stack-title"><span>ACTIVE INSTRUMENTS</span><b>{String(nanoPanels.length).padStart(2, "0")}</b></div>
        <div className="nano-panel-stack">{nanoPanels.length ? visibleNanoPanels(nanoPanels).map((panel, indexPanel) => { const file = runtimeIndex.fileMap.get(panel.path.toLowerCase()); const isTop = indexPanel === 0; const code = file?.payload.kind === "program" ? file.payload.code.slice(0, 3) : []; return <article key={panel.path} className={`nano-panel ${isTop ? "is-top" : ""} ${panel.collapsed ? "is-collapsed" : ""}`}>
          <div className="nano-panel-head"><span className="nano-panel-index">{String(nanoPanels.length - indexPanel).padStart(2, "0")}</span><strong>{file?.name ?? panel.path}</strong><span className="nano-panel-state">{nanoPanelStatus(panel, indexPanel)}</span></div>
          <div className="nano-panel-path">{panel.path}</div>
          {!panel.collapsed && <div className="nano-panel-body"><div className="nano-panel-code">{code.length ? code.map((line, codeIndex) => <code key={`${codeIndex}-${line}`}>{line}</code>) : <span>PROCESS BUFFER ATTACHED</span>}</div><div className="nano-panel-actions"><button type="button" onClick={() => focusPanel(panel.path)}>FOCUS</button><button type="button" onClick={() => togglePanel(panel.path)}>PARK</button><button type="button" className="nano-close" onClick={() => closePanel(panel.path)}>CUT</button></div></div>}
        </article>; }) : <div className="nano-empty">NO ACTIVE PROCESS<br /><span>RUN A .PROC TO ATTACH AN INSTRUMENT</span></div>}</div>
      </aside>
    </section>
    <section className="instrument-rail" aria-label="Seed OS instruments">
      <div className="rail-label"><span>INSTRUMENT BUS</span><b>LOCAL</b></div>
      <div className="audio-instrument"><span className="instrument-glyph">≋</span><div><strong>{runtime.audio.title ?? "AUDIO CHANNEL / IDLE"}</strong><small>{runtime.audio.path ?? "No .MUS container attached to /dev/audio0"}</small></div><span className={`audio-state state-${runtime.audio.status.toLowerCase()}`}>{runtime.audio.status}</span>{runtime.audio.path && <button type="button" onClick={() => executeCommand(runtime.audio.status === "PLAYING" ? "PAUSE" : "RESUME")}>{runtime.audio.status === "PLAYING" ? "HOLD" : "FLOW"}</button>}{runtime.audio.path && <button type="button" onClick={() => executeCommand("STOP")}>CUT</button>}{runtime.audio.status === "REMOTE" && <span className="remote-audio-note">REMOTE CHANNEL / MASKED</span>}</div>{runtime.audio.status === "REMOTE" && runtime.audio.path && (() => { const remote = runtimeIndex.fileMap.get(runtime.audio.path.toLowerCase())?.payload; return remote?.kind === "audio" && remote.remoteEmbed ? <iframe className="remote-audio-frame" title="Seed OS remote audio channel" src={remote.remoteEmbed} allow="autoplay; encrypted-media" /> : null; })()}
      <div className="app-instruments">{appFiles.length ? appFiles.map((app) => <button type="button" key={app.path} className="app-instrument" onClick={() => executeCommand(`RUN ${app.path}`)}><span>◫</span><strong>{app.name.replace(".PROC", "")}</strong><small>ATTACH</small></button>) : <span className="app-absence">NO REGISTERED .PROC INSTRUMENTS</span>}</div>
    </section>
    <audio ref={audioRef} preload="metadata" aria-label="Seed OS audio device" />
    <footer className="terminal-footer"><span>SEED OS v0.9.1</span><span>{runtime.boot} / {runtime.network}</span><span>AUDIO: {runtime.audio.status}</span><span>{activeFile?.extension ?? ".SYS"} // {runtime.authority}</span></footer>
  </main>;
}
