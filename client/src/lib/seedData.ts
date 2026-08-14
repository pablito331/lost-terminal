/**
 * Style reminder: the Seed OS data layer should feel like a recovered industrial
 * filesystem: explicit paths, terse metadata, imperfect signals, and discoverable
 * links between people. Keep narrative data structured enough to become gameplay.
 */

export type FileExtension = ".SCR" | ".REC" | ".VIS" | ".HLT" | ".ATA" | ".PROC";
export type FileKind = "text" | "audio" | "visual" | "health" | "incident" | "program";

export interface SeedLink {
  target: string;
  label: string;
  relation: string;
  signal?: "clear" | "amber" | "red";
}

export interface CrewMember {
  id: string;
  name: string;
  handle: string;
  role: string;
  department: string;
  category: "COMANDO" | "ENGENHARIA" | "CIÊNCIA / MÉDICA" | "COLONOS EM ESTASE";
  capsule: number;
  clearance: "GUEST" | "CREW" | "OFFICER" | "ROOT";
  status: "CRYO_STABLE" | "LIFE_SUPPORT_LOW" | "UNKNOWN" | "FLAGGED";
  location: string;
  note: string;
}

export type FilePayload =
  | { kind: "text"; lines: string[] }
  | { kind: "audio"; duration: string; transcript: string; waveform: number[] }
  | { kind: "visual"; caption: string; mediaSrc: string; alt: string; telemetry: string[] }
  | { kind: "health"; vitals: Array<{ label: string; value: string; status: "stable" | "warning" | "critical" }>; note: string }
  | { kind: "incident"; severity: "CRITICAL" | "WARNING" | "INFO"; events: string[] }
  | { kind: "program"; language: string; code: string[] };

export interface SeedFile {
  path: string;
  name: string;
  extension: FileExtension;
  kind: FileKind;
  directory: string;
  size: string;
  updated: string;
  ownerId?: string;
  summary: string;
  clearance: "GUEST" | "CREW" | "OFFICER" | "ROOT";
  payload: FilePayload;
  links: SeedLink[];
  keywords: string[];
  system: boolean;
}

export interface SeedIndex {
  files: SeedFile[];
  fileMap: Map<string, SeedFile>;
  crew: CrewMember[];
  directories: string[];
  counts: Record<FileExtension, number>;
}

const generatedFirstNames = ["Ari", "Bela", "Cato", "Dara", "Eli", "Faye", "Gio", "Hana", "Ivo", "Juno", "Kian", "Lena", "Mika", "Nilo", "Ona", "Pavel", "Quin", "Rhea", "Suri", "Tavi", "Uma", "Vera", "Wren", "Yara", "Zev"];
const generatedLastNames = ["Adebayo", "Bishop", "Carvalho", "Duarte", "Eriksen", "Fujimoto", "Galloway", "Haddad", "Ibarra", "Jensen", "Kovacs", "Legrand", "Mori", "Nwosu", "Orlov", "Patel", "Quispe", "Rossi", "Singh", "Takahashi", "Ueda", "Velez", "Wang", "Xu", "Yilmaz"];
const locations = ["CRYO DECK / RACK C", "ENGINEERING / LOOP 02", "MEDICAL / TRIAGE", "BOTANY / RING 04", "COMMAND / BRIDGE", "HABITAT / SPINE 01"];
const roleSets = {
  COMANDO: ["Flight Officer", "Navigation Officer", "Security Lead", "Command Liaison"],
  ENGENHARIA: ["Systems Technician", "Thermal Engineer", "Power Grid Operator", "Hull Integrity Tech"],
  "CIÊNCIA / MÉDICA": ["Xenobiologist", "Cryomedic", "Neural Systems Analyst", "Research Surgeon"],
  "COLONOS EM ESTASE": ["Agronomist", "Surveyor", "Teacher", "Archive Curator", "Hydroponics Lead"],
} as const;

