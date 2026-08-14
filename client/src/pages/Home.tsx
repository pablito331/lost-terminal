/**
 * Style reminder: this page is the Seed OS workbench. Every panel should feel
 * like a physical monitor in a derelict ship: phosphor green for live data,
 * amber for clues, red for system danger, and no decorative UI without a job.
 */
import { CSSProperties, FormEvent, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUp, Brackets, ChevronRight, CircleDot, Clock3, Code2,
  Command, Database, Eye, FileAudio, FileHeart, FileImage, FileText, Folder, FolderOpen,
  HardDrive, HeartPulse, Link2, LockKeyhole, Network, Play, RadioTower, Search, Settings2,
  ShieldAlert, SquareTerminal, Terminal, UserRound, Wifi, Zap,
} from "lucide-react";
import {
  createSeedIndex, FileExtension, SeedFile, SeedIndex, SeedLink, listDirectory, normalizePath,
  resolveFile,
} from "@/lib/seedData";

type LineTone = "system" | "output" | "error" | "amber" | "prompt";
type TerminalLine = { text: string; tone: LineTone };

const assetConsoleTexture = "/manus-storage/seed-os-console-texture_c28f1581.png";
const assetMark = "/manus-storage/seed-os-mark_e3d89b61.png";

const extensionMeta: Record<FileExtension, { color: string; label: string; icon: typeof FileText }> = {
  ".SCR": { color: "mint", label: "SCRIPTUM", icon: FileText },
  ".REC": { color: "amber", label: "RECORDING", icon: FileAudio },
  ".VIS": { color: "cyan", label: "VISUAL", icon: FileImage },
  ".HLT": { color: "red", label: "HEALTH", icon: FileHeart },
  ".ATA": { color: "orange", label: "ACTA", icon: ShieldAlert },
  ".PROC": { color: "violet", label: "PROGRAM", icon: Code2 },
};

const categoryMeta = [
  { label: "COMMAND", value: "070", color: "mint" },
  { label: "ENGINEERING", value: "210", color: "cyan" },
  { label: "SCIENCE / MED", value: "140", color: "amber" },
  { label: "CRYO COLONISTS", value: "280", color: "dim" },
];

function fileIcon(file?: SeedFile, size = 14) {
  if (!file) return <Folder size={size} strokeWidth={1.5} />;
  const Icon = extensionMeta[file.extension].icon;
  return <Icon size={size} strokeWidth={1.5} />;
}

function toneClass(tone: LineTone) {
  return tone === "error" ? "tone-error" : tone === "amber" ? "tone-amber" : tone === "system" ? "tone-system" : tone === "prompt" ? "tone-prompt" : "tone-output";
}

function fileExtension(path: string) {
  return path.slice(path.lastIndexOf(".")).toUpperCase() as FileExtension;
}

function formatCount(value: number) {
  return String(value).padStart(3, "0");
}

function initialTerminalLines(): TerminalLine[] {
  return [
    { text: "SEED OS v0.9.1 // FALLBACK SHELL", tone: "system" },
    { text: "VFS mounted READ_ONLY :: /ship", tone: "system" },
    { text: "MEMORY WIPE DETECTED :: neural_buffer_corrupted", tone: "error" },
    { text: "SUPPORT LIFE 14% :: capsule 701 has no owner", tone: "amber" },
    { text: "", tone: "output" },
    { text: "TRACE 001 :: manifest checksum / 700 -> 701 [MISMATCH]", tone: "output" },
    { text: "TRACE 002 :: command authority revoked / local process", tone: "output" },
    { text: "TRACE 003 :: hidden heat draw / engineering loop 02", tone: "amber" },
    { text: "TRACE 004 :: neural owner hash / 7F-A1-??-C0", tone: "error" },
    { text: "", tone: "output" },
    { text: "Type HELP for available commands. No tutorial loaded.", tone: "output" },
  ];
}

function renderFileLines(file: SeedFile): string[] {
  if (file.payload.kind === "text") return file.payload.lines;
  if (file.payload.kind === "health") return ["BIOMETRIC RECORD", ...file.payload.vitals.map((item) => `${item.label.padEnd(16, " ")} : ${item.value}`), "", file.payload.note];
  if (file.payload.kind === "incident") return file.payload.events;
  if (file.payload.kind === "program") return file.payload.code;
  if (file.payload.kind === "audio") return [`AUDIO RECORDING // ${file.payload.duration}`, "", file.payload.transcript];
  return [file.payload.caption, "", ...file.payload.telemetry];
}