const specialCrew: Record<string, Partial<CrewMember>> = {
  "crew-001": { name: "Alma Velez", handle: "A.VELEZ", role: "Mission Commander", department: "COMMAND", clearance: "ROOT", status: "FLAGGED", location: "COMMAND / BRIDGE", note: "Última autoridade registrada antes do bloqueio de memória." },
  "crew-014": { name: "Ivo Chen", handle: "I.CHEN", role: "Thermal Systems Engineer", department: "ENGINEERING", clearance: "OFFICER", status: "UNKNOWN", location: "ENGINEERING / LOOP 02", note: "Mapeou uma queda de calor que não aparece nos relatórios oficiais." },
  "crew-227": { name: "Sana Okafor", handle: "S.OKAFOR", role: "Cryomedic", department: "MEDICAL", clearance: "OFFICER", status: "CRYO_STABLE", location: "MEDICAL / TRIAGE", note: "Inseriu uma nota privada no prontuário da cápsula 701." },
  "crew-344": { name: "Mara Ilyin", handle: "M.ILYIN", role: "Neural Systems Analyst", department: "SCIENCE", clearance: "OFFICER", status: "FLAGGED", location: "LAB / NEURAL LINK", note: "A única pessoa que marcou Memory_Wipe como evento provocado." },
  "crew-612": { name: "Tomas Reed", handle: "T.REED", role: "Archive Curator", department: "COLONY", clearance: "CREW", status: "UNKNOWN", location: "ARCHIVE / COLD STORAGE", note: "Manteve uma cópia física dos manifests de evacuação." },
  "crew-700": { name: "Noor Baptiste", handle: "N.BAPTISTE", role: "Hydroponics Lead", department: "COLONY", clearance: "CREW", status: "LIFE_SUPPORT_LOW", location: "BOTANY / RING 04", note: "Seu relógio biológico é a única fonte de tempo não corrompida." },
};

function pad(value: number, digits = 3) {
  return String(value).padStart(digits, "0");
}

function categoryFor(index: number): CrewMember["category"] {
  if (index <= 70) return "COMANDO";
  if (index <= 280) return "ENGENHARIA";
  if (index <= 420) return "CIÊNCIA / MÉDICA";
  return "COLONOS EM ESTASE";
}

function createCrew(): CrewMember[] {
  return Array.from({ length: 700 }, (_, position) => {
    const capsule = position + 1;
    const id = `crew-${pad(capsule)}`;
    const category = categoryFor(capsule);
    const seed = (capsule * 17) % generatedFirstNames.length;
    const overrides = specialCrew[id] ?? {};
    const roleList = roleSets[category];
    return {
      id,
      name: `${generatedFirstNames[seed]} ${generatedLastNames[(capsule * 11) % generatedLastNames.length]}`,
      handle: `${generatedFirstNames[seed][0]}.${generatedLastNames[(capsule * 11) % generatedLastNames.length].slice(0, 6).toUpperCase()}`,
      role: roleList[capsule % roleList.length],
      department: category === "COMANDO" ? "COMMAND" : category === "ENGENHARIA" ? "ENGINEERING" : category === "CIÊNCIA / MÉDICA" ? "SCIENCE / MED" : "COLONY",
      category,
      capsule,
      clearance: category === "COMANDO" ? "OFFICER" : category === "COLONOS EM ESTASE" ? "CREW" : "CREW",
      status: capsule === 701 ? "FLAGGED" : capsule % 17 === 0 ? "UNKNOWN" : "CRYO_STABLE",
      location: locations[capsule % locations.length],
      note: `Registro gerado a partir do manifest original da cápsula ${pad(capsule)}.`,
      ...overrides,
    };
  });
}

function baseFile(input: Omit<SeedFile, "directory" | "name" | "extension" | "kind"> & { path: string; extension: FileExtension; kind: FileKind }): SeedFile {
  const slash = input.path.lastIndexOf("/");
  const name = input.path.slice(slash + 1);
  return { ...input, directory: slash === 0 ? "/" : input.path.slice(0, slash), name };
}

function crewFiles(member: CrewMember): SeedFile[] {
  const base = `/crew/${member.id}`;
  const profilePath = `${base}/${member.handle}.SCR`;
  const healthPath = `${base}/biometrics.HLT`;
  const profileLinks: SeedLink[] = [
    { target: "/ship/operations/incident-701.ATA", label: "INCIDENT_701", relation: "citado em" },
    { target: healthPath, label: "BIOMETRICS", relation: "prontuário" },
  ];
  if (member.id === "crew-001") profileLinks.push({ target: "/crew/crew-014/I.CHEN.SCR", label: "I.CHEN", relation: "último contato", signal: "amber" });
  if (member.id === "crew-014") profileLinks.push({ target: "/crew/crew-227/triage-note.SCR", label: "S.OKAFOR", relation: "solicitou triagem", signal: "red" });
  if (member.id === "crew-227") profileLinks.push({ target: "/cryo/capsule-701/neural-link.HLT", label: "CAPSULE_701", relation: "assinou registro", signal: "red" });
  const files: SeedFile[] = [
    baseFile({
      path: profilePath,
      extension: ".SCR",
      kind: "text",
      size: `${(1.2 + (member.capsule % 9) / 10).toFixed(1)} KB`,
      updated: member.capsule % 3 === 0 ? "T-19:44:08" : "T-21:02:19",
      ownerId: member.id,
      summary: member.note,
      clearance: member.clearance,
      payload: { kind: "text", lines: [`PERSONNEL RECORD // ${member.handle}`, `NAME       : ${member.name}`, `ROLE       : ${member.role}`, `DEPARTMENT : ${member.department}`, `CAPSULE    : ${pad(member.capsule)}`, `LOCATION   : ${member.location}`, `STATUS     : ${member.status}`, "", `NOTE       : ${member.note}`, "", "[links] use OPEN <path> to follow the record chain."] },
      links: profileLinks,
      keywords: [member.name, member.handle, member.role, member.department, member.status],
      system: false,
    }),
    baseFile({
      path: healthPath,
      extension: ".HLT",
      kind: "health",
      size: "3.4 KB",
      updated: "T-18:10:02",
      ownerId: member.id,
      summary: `Biometria de ${member.name}; status ${member.status}.`,
      clearance: "CREW",
      payload: { kind: "health", vitals: [{ label: "NEURAL LINK", value: member.id === "crew-344" ? "BUFFER DRIFT" : "NOMINAL", status: member.id === "crew-344" ? "critical" : "stable" }, { label: "CRYO TEMP", value: member.status === "CRYO_STABLE" ? "−178.4°C" : "−171.2°C", status: member.status === "LIFE_SUPPORT_LOW" ? "warning" : "stable" }, { label: "O2 RESERVE", value: member.status === "LIFE_SUPPORT_LOW" ? "14%" : "86%", status: member.status === "LIFE_SUPPORT_LOW" ? "critical" : "stable" }], note: member.id === "crew-227" ? "NOTA PRIVADA: a cápsula 701 não pertence ao manifest de colonos." : "Nenhuma anomalia clínica persistente encontrada." },
      links: [{ target: profilePath, label: member.handle, relation: "proprietário" }],
      keywords: [member.name, "biometric", "cryo", "neural"],
      system: false,
    }),
  ];
  if (member.id === "crew-344") {
    files.push(baseFile({
      path: `${base}/voice.REC`, extension: ".REC", kind: "audio", size: "620 KB", updated: "T-03:10:42", ownerId: member.id, summary: "Gravação arquivada por M. Ilyin; a data no cabeçalho foi removida do índice público.", clearance: "OFFICER",
      payload: { kind: "audio", duration: "00:09", transcript: "[M.ILYIN] O pulso não começou no apagão. Ele começou no dia 17, quando alguém abriu o arquivo da cápsula 701 sem passar pelo bridge.", waveform: [18, 32, 64, 46, 81, 23, 57, 38, 74, 45, 90, 31, 60, 26, 68, 42, 79, 36, 55, 21] },
      links: [{ target: `${base}/${member.handle}.SCR`, label: member.handle, relation: "autora", signal: "amber" }, { target: "/cryo/capsule-701/neural-link.HLT", label: "NEURAL_LINK", relation: "evidência", signal: "red" }], keywords: [member.name, "voice", "day 17", "capsule 701"], system: false,
    }));
  }
  return files;
}