function runCommand(rawInput: string, cwd: string, index: SeedIndex, openFile: (file: SeedFile) => void): { nextCwd: string; lines: TerminalLine[] } {
  const input = rawInput.trim();
  const [command = "", ...args] = input.split(/\s+/);
  const normalizedCommand = command.toLowerCase();
  const arg = args.join(" ");
  const promptLine: TerminalLine = { text: `guest@seed:${cwd}$ ${input}`, tone: "prompt" };

  if (!input) return { nextCwd: cwd, lines: [promptLine] };
  if (["help", "?"].includes(normalizedCommand)) return { nextCwd: cwd, lines: [promptLine, { text: "LS / DIR     list directory entries", tone: "output" }, { text: "CD <path>    change directory", tone: "output" }, { text: "CAT / OPEN   render a proprietary file", tone: "output" }, { text: "FIND <term>  trace names, paths, or keywords", tone: "output" }, { text: "SEED         read critical ship telemetry", tone: "output" }, { text: "SUDO         request elevated clearance", tone: "output" }, { text: "CLEAR        clear the active terminal", tone: "output" }] };
  if (normalizedCommand === "clear") return { nextCwd: cwd, lines: [] };
  if (normalizedCommand === "pwd") return { nextCwd: cwd, lines: [promptLine, { text: cwd, tone: "output" }] };
  if (normalizedCommand === "whoami") return { nextCwd: cwd, lines: [promptLine, { text: "GUEST // identity hash unresolved // clearance 00", tone: "amber" }] };
  if (normalizedCommand === "seed") return { nextCwd: cwd, lines: [promptLine, { text: "POWER 31% | O2 14% | HULL 72% | MEMORY 86% | NET fragmented", tone: "amber" }, { text: "3 private channels omitted from public telemetry.", tone: "error" }] };
  if (normalizedCommand === "sudo") return { nextCwd: cwd, lines: [promptLine, { text: "sudo: clearance required. Try tracing the owner chain first.", tone: "error" }] };
  if (["ls", "dir"].includes(normalizedCommand)) {
    const entries = listDirectory(index, cwd);
    return { nextCwd: cwd, lines: [promptLine, ...entries.map((entry) => ({ text: `${entry.type === "dir" ? "DIR " : "FILE"}  ${entry.name}${entry.file ? `  ${entry.file.size}` : ""}`, tone: entry.type === "dir" ? "system" : "output" } as TerminalLine))] };
  }
  if (normalizedCommand === "cd") {
    const next = normalizePath(arg || "/", cwd);
    const isDirectory = index.directories.includes(next);
    return isDirectory ? { nextCwd: next, lines: [promptLine, { text: `mounted ${next}`, tone: "system" }] } : { nextCwd: cwd, lines: [promptLine, { text: `cd: no such directory: ${next}`, tone: "error" }] };
  }
  if (["cat", "open"].includes(normalizedCommand)) {
    const file = resolveFile(index, arg, cwd);
    if (!file) return { nextCwd: cwd, lines: [promptLine, { text: `open: file not found: ${arg || "<empty>"}`, tone: "error" }] };
    openFile(file);
    return { nextCwd: cwd, lines: [promptLine, { text: `OPEN ${file.path} :: ${file.summary}`, tone: "system" }, ...renderFileLines(file).slice(0, 8).map((text) => ({ text, tone: "output" as LineTone }))] };
  }
  if (normalizedCommand === "find") {
    const query = arg.toLowerCase();
    const results = index.files.filter((file) => [file.path, file.summary, ...file.keywords].join(" ").toLowerCase().includes(query)).slice(0, 12);
    return { nextCwd: cwd, lines: [promptLine, { text: `${results.length} match(es) for ${query || "<empty>"}`, tone: "system" }, ...results.map((file) => ({ text: `${file.path} :: ${file.extension}`, tone: "output" as LineTone }))] };
  }
  if (normalizedCommand === "calc") {
    const expression = arg.replace(/[^0-9a-fA-Fx+\-*/(). ]/g, "");
    if (!expression) return { nextCwd: cwd, lines: [promptLine, { text: "calc: supply a hexadecimal or arithmetic expression", tone: "error" }] };
    try { return { nextCwd: cwd, lines: [promptLine, { text: `normalized value :: ${Function(`"use strict";return (${expression.replace(/0x[0-9a-f]+/gi, (match) => String(parseInt(match, 16)))})`)()}`, tone: "amber" }] }; } catch { return { nextCwd: cwd, lines: [promptLine, { text: "calc: invalid expression", tone: "error" }] }; }
  }
  return { nextCwd: cwd, lines: [promptLine, { text: `${command}: command not found // try HELP`, tone: "error" }] };
}