function createSystemFiles(): SeedFile[] {
  return [
    baseFile({
      path: "/BOOT.ATA", extension: ".ATA", kind: "incident", size: "12.8 KB", updated: "T+00:00:00", summary: "Registro de inicialização do Seed OS e montagem do VFS.", clearance: "GUEST",
      payload: { kind: "incident", severity: "CRITICAL", events: ["00:00:00  MEMORY CHECK ................. PASS", "00:00:05  VFS /SHIP mounted READ_ONLY", "00:00:11  CAPSULES 001—700 ............. PRESENT", "00:00:23  CAPSULE 701 .................. UNREGISTERED", "00:00:27  Neural_Buffer_Corrupted", "00:00:30  FALLBACK MODE: GUEST"] },
      links: [{ target: "/cryo/capsule-701/scan.VIS", label: "CAPSULE_701", relation: "setor anômalo", signal: "red" }, { target: "/crew/crew-001/A.VELEZ.SCR", label: "A.VELEZ", relation: "autoridade do boot", signal: "amber" }], keywords: ["boot", "capsule", "memory", "guest"], system: true,
    }),
    baseFile({
      path: "/seed/telemetry.SCR", extension: ".SCR", kind: "text", size: "4.2 KB", updated: "LIVE", summary: "Telemetria crítica da nave; três leituras foram removidas do painel público.", clearance: "GUEST",
      payload: { kind: "text", lines: ["SEED OS // TELEMETRY SNAPSHOT", "", "POWER      : 31% // uneven draw", "LIFE SUPPORT: 14% // reserve unstable", "HULL       : 72% // ring 04 puncture", "NETWORK    : fragmented / sniffable", "MEMORY     : 86% / 3 bad sectors", "", "WARNING: public panel omits 3 private channels."] },
      links: [{ target: "/net/ghost-packet.REC", label: "GHOST_PACKET", relation: "canal privado", signal: "red" }, { target: "/apps/sniff.PROC", label: "SNIFF", relation: "ferramenta" }], keywords: ["telemetry", "life support", "power", "hull"], system: true,
    }),
    baseFile({
      path: "/ship/operations/incident-701.ATA", extension: ".ATA", kind: "incident", size: "9.1 KB", updated: "T-03:11:46", summary: "Ata de serviço parcialmente reescrita durante o apagão.", clearance: "CREW",
      payload: { kind: "incident", severity: "CRITICAL", events: ["[T-03:11:46] COMMAND AUTHORITY revoked by local process", "[T-03:12:01] Cryo manifest checksum mismatch: 700 / 701", "[T-03:12:08] M.ILYIN requested neural wipe quarantine", "[T-03:12:11] A.VELEZ approved manual override", "[T-03:12:13] audio channel sealed — reason: PERSONAL"] },
      links: [{ target: "/crew/crew-344/M.ILYIN.SCR", label: "M.ILYIN", relation: "solicitante", signal: "red" }, { target: "/crew/crew-001/A.VELEZ.SCR", label: "A.VELEZ", relation: "aprovou", signal: "amber" }, { target: "/cryo/capsule-701/neural-link.HLT", label: "NEURAL_LINK", relation: "evidência", signal: "red" }], keywords: ["incident", "authority", "wipe", "checksum"], system: true,
    }),
    baseFile({
      path: "/cryo/capsule-701/scan.VIS", extension: ".VIS", kind: "visual", size: "842 KB", updated: "T-03:12:04", summary: "Quadro estático da cápsula sem assinatura no manifest.", clearance: "CREW",
      payload: { kind: "visual", caption: "CAPSULE 701 // VISUAL FORENSICS", mediaSrc: "/manus-storage/seed-os-cryo-bay_59a3b071.png", alt: "Baía criogênica industrial em uma nave escura", telemetry: ["GLASS TEMP  : −171.2°C", "LIFE SIGNAL : PRESENT", "OWNER ID    : null", "MANIFEST    : checksum mismatch"] },
      links: [{ target: "/cryo/capsule-701/neural-link.HLT", label: "NEURAL_LINK", relation: "mesma captura", signal: "red" }, { target: "/crew/crew-227/triage-note.SCR", label: "TRIAGE_NOTE", relation: "comentário médico", signal: "amber" }], keywords: ["visual", "cryo", "capsule 701", "manifest"], system: true,
    }),
    baseFile({
      path: "/cryo/capsule-701/neural-link.HLT", extension: ".HLT", kind: "health", size: "6.0 KB", updated: "T-03:12:08", summary: "Prontuário órfão com assinatura neural parcialmente apagada.", clearance: "OFFICER",
      payload: { kind: "health", vitals: [{ label: "NEURAL BUFFER", value: "CORRUPTED", status: "critical" }, { label: "IDENTITY HASH", value: "7F-A1-??-C0", status: "warning" }, { label: "VITALS", value: "PRESENT / LOW", status: "critical" }], note: "Acorde com a pergunta: por que a cápsula 701 foi adicionada depois do fechamento do manifest?" },
      links: [{ target: "/crew/crew-344/M.ILYIN.SCR", label: "M.ILYIN", relation: "classificou", signal: "red" }, { target: "/net/ghost-packet.REC", label: "GHOST_PACKET", relation: "contém chave", signal: "amber" }], keywords: ["neural", "identity", "memory wipe", "capsule 701"], system: true,
    }),
    baseFile({
      path: "/net/ghost-packet.REC", extension: ".REC", kind: "audio", size: "1.4 MB", updated: "T-03:12:10", summary: "Interceptação de voz fora do canal oficial; os timestamps não batem com o relógio da nave.", clearance: "OFFICER",
      payload: { kind: "audio", duration: "00:17", transcript: "[voz não indexada] Se a cápsula acordar, não entregue a ela o nome. O Seed OS vai tentar completar o vazio. Procure o pulso em LOOP_02. Ivo sabe qual arquivo não deveria existir.", waveform: [12, 28, 17, 52, 34, 72, 40, 26, 68, 46, 84, 28, 56, 18, 76, 38, 92, 44, 24, 60, 32, 78, 46, 26, 72, 36, 88, 22, 54, 40, 70, 30, 62, 18, 76, 48] },
      links: [{ target: "/crew/crew-014/I.CHEN.SCR", label: "I.CHEN", relation: "nome citado", signal: "amber" }, { target: "/engineering/loop-02/thermal.VIS", label: "LOOP_02", relation: "origem do pulso", signal: "red" }], keywords: ["voice", "intercept", "ghost", "loop 02"], system: true,
    }),
    baseFile({
      path: "/engineering/loop-02/thermal.VIS", extension: ".VIS", kind: "visual", size: "392 KB", updated: "T-02:58:40", summary: "Mapa térmico de uma linha de refrigeração que não existe no blueprint público.", clearance: "CREW",
      payload: { kind: "visual", caption: "LOOP 02 // THERMAL GHOST TRACE", mediaSrc: "/manus-storage/seed-os-schematic_2369c257.png", alt: "Mapa técnico abstrato de linhas e nós em uma nave", telemetry: ["SOURCE : ENGINEERING BUS", "HEAT   : +08.4°C / hidden draw", "ROUTE  : [redacted]", "OWNER  : I.CHEN"] },
      links: [{ target: "/crew/crew-014/I.CHEN.SCR", label: "I.CHEN", relation: "operador", signal: "amber" }, { target: "/apps/calc.PROC", label: "CALC", relation: "decodificar", signal: "clear" }], keywords: ["thermal", "loop 02", "hidden draw", "engineering"], system: true,
    }),
    baseFile({
      path: "/crew/crew-227/triage-note.SCR", extension: ".SCR", kind: "text", size: "2.1 KB", updated: "T-03:13:55", summary: "Nota privada adicionada por S. Okafor após o apagão.", clearance: "OFFICER",
      payload: { kind: "text", lines: ["PRIVATE MEDICAL NOTE // S.OKAFOR", "", "Cápsula 701 apresenta padrão de despertar normal para um", "corpo que não deveria estar no manifest. A memória não foi", "apagada por falha; foi sobrescrita com uma pergunta.", "", "Se alguém ler isto: procure a data no REC de M.ILYIN."] },
      links: [{ target: "/crew/crew-227/S.OKAFOR.SCR", label: "S.OKAFOR", relation: "autora", signal: "amber" }, { target: "/crew/crew-344/voice.REC", label: "M.ILYIN / REC", relation: "próxima pista", signal: "red" }], keywords: ["medical", "private", "capsule 701", "question"], system: true,
    }),
    baseFile({
      path: "/apps/edit.PROC", extension: ".PROC", kind: "program", size: "5.8 KB", updated: "BUILD 0.9.1", summary: "Editor mínimo de scripts e notas locais.", clearance: "GUEST",
      payload: { kind: "program", language: "SEED SCRIPT", code: ["PROC edit", "  LOAD target.SCR", "  APPEND // local note", "  SAVE --local", "ENDPROC"] }, links: [{ target: "/apps/backdoor_exploit.PROC", label: "BACKDOOR", relation: "módulo bloqueado", signal: "red" }], keywords: ["edit", "script", "proc"], system: true,
    }),
    baseFile({
      path: "/apps/calc.PROC", extension: ".PROC", kind: "program", size: "3.9 KB", updated: "BUILD 1.2.0", summary: "Calculadora de hexadecimal, decimal e consumo de O2.", clearance: "GUEST",
      payload: { kind: "program", language: "SEED SCRIPT", code: ["PROC calc", "  ACCEPT hex | dec | o2_burn_rate", "  RETURN normalized_value", "ENDPROC"] }, links: [{ target: "/engineering/loop-02/thermal.VIS", label: "THERMAL", relation: "entrada sugerida", signal: "amber" }], keywords: ["calc", "hex", "o2", "proc"], system: true,
    }),
    baseFile({
      path: "/apps/sniff.PROC", extension: ".PROC", kind: "program", size: "8.7 KB", updated: "BUILD 0.4.4", summary: "Interceptador de pacotes; requer um canal de rede ativo.", clearance: "CREW",
      payload: { kind: "program", language: "SEED SCRIPT", code: ["PROC sniff", "  SCAN /net --passive", "  FILTER channel=ghost", "  DUMP /local/intercepts.REC", "ENDPROC"] }, links: [{ target: "/net/ghost-packet.REC", label: "GHOST_PACKET", relation: "canal provável", signal: "red" }], keywords: ["sniff", "network", "ghost", "proc"], system: true,
    }),
    baseFile({
      path: "/apps/backdoor_exploit.PROC", extension: ".PROC", kind: "program", size: "0 B", updated: "SEALED", summary: "Executável ausente; o caminho existe apenas como referência de permissão.", clearance: "ROOT",
      payload: { kind: "program", language: "SEALED", code: ["// NO PAYLOAD", "// clearance ROOT required", "// build the key from the chain"] }, links: [{ target: "/crew/crew-001/A.VELEZ.SCR", label: "ROOT", relation: "origem provável", signal: "red" }], keywords: ["backdoor", "root", "exploit", "sealed"], system: true,
    }),
  ];
}