function RelationLink({ relation, onOpen }: { relation: SeedLink; onOpen: (target: string) => void }) {
  return <button className={`relation-link relation-${relation.signal ?? "clear"}`} onClick={() => onOpen(relation.target)}><Link2 size={12} /><span>{relation.label}</span><small>{relation.relation}</small><ChevronRight size={12} /></button>;
}

function Inspector({ file, index, onOpen }: { file?: SeedFile; index: SeedIndex; onOpen: (path: string) => void }) {
  if (!file) return <aside className="inspector empty-inspector"><div className="empty-mark"><CircleDot size={22} /></div><span>NO FILE SELECTED</span><p>Open a .SCR, .REC, .VIS, .HLT, .ATA or .PROC record to inspect its chain.</p></aside>;
  const meta = extensionMeta[file.extension];
  const owner = file.ownerId ? index.crew.find((member) => member.id === file.ownerId) : undefined;
  return <aside className="inspector">
    <div className="inspector-topline"><span>FILE INSPECTOR</span><span className={`signal-dot signal-${meta.color}`} /></div>
    <div className="inspector-title-row"><div className={`file-tile tile-${meta.color}`}>{fileIcon(file, 20)}</div><div><div className="file-name">{file.name}</div><div className={`extension extension-${meta.color}`}>{file.extension} // {meta.label}</div></div></div>
    <div className="inspector-path">{file.path}</div>
    <div className="trace-map"><div className="trace-node trace-node-active"><span>{file.extension}</span><b>{file.name}</b></div><div className="trace-wire"><i /><i /><i /></div><div className="trace-node"><span>LINKS</span><b>{String(file.links.length).padStart(2, "0")} TARGETS</b></div>{owner && <><div className="trace-wire"><i /><i /><i /></div><div className="trace-node trace-node-owner"><span>OWNER</span><b>{owner.handle}</b></div></>}</div>
    <div className="inspector-summary">{file.summary}</div>
    <div className="inspector-fields">
      <div><span>SIZE</span><b>{file.size}</b></div><div><span>UPDATED</span><b>{file.updated}</b></div><div><span>CLEARANCE</span><b className={file.clearance === "ROOT" ? "text-red" : ""}>{file.clearance}</b></div><div><span>MODE</span><b>{file.system ? "SYSTEM" : "PERSONNEL"}</b></div>
    </div>
    {owner && <button className="owner-card" onClick={() => onOpen(`/crew/${owner.id}/${owner.handle}.SCR`)}><UserRound size={15} /><span><small>OWNER / CREW LINK</small><b>{owner.name}</b><em>{owner.role}</em></span><ChevronRight size={14} /></button>}
    {file.payload.kind === "audio" && <div className="payload-card audio-card"><div className="payload-head"><RadioTower size={14} /><span>AUDIO BUFFER // {file.payload.duration}</span><button aria-label="play recording"><Play size={12} fill="currentColor" /></button></div><div className="waveform">{file.payload.waveform.map((height, index) => <i key={index} style={{ height: `${Math.max(10, height * 0.6)}%` }} />)}</div><p>“{file.payload.transcript}”</p></div>}
    {file.payload.kind === "visual" && <div className="payload-card visual-card"><img src={file.payload.mediaSrc} alt={file.payload.alt} /><div><Eye size={13} /><span>{file.payload.caption}</span></div></div>}
    {file.payload.kind === "health" && <div className="payload-card health-card">{file.payload.vitals.map((item) => <div key={item.label}><span>{item.label}</span><b className={`vital-${item.status}`}>{item.value}</b></div>)}</div>}
    <div className="relations"><div className="section-label"><Network size={13} /> LINKED EVIDENCE <span>{String(file.links.length).padStart(2, "0")}</span></div>{file.links.map((relation) => <RelationLink key={`${relation.target}-${relation.label}`} relation={relation} onOpen={onOpen} />)}</div>
    <button className="open-command" onClick={() => onOpen(file.path)}><Terminal size={14} /> OPEN IN TERMINAL <ArrowUp size={13} /></button>
  </aside>;
}

export default function Home() {
  const index = useMemo(createSeedIndex, []);
  const [cwd, setCwd] = useState("/");
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>(initialTerminalLines);
  const [selectedPath, setSelectedPath] = useState("/BOOT.ATA");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | FileExtension>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const activeFile = index.fileMap.get(selectedPath.toLowerCase());
  const visibleFiles = index.files.filter((file) => (activeFilter === "all" || file.extension === activeFilter) && (!search || `${file.path} ${file.summary} ${file.keywords.join(" ")}`.toLowerCase().includes(search.toLowerCase()))).slice(0, 60);
  const visibleDirectories = index.directories.filter((directory) => directory !== "/").slice(0, 8);

  const openFile = (file: SeedFile) => { setSelectedPath(file.path); setLines((current) => [...current, { text: `// selected ${file.path}`, tone: "system" }]); };
  const openPath = (path: string) => { const file = resolveFile(index, path, cwd); if (file) { openFile(file); setCommand(`open ${file.path}`); inputRef.current?.focus(); } else { setLines((current) => [...current, { text: `link: target unavailable: ${path}`, tone: "error" }]); } };
  const submitCommand = (event: FormEvent) => { event.preventDefault(); const result = runCommand(command, cwd, index, openFile); setCwd(result.nextCwd); setLines((current) => command.trim().toLowerCase() === "clear" ? [] : [...current, ...result.lines]); setCommand(""); };

  return <main className="seed-app" style={{ "--console-texture": `url(${assetConsoleTexture})` } as CSSProperties}>
    <header className="topbar"><div className="brand"><div className="brand-mark"><img src={assetMark} alt="Seed OS mark" /></div><div><div className="brand-name">LOST <span>//</span> TERMINAL</div><div className="brand-sub">SEED CORP // SHIPBOARD OPERATING SYSTEM</div></div></div><div className="topbar-readout"><div><span>SESSION</span><b>GUEST_00</b></div><div><span>UPTIME</span><b>00:04:17</b></div><div><span>LINK</span><b className="text-mint"><Wifi size={12} /> FRAGMENTED</b></div><button className="icon-button" aria-label="system settings"><Settings2 size={16} /></button></div></header>
    <div className="boot-strip"><span><CircleDot size={10} className="pulse" /> FALLBACK MODE / NO TUTORIAL</span><span className="boot-warning"><AlertTriangle size={12} /> NEURAL_BUFFER_CORRUPTED</span><span className="boot-status">VFS READ_ONLY <i /> 700 CREW RECORDS <i /> 14% O2</span></div>
    <section className="workbench">
      <aside className="file-rail">
        <div className="rail-heading"><div><span className="eyebrow">SHIP / FILESYSTEM</span><h1>Evidence Index</h1></div><Database size={18} /></div>
        <div className="rail-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="trace names / paths" /><kbd>/</kbd></div>
        <div className="rail-stats"><div><b>{formatCount(index.files.length)}</b><span>FILES</span></div><div><b>700</b><span>CREW</span></div><div><b>014%</b><span>O2</span></div></div>
        <div className="directory-tree"><div className="tree-root"><FolderOpen size={14} /> <span>/SHIP</span><span className="tree-count">{index.files.length}</span></div>{visibleDirectories.map((directory) => <button key={directory} className={`tree-row ${cwd === directory ? "active" : ""}`} onClick={() => setCwd(directory)}><ChevronRight size={12} /><Folder size={13} /><span>{directory.replace("/", "")}</span></button>)}</div>
        <div className="filter-label"><span>EXTENSION FILTER</span><span>TYPE</span></div>
        <div className="extension-filters"><button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}><Brackets size={13} /> ALL <span>{formatCount(index.files.length)}</span></button>{Object.entries(index.counts).map(([extension, count]) => { const meta = extensionMeta[extension as FileExtension]; return <button key={extension} className={activeFilter === extension ? `active ext-${meta.color}` : ""} onClick={() => setActiveFilter(extension as FileExtension)}>{fileIcon(index.files.find((file) => file.extension === extension as FileExtension), 13)} {extension} <span>{formatCount(count)}</span></button>; })}</div>
        <div className="category-block"><div className="section-label"><HardDrive size={13} /> CREW MANIFEST <span>700</span></div>{categoryMeta.map((category) => <div className="category-row" key={category.label}><i className={`category-dot dot-${category.color}`} /><span>{category.label}</span><b>{category.value}</b></div>)}</div>
      </aside>
      <section className="terminal-panel">
        <div className="panel-header"><div><span className="eyebrow">ACTIVE CONSOLE</span><h2><Terminal size={18} /> guest@seed:<strong>{cwd}</strong></h2></div><div className="panel-actions"><span className="read-only"><LockKeyhole size={12} /> READ_ONLY</span><button className="square-action" onClick={() => setLines([])} aria-label="clear console">×</button></div></div>
        <div className="terminal-telemetry"><div><span>O2 RESERVE</span><b className="telemetry-critical">14%</b><i><em style={{ width: "14%" }} /></i></div><div><span>HULL INTEGRITY</span><b>72%</b><i><em style={{ width: "72%" }} /></i></div><div><span>BAD SECTORS</span><b className="telemetry-warning">03</b><i className="sector-bar"><em style={{ width: "31%" }} /></i></div><div className="telemetry-stamp"><SquareTerminal size={12} /><span>LOCAL BUFFER<br /><b>LIVE TRACE</b></span></div></div>
        <div className="terminal-output" onClick={() => inputRef.current?.focus()}>{lines.map((line, lineIndex) => <div className={`terminal-line ${toneClass(line.tone)}`} key={`${lineIndex}-${line.text}`}><span className="line-gutter">{line.tone === "prompt" ? ">" : line.tone === "error" ? "!" : line.tone === "amber" ? "~" : "·"}</span><span>{line.text || "\u00a0"}</span></div>)}<div className="terminal-caret"><span>guest@seed:{cwd}$</span><i /></div><div className="terminal-diagnostics"><div className="diagnostic-head"><span>LAST SIGNALS / NON-PUBLIC CHANNELS</span><b>SECTOR 04</b></div><div className="diagnostic-grid"><span><i className="diagnostic-bar"><em style={{ width: "82%" }} /></i>AUTHORITY <b>REVOKED</b></span><span><i className="diagnostic-bar"><em style={{ width: "44%" }} /></i>MEMORY <b>DRIFT</b></span><span><i className="diagnostic-bar"><em style={{ width: "68%" }} /></i>THERMAL <b>+08.4°C</b></span></div><div className="ansi-trace"><span>▓▓</span><span>▒▒▒</span><span>░░░░</span><span>////</span><b>GHOST CHANNEL DETECTED</b></div></div></div>
        <form className="command-bar" onSubmit={submitCommand}><span className="prompt-prefix">guest@seed:{cwd}$</span><input ref={inputRef} value={command} onChange={(event) => setCommand(event.target.value)} placeholder="enter command..." autoComplete="off" spellCheck={false} /><button type="submit"><Command size={14} /> EXEC</button></form>
        <div className="terminal-footer"><span><Activity size={12} /> LOCAL EXECUTION // 0ms</span><span>COMMANDS <b>ls</b> <b>cd</b> <b>cat</b> <b>find</b> <b>seed</b></span></div>
      </section>
      <section className="record-panel">
        <div className="panel-header record-header"><div><span className="eyebrow">TRACE / SELECTED RECORD</span><h2><CrosshairIcon /> {activeFile ? activeFile.extension.slice(1) : "NO_RECORD"}</h2></div><div className="record-index">{activeFile ? `${String(index.files.indexOf(activeFile) + 1).padStart(3, "0")} / ${formatCount(index.files.length)}` : "---"}</div></div>
        <div className="record-list">{visibleFiles.map((file) => { const meta = extensionMeta[file.extension]; return <button key={file.path} className={`record-row ${selectedPath === file.path ? "selected" : ""}`} onClick={() => openFile(file)}><span className={`record-icon icon-${meta.color}`}>{fileIcon(file)}</span><span className="record-copy"><b>{file.name}</b><small>{file.directory}</small></span><span className={`record-ext ext-${meta.color}`}>{file.extension}</span><span className="record-size">{file.size}</span></button>; })}</div>
        <div className="list-footer"><span>SHOWING {visibleFiles.length} / {index.files.length}</span><span>INDEXED <i className="status-light" /></span></div>
      </section>
      <Inspector file={activeFile} index={index} onOpen={openPath} />
    </section>
    <footer className="statusbar"><div><span className="status-label">SEED OS</span><span>BUILD 0.9.1 / VFS STABLE</span></div><div className="life-readout"><span>ENERGY <b>31%</b></span><span>HULL <b>72%</b></span><span className="life-critical">LIFE SUPPORT <b>14%</b></span><div className="life-bars"><i /><i /><i /><i /><i /></div></div><div><span>© SEED CORP</span><span className="status-key">[ESC] RELEASE CONSOLE</span></div></footer>
  </main>;
}

function CrosshairIcon() {
  return <span className="crosshair-icon"><span /><span /></span>;
}