export function createSeedIndex(): SeedIndex {
  const crew = createCrew();
  const files = [...createSystemFiles(), ...crew.flatMap(crewFiles)];
  const fileMap = new Map(files.map((file) => [file.path.toLowerCase(), file]));
  const directories = Array.from(new Set(["/", ...files.flatMap((file) => {
    const parts = file.directory.split("/").filter(Boolean);
    return parts.map((_, index) => `/${parts.slice(0, index + 1).join("/")}`);
  })])).sort((a, b) => a.localeCompare(b));
  const counts = files.reduce((acc, file) => { acc[file.extension] += 1; return acc; }, { ".SCR": 0, ".REC": 0, ".VIS": 0, ".HLT": 0, ".ATA": 0, ".PROC": 0 } as Record<FileExtension, number>);
  return { files, fileMap, crew, directories, counts };
}

export function normalizePath(input: string, cwd = "/") {
  const raw = input.startsWith("/") ? input : `${cwd}/${input}`;
  const parts = raw.split("/").filter(Boolean);
  const resolved: string[] = [];
  parts.forEach((part) => { if (part === "..") resolved.pop(); else if (part !== ".") resolved.push(part); });
  return `/${resolved.join("/")}` || "/";
}

export function resolveFile(index: SeedIndex, input: string, cwd = "/") {
  const normalized = normalizePath(input, cwd);
  const direct = index.fileMap.get(normalized.toLowerCase());
  if (direct) return direct;
  if (!/[.][A-Z0-9]+$/i.test(normalized)) {
    return index.files.find((file) => file.path.toLowerCase().startsWith(`${normalized.toLowerCase()}.`));
  }
  return undefined;
}

export function listDirectory(index: SeedIndex, cwd: string) {
  const normalized = normalizePath(cwd);
  const prefix = normalized === "/" ? "/" : `${normalized}/`;
  const children = new Map<string, { type: "dir" | "file"; file?: SeedFile }>();
  index.files.forEach((file) => {
    if (!file.path.startsWith(prefix)) return;
    const remainder = file.path.slice(prefix.length);
    if (!remainder) return;
    const [head] = remainder.split("/");
    if (remainder.includes("/")) children.set(head, { type: "dir" });
    else children.set(head, { type: "file", file });
  });
  return Array.from(children.entries()).sort(([a, aValue], [b, bValue]) => Number(aValue.type === "file") - Number(bValue.type === "file") || a.localeCompare(b)).map(([name, value]) => ({ name, ...value }));
}
