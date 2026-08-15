/**
 * Style reminder: this data layer is a recovered Seed OS filesystem. Keep
 * records terse, linkable and diegetic. Personal files preserve the passenger's
 * native language; corporate files use the Seed operational language.
 */

import { createKnowledgeFiles } from "./seedKnowledge";
import { createJournalSeries } from "./seedJournals";

export type FileExtension = ".SCR" | ".REC" | ".MUS" | ".VIS" | ".HLT" | ".ATA" | ".PROC" | ".BOOK" | ".MSG";
export type FileLayer = "PERSONAL" | "CORPORATE" | "SYSTEM";
export type LanguageCode = "pt-BR" | "es-MX" | "en-US" | "fr-FR" | "de-DE" | "ja-JP" | "zh-CN" | "ar-EG";
export type FileLanguage = LanguageCode | "SEED-OPS";
export type FileKind = "text" | "audio" | "visual" | "health" | "incident" | "program" | "credential" | "book" | "message";
export type PassengerCategory = "COMMAND" | "PILOTS & FLIGHT" | "ENGINEERING & WORKERS" | "SCIENCE / MEDICAL" | "FAMILIES & COLONISTS";
export type CorporateDocumentType = "SYSTEM_LOG" | "ACCESS_LOG" | "MEETING_MINUTES" | "DISCIPLINARY_WARNING" | "MEMO";
export type IntegrityState = "CLEAN" | "PARTIAL" | "CORRUPTED" | "ENCRYPTED";

export interface AccessRule {
  username: string;
  secret: string;
  authority: "GUEST" | "CREW" | "OFFICER" | "ROOT";
  lockoutAfter: number;
}

export interface SeedLink {
  target: string;
  label: string;
  relation: string;
  signal?: "clear" | "amber" | "red";
}

export interface FamilyRecord {
  id: string;
  surname: string;
  nationality: string;
  language: LanguageCode;
  members: string[];
  note: string;
}

export interface CrewMember {
  id: string;
  name: string;
  handle: string;
  familyId: string;
  familyName: string;
  kinship: "PARENT" | "PARTNER" | "DEPENDENT" | "SIBLING";
  nationality: string;
  language: LanguageCode;
  languageLabel: string;
  role: string;
  department: string;
  category: PassengerCategory;
  capsule: number;
  clearance: "GUEST" | "CREW" | "OFFICER" | "ROOT";
  status: "CRYO_STABLE" | "LIFE_SUPPORT_LOW" | "UNKNOWN" | "FLAGGED";
  location: string;
  note: string;
}

export interface ActionSpec {
  id: string;
  label: string;
  requires?: string[];
  output: string[];
  effects?: Partial<{ energy: number; oxygen: number; hull: number; network: "FRAGMENTED" | "STABLE"; authority: "GUEST" | "CREW" | "OFFICER" | "ROOT"; service: string }>;
}

export type FilePayload =
  | { kind: "text"; lines: string[]; language: FileLanguage }
  | { kind: "audio"; duration: string; transcript: string; waveform: number[]; language: FileLanguage; audioType?: "VOICE" | "MUSIC"; title?: string; artist?: string; codec?: string; mediaSrc?: string; remoteEmbed?: string; remoteProvider?: "PUBLIC_PLAYLIST" }
  | { kind: "visual"; caption: string; mediaSrc?: string; alt: string; telemetry: string[]; language: FileLanguage }
  | { kind: "health"; vitals: Array<{ label: string; value: string; status: "stable" | "warning" | "critical" }>; note: string; language: FileLanguage }
  | { kind: "incident"; severity: "CRITICAL" | "WARNING" | "INFO"; events: string[]; language: FileLanguage }
  | { kind: "program"; language: FileLanguage; programType: "UTILITY" | "APPLICATION" | "SCRIPT"; code: string[]; action?: ActionSpec }
  | { kind: "credential"; language: FileLanguage; service: string; username: string; secret: string; hint: string; target: string }
  | { kind: "book"; language: FileLanguage; title: string; author: string; subject: string; level: "INTRO" | "CREW" | "OFFICER" | "ROOT"; chapters: string[]; pages?: Array<{ number: number; heading: string; lines: string[] }>; references: string[] }
  | { kind: "message"; language: FileLanguage; channel: "OFFICIAL" | "GHOST"; senderId?: string; recipientIds: string[]; sentAt: string; status: "UNREAD" | "READ"; body: string[]; attachments: string[] };

export interface SeedFile {
  path: string;
  name: string;
  extension: FileExtension;
  kind: FileKind;
  directory: string;
  size: string;
  updated: string;
  documentType?: CorporateDocumentType;
  eventTime?: string;
  authorId?: string;
  recipientIds?: string[];
  department?: string;
  accessTerminal?: string;
  supersedes?: string;
  contradiction?: string;
  integrity?: IntegrityState;
  corruption?: string[];
  access?: AccessRule;
  ownerId?: string;
  familyId?: string;
  layer: FileLayer;
  language: FileLanguage;
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
  families: FamilyRecord[];
  familyMap: Map<string, FamilyRecord>;
  directories: string[];
  counts: Record<FileExtension, number>;
}

const languageProfiles: Array<{ code: LanguageCode; label: string; nationality: string; given: string[]; surnames: string[] }> = [
  { code: "pt-BR", label: "Português (Brasil)", nationality: "BR", given: ["Alma", "João", "Lia", "Caio", "Marina", "Ravi"], surnames: ["Velez", "Carvalho", "Mendes", "Nogueira", "Azevedo"] },
  { code: "es-MX", label: "Español (México)", nationality: "MX", given: ["Sofía", "Mateo", "Inés", "Diego", "Lucía", "Tomás"], surnames: ["Ibarra", "Quispe", "Navarro", "Mendoza", "Salazar"] },
  { code: "en-US", label: "English (United States)", nationality: "US", given: ["June", "Evan", "Maya", "Noah", "Claire", "Milo"], surnames: ["Bishop", "Reed", "Galloway", "Wells", "Parker"] },
  { code: "fr-FR", label: "Français (France)", nationality: "FR", given: ["Élodie", "Luc", "Nina", "Marc", "Amélie", "Rémi"], surnames: ["Legrand", "Moreau", "Duret", "Bernard", "Fournier"] },
  { code: "de-DE", label: "Deutsch (Deutschland)", nationality: "DE", given: ["Greta", "Jonas", "Mila", "Felix", "Anja", "Lukas"], surnames: ["Eriksen", "Schmidt", "Keller", "Vogel", "Weber"] },
  { code: "ja-JP", label: "日本語 (日本)", nationality: "JP", given: ["Aiko", "Ren", "Mio", "Haruto", "Yuna", "Sora"], surnames: ["Fujimoto", "Watanabe", "Mori", "Tanaka", "Kobayashi"] },
  { code: "zh-CN", label: "中文 (中国)", nationality: "CN", given: ["Mei", "Wei", "Lin", "Jia", "Yun", "Tao"], surnames: ["Wang", "Xu", "Chen", "Zhou", "Li"] },
  { code: "ar-EG", label: "العربية (مصر)", nationality: "EG", given: ["Nour", "Omar", "Laila", "Samir", "Mariam", "Youssef"], surnames: ["Haddad", "Nassar", "Fahmy", "Mansour", "Rahman"] },
];

const languageCopy: Record<LanguageCode, { diary: string; document: string; song: string; family: string }> = {
  "pt-BR": { diary: "A nave dorme, mas a minha família ainda respira no convés frio. Se eu esquecer meu nome, procure o que deixei escrito para eles.", document: "Documento pessoal. Não traduzir sem autorização da família.", song: "A faixa termina antes do refrão; alguém gravou uma sequência de números depois do silêncio.", family: "Nós quatro embarcamos juntos. O arquivo da Seed diz apenas que somos carga habitacional." },
  "es-MX": { diary: "La nave está dormida, pero mi familia sigue respirando en la cubierta fría. Si olvido mi nombre, busca lo que dejé para ellos.", document: "Documento personal. No traducir sin autorización de la familia.", song: "La canción termina antes del coro; alguien grabó una secuencia de números después del silencio.", family: "Subimos los cuatro juntos. El archivo de Seed dice que solo somos carga habitacional." },
  "en-US": { diary: "The ship is asleep, but my family is still breathing on the cold deck. If I forget my name, look for what I left behind.", document: "Personal document. Do not translate without family authorization.", song: "The track cuts before the chorus; someone recorded a string of numbers after the silence.", family: "The four of us boarded together. Seed's file calls us habitation cargo." },
  "fr-FR": { diary: "Le vaisseau dort, mais ma famille respire encore sur le pont froid. Si j'oublie mon nom, cherche ce que j'ai laissé.", document: "Document personnel. Ne pas traduire sans l'autorisation de la famille.", song: "La piste s'arrête avant le refrain; une suite de chiffres suit le silence.", family: "Nous sommes montés tous les quatre. Le dossier Seed nous appelle cargaison d'habitation." },
  "de-DE": { diary: "Das Schiff schläft, aber meine Familie atmet noch auf dem kalten Deck. Wenn ich meinen Namen vergesse, suche nach meiner Spur.", document: "Persönliches Dokument. Ohne Zustimmung der Familie nicht übersetzen.", song: "Das Lied endet vor dem Refrain; nach der Stille folgt eine Zahlenfolge.", family: "Wir vier sind gemeinsam an Bord gegangen. Seed nennt uns Wohnfracht." },
  "ja-JP": { diary: "船は眠っている。でも家族はまだ冷たいデッキで息をしている。名前を忘れたら、残した記録を探して。", document: "個人文書。家族の許可なく翻訳しないこと。", song: "サビの前で音が切れる。静寂のあとに数字の列が録音されている。", family: "私たち四人は一緒に乗った。Seedの記録では居住貨物になっている。" },
  "zh-CN": { diary: "飞船在沉睡，但我的家人仍在冰冷的甲板上呼吸。如果我忘了自己的名字，请寻找我留下的记录。", document: "私人文件。未经家人许可不得翻译。", song: "音乐在副歌前停止，沉默之后录下了一串数字。", family: "我们四个人一起登船。Seed档案只把我们称为居住货物。" },
  "ar-EG": { diary: "السفينة نائمة، لكن عائلتي ما زالت تتنفس على السطح البارد. إذا نسيت اسمي، ابحث عما تركته لهم.", document: "وثيقة شخصية. لا تترجم دون إذن العائلة.", song: "تنقطع المقطوعة قبل اللازمة؛ بعد الصمت سُجلت سلسلة من الأرقام.", family: "صعدنا نحن الأربعة معاً. ملف Seed يصفنا كحمولة سكنية فقط." },
};

const rolePools: Record<PassengerCategory, string[]> = {
  COMMAND: ["Mission Commander", "Security Lead", "Command Liaison", "Operations Director"],
  "PILOTS & FLIGHT": ["Pilot", "Navigation Officer", "Flight Engineer", "Shuttle Captain"],
  "ENGINEERING & WORKERS": ["Thermal Engineer", "Systems Technician", "Power Grid Operator", "Fabricator", "Hull Integrity Tech", "Agricultural Worker"],
  "SCIENCE / MEDICAL": ["Cryomedic", "Neural Systems Analyst", "Xenobiologist", "Research Surgeon", "Behavioral Scientist"],
  "FAMILIES & COLONISTS": ["Teacher", "Surveyor", "Archive Curator", "Botanist", "Mechanic", "Child", "Caregiver"],
};

const locations = ["CRYO DECK / RACK C", "ENGINEERING / LOOP 02", "MEDICAL / TRIAGE", "BOTANY / RING 04", "COMMAND / BRIDGE", "HABITAT / SPINE 01", "ARCHIVE / COLD STORAGE"];

const specialCrew: Record<string, Partial<CrewMember>> = {
  "passenger-001": { name: "Alma Velez", handle: "A.VELEZ", role: "Mission Commander", department: "COMMAND", clearance: "ROOT", status: "FLAGGED", location: "COMMAND / BRIDGE", note: "Última autoridade registrada antes do bloqueio de memória." },
  "passenger-014": { name: "Ivo Chen", handle: "I.CHEN", role: "Pilot", department: "FLIGHT", clearance: "OFFICER", status: "UNKNOWN", location: "FLIGHT / NAV COMPUTER", note: "Mapeou uma queda de calor que não aparece nos relatórios oficiais." },
  "passenger-227": { name: "Sana Okafor", handle: "S.OKAFOR", role: "Cryomedic", department: "MEDICAL", clearance: "OFFICER", status: "CRYO_STABLE", location: "MEDICAL / TRIAGE", note: "Inseriu uma nota privada no prontuário da cápsula 601." },
  "passenger-344": { name: "Mara Ilyin", handle: "M.ILYIN", role: "Neural Systems Analyst", department: "SCIENCE", clearance: "OFFICER", status: "FLAGGED", location: "LAB / NEURAL LINK", note: "A única pessoa que marcou Memory_Wipe como evento provocado." },
  "passenger-600": { name: "Noor Baptiste", handle: "N.BAPTISTE", role: "Hydroponics Lead", department: "BOTANY", clearance: "CREW", status: "LIFE_SUPPORT_LOW", location: "BOTANY / RING 04", note: "Seu relógio biológico é a única fonte de tempo não corrompida." },
};

function pad(value: number, digits = 3) { return String(value).padStart(digits, "0"); }

function categoryFor(position: number): PassengerCategory {
  if (position <= 36) return "COMMAND";
  if (position <= 72) return "PILOTS & FLIGHT";
  if (position <= 252) return "ENGINEERING & WORKERS";
  if (position <= 372) return "SCIENCE / MEDICAL";
  return "FAMILIES & COLONISTS";
}

function departmentFor(category: PassengerCategory) {
  if (category === "COMMAND") return "COMMAND";
  if (category === "PILOTS & FLIGHT") return "FLIGHT";
  if (category === "ENGINEERING & WORKERS") return "ENGINEERING / WORKS";
  if (category === "SCIENCE / MEDICAL") return "SCIENCE / MED";
  return "COLONY / HABITAT";
}

function createFamilies(): FamilyRecord[] {
  return Array.from({ length: 150 }, (_, familyPosition) => {
    const profile = languageProfiles[familyPosition % languageProfiles.length];
    const surname = profile.surnames[familyPosition % profile.surnames.length];
    const id = `family-${pad(familyPosition + 1)}`;
    return { id, surname, nationality: profile.nationality, language: profile.code, members: [], note: languageCopy[profile.code].family };
  });
}

function createCrew(families: FamilyRecord[]): CrewMember[] {
  return Array.from({ length: 600 }, (_, position) => {
    const capsule = position + 1;
    const id = `passenger-${pad(capsule)}`;
    const family = families[Math.floor(position / 4)];
    const profile = languageProfiles.find((item) => item.code === family.language) ?? languageProfiles[0];
    const category = categoryFor(capsule);
    const kinship: CrewMember["kinship"] = position % 4 === 0 ? "PARENT" : position % 4 === 1 ? "PARTNER" : position % 4 === 2 ? "DEPENDENT" : "SIBLING";
    const given = profile.given[(position + capsule) % profile.given.length];
    const overrides = specialCrew[id] ?? {};
    const roleList = rolePools[category];
    const member: CrewMember = {
      id,
      name: `${given} ${family.surname}`,
      handle: `${given[0]}.${family.surname.slice(0, 6).toUpperCase()}`,
      familyId: family.id,
      familyName: family.surname,
      kinship,
      nationality: profile.nationality,
      language: profile.code,
      languageLabel: profile.label,
      role: roleList[position % roleList.length],
      department: departmentFor(category),
      category,
      capsule,
      clearance: category === "COMMAND" ? "OFFICER" : "CREW",
      status: capsule % 47 === 0 ? "UNKNOWN" : capsule % 61 === 0 ? "FLAGGED" : capsule === 600 ? "LIFE_SUPPORT_LOW" : "CRYO_STABLE",
      location: locations[capsule % locations.length],
      note: `Manifest passenger ${pad(capsule)} // family ${family.id} // ${profile.nationality}.`,
      ...overrides,
    };
    family.members.push(member.id);
    return member;
  });
}

function baseFile(input: Omit<SeedFile, "directory" | "name"> & { path: string; directory?: string; name?: string }): SeedFile {
  const slash = input.path.lastIndexOf("/");
  return { ...input, directory: slash === 0 ? "/" : input.path.slice(0, slash), name: input.path.slice(slash + 1) };
}

function personalFiles(member: CrewMember, family: FamilyRecord): SeedFile[] {
  const base = `/personal/${member.id}`;
  const copy = languageCopy[member.language];
  const profilePath = `${base}/diary.SCR`;
  const journalSeries = createJournalSeries(member.language, { family: family.id.toUpperCase(), handle: member.handle, role: member.role, capsule: member.capsule, location: member.location });
  const journalLinks: SeedLink[] = journalSeries.map((entry, index) => ({ target: `${base}/journal/day-${pad(index + 1, 2)}.SCR`, label: `DAY_${pad(index + 1, 2)}`, relation: entry.title, signal: index === journalSeries.length - 1 ? "amber" : "clear" }));
  const links: SeedLink[] = [{ target: `${base}/family-photo.VIS`, label: "FAMILY_PHOTO", relation: "memória", signal: "clear" }, { target: `/families/${family.id}.SCR`, label: family.id.toUpperCase(), relation: "grupo familiar", signal: "amber" }, { target: `/corporate/${member.id}/personnel.SCR`, label: "SEED_PERSONNEL", relation: "registro corporativo" }, ...journalLinks];
  const files: SeedFile[] = [
    baseFile({ path: profilePath, extension: ".SCR", kind: "text", directory: "", name: "", size: `${Math.max(7, Math.round(journalSeries.flatMap((entry) => entry.lines).join(" ").length / 18))} KB`, updated: `T-${pad((member.capsule * 13) % 24)}:17:04`, ownerId: member.id, familyId: family.id, layer: "PERSONAL", language: member.language, summary: `Índice cronológico do diário pessoal de ${member.name}, com ${journalSeries.length} entradas datadas em ${member.languageLabel}.`, clearance: "CREW", payload: { kind: "text", language: member.language, lines: [`PERSONAL JOURNAL INDEX // ${member.handle}`, `LANGUAGE     : ${member.language}`, `FAMILY       : ${family.id}`, `ENTRIES      : ${journalSeries.length}`, "", ...journalSeries.map((entry, index) => `${pad(index + 1, 2)}  ${entry.stamp.padEnd(19)}  ${entry.title}`), "", copy.diary, "", `OPEN /journal/day-01.SCR THROUGH /journal/day-${pad(journalSeries.length)}.SCR FOR THE FULL LEDGER.`] }, links, keywords: [member.name, member.handle, family.id, member.nationality, member.language, "diary", "journal", "day"], system: false }),
    baseFile({ path: `${base}/document.SCR`, extension: ".SCR", kind: "text", directory: "", name: "", size: "1.4 KB", updated: "T-31:06:22", ownerId: member.id, familyId: family.id, layer: "PERSONAL", language: member.language, summary: `Documento privado de ${member.name}; contém vocabulário e referências pessoais.`, clearance: "CREW", payload: { kind: "text", language: member.language, lines: [`PRIVATE DOCUMENT // ${member.handle}`, `NATIONALITY : ${member.nationality}`, `KINSHIP     : ${member.kinship}`, `ROLE        : ${member.role}`, "", copy.document, "", copy.family] }, links: [{ target: profilePath, label: "DIARY", relation: "contexto" }, { target: `${base}/playlist.MUS`, label: "PLAYLIST", relation: "senha contextual", signal: "amber" }], keywords: [member.name, member.role, member.nationality, "document"], system: false }),
    baseFile({ path: `${base}/family-photo.VIS`, extension: ".VIS", kind: "visual", directory: "", name: "", size: "2.8 MB", updated: "T-44:09:12", ownerId: member.id, familyId: family.id, layer: "PERSONAL", language: member.language, summary: `Fotografia de família preservada no terminal pessoal de ${member.name}.`, clearance: "CREW", payload: { kind: "visual", language: member.language, caption: `FAMILY PHOTO // ${family.id} // ${member.nationality}`, alt: `Foto pessoal da família ${family.surname}`, telemetry: [`SUBJECTS : 04`, `LANGUAGE : ${member.language}`, `ORIGIN   : HABITAT / SPINE 01`, `HASH     : ${member.capsule.toString(16).toUpperCase()}-${family.id.slice(-3)}`] }, links: [{ target: `/families/${family.id}.SCR`, label: family.id.toUpperCase(), relation: "família" }, { target: `${base}/diary.SCR`, label: "DIARY", relation: "legenda" }], keywords: [family.surname, member.nationality, member.language, "photo", "family"], system: false }),
    baseFile({ path: `${base}/playlist.MUS`, extension: ".MUS", kind: "audio", directory: "", name: "", size: member.id === "passenger-014" ? "REMOTE / 03 TRACKS" : "5.6 MB", updated: "T-12:42:10", ownerId: member.id, familyId: family.id, layer: "PERSONAL", language: member.language, summary: member.id === "passenger-014" ? "Contêiner musical remoto; o manifesto não expõe a origem da transmissão ao operador." : `Arquivo musical pessoal de ${member.name}; a faixa final contém uma anomalia de duração.`, clearance: "CREW", payload: { kind: "audio", audioType: "MUSIC", title: member.id === "passenger-014" ? "TIDAL / LOW FREQUENCY SEQUENCE" : `${family.surname} / personal sequence`, artist: member.id === "passenger-014" ? "I.CHEN / PRIVATE CHANNEL" : member.name, codec: member.id === "passenger-014" ? "SEED-REMOTE/1" : "SEED-AUDIO/2", language: member.language, duration: member.id === "passenger-014" ? "04:42" : "03:41", transcript: copy.song, waveform: [18, 35, 62, 28, 75, 42, 90, 31, 54, 78, 22, 66, 46, 81, 38, 59, 24, 71], ...(member.id === "passenger-014" ? { remoteEmbed: "https://suno.com/playlist/1f6ff908-78b0-44e2-ac1a-d89cbe9438f1", remoteProvider: "PUBLIC_PLAYLIST" as const } : {}) }, links: [{ target: `${base}/document.SCR`, label: "DOCUMENT", relation: "arquivo relacionado", signal: "amber" }], keywords: [member.name, member.language, "music", "audio", "playlist", ...(member.id === "passenger-014" ? ["remote", "tidal", "lofi"] : [])], system: false }),
    baseFile({ path: `/corporate/${member.id}/personnel.SCR`, extension: ".SCR", kind: "text", directory: "", name: "", size: "3.0 KB", updated: "T-09:00:00", ownerId: member.id, familyId: family.id, layer: "CORPORATE", language: "SEED-OPS", summary: `Registro corporativo Seed Corp de ${member.name}; idioma operacional Seed-OPS.`, clearance: member.clearance, payload: { kind: "text", language: "SEED-OPS", lines: [`SEED CORP PERSONNEL RECORD // ${member.handle}`, `PASSENGER  : ${pad(member.capsule)}`, `NAME       : ${member.name}`, `NATIONALITY: ${member.nationality}`, `LANGUAGE   : ${member.language}`, `FAMILY     : ${family.id} / ${family.surname}`, `ROLE       : ${member.role}`, `DEPARTMENT : ${member.department}`, `CLEARANCE  : ${member.clearance}`, `STATUS     : ${member.status}`, `CAPSULE    : ${pad(member.capsule)}`, "", member.note] }, links: [{ target: profilePath, label: "PERSONAL_DIARY", relation: "voz original", signal: "amber" }, { target: `/families/${family.id}.SCR`, label: family.id.toUpperCase(), relation: "dependentes" }], keywords: [member.name, member.handle, member.role, member.department, member.nationality, member.language, "corporate"], system: false }),
    baseFile({ path: `/corporate/${member.id}/biometrics.HLT`, extension: ".HLT", kind: "health", directory: "", name: "", size: "3.4 KB", updated: "T-18:10:02", ownerId: member.id, familyId: family.id, layer: "CORPORATE", language: "SEED-OPS", summary: `Prontuário corporativo de ${member.name}; acesso de saúde registrado pela Seed Corp.`, clearance: "CREW", payload: { kind: "health", language: "SEED-OPS", vitals: [{ label: "CRYO TEMP", value: member.status === "LIFE_SUPPORT_LOW" ? "−171.2°C" : "−178.4°C", status: member.status === "LIFE_SUPPORT_LOW" ? "warning" : "stable" }, { label: "NEURAL LINK", value: member.id === "passenger-344" ? "BUFFER DRIFT" : "NOMINAL", status: member.id === "passenger-344" ? "critical" : "stable" }, { label: "O2 RESERVE", value: member.status === "LIFE_SUPPORT_LOW" ? "14%" : "86%", status: member.status === "LIFE_SUPPORT_LOW" ? "critical" : "stable" }], note: member.id === "passenger-227" ? "PRIVATE MEDICAL FLAG: capsule 601 absent from passenger manifest." : "No persistent anomaly." }, links: [{ target: `/corporate/${member.id}/personnel.SCR`, label: "PERSONNEL", relation: "identidade" }], keywords: [member.name, member.nationality, member.language, "health", "biometric"], system: false }),
  ];
  const dailyFiles: SeedFile[] = journalSeries.map((entry, index) => baseFile({
    path: `${base}/journal/day-${pad(index + 1, 2)}.SCR`,
    extension: ".SCR", kind: "text", directory: "", name: "", size: "1.8 KB", updated: `T-${pad(5 - index)}:12:${pad(7 + index)}`,
    ownerId: member.id, familyId: family.id, layer: "PERSONAL", language: member.language,
    summary: `${entry.stamp}: ${entry.title.toLowerCase()} — registro pessoal de ${member.name}.`, clearance: "CREW",
    payload: { kind: "text", language: member.language, lines: [`PERSONAL JOURNAL // ${member.handle}`, `CAPSULE          : ${pad(member.capsule)}`, `ENTRY            : ${pad(index + 1, 2)} / ${journalSeries.length}`, `TIMESTAMP        : ${entry.stamp}`, `LOCATION         : ${member.location}`, "", entry.title, "", ...entry.lines] },
    links: [{ target: profilePath, label: "JOURNAL_INDEX", relation: "índice cronológico" }],
    keywords: [member.name, member.handle, family.id, member.language, "journal", "diary", "day", entry.title], system: false,
  }));
  files.push(...dailyFiles);
  if (member.capsule % 3 === 0 || member.id === "passenger-014") files.push(baseFile({ path: `${base}/memory-video.VIS`, extension: ".VIS", kind: "visual", directory: "", name: "", size: "18.2 MB", updated: "T-27:11:52", ownerId: member.id, familyId: family.id, layer: "PERSONAL", language: member.language, summary: `Vídeo pessoal comprimido no terminal de ${member.name}; o áudio não foi indexado.`, clearance: "CREW", payload: { kind: "visual", language: member.language, caption: `PERSONAL VIDEO // ${member.handle}`, alt: `Vídeo pessoal de ${member.name}`, telemetry: ["FRAME RATE : 24", `SUBTITLES  : ${member.language}`, "AUDIO HASH : PRESENT", "SEED TAG   : NONE"] }, links: [{ target: profilePath, label: "DIARY", relation: "contexto" }], keywords: [member.name, member.language, "video", "memory"], system: false }));
  if (member.capsule % 23 === 0 || member.id === "passenger-014" || member.id === "passenger-227" || member.id === "passenger-600") files.push(personalProgram(member, family));
  if (member.capsule % 37 === 0 || member.id === "passenger-014" || member.id === "passenger-227" || member.id === "passenger-600") files.push(personalCredential(member, family));
  return files;
}

function personalProgram(member: CrewMember, family: FamilyRecord): SeedFile {
  const isUtility = member.id === "passenger-014" || member.id === "passenger-227" || member.id === "passenger-600";
  const action: ActionSpec | undefined = member.id === "passenger-014" ? { id: "stabilize-loop", label: "STABILIZE LOOP_02", requires: ["LOOP_02"], output: ["calibrator: handshake accepted", "thermal loop 02: oscillation reduced", "network: one private channel now visible"], effects: { network: "STABLE", service: "LOOP_02" } } : member.id === "passenger-227" ? { id: "cryo-override", label: "OPEN CRYO OVERRIDE", requires: ["CRYO_MED"], output: ["medical override: accepted", "cryo deck: capsule 601 diagnostic channel unlocked"], effects: { service: "CAPSULE_601" } } : member.id === "passenger-600" ? { id: "hydro-cycle", label: "RESTORE HYDROPONICS CYCLE", requires: ["BOTANY"], output: ["botany cycle: manual sequence accepted", "oxygen forecast: +02% over 00:18:00"], effects: { oxygen: 2, service: "RING_04" } } : undefined;
  return baseFile({ path: `/personal/${member.id}/${isUtility ? "seed-tool" : "family-application"}.PROC`, extension: ".PROC", kind: "program", directory: "", name: "", size: isUtility ? "7.2 KB" : "12.4 KB", updated: "T-06:12:00", ownerId: member.id, familyId: family.id, layer: "PERSONAL", language: member.language, summary: isUtility ? `Ferramenta pessoal de ${member.name}; pode afetar um subsistema da nave.` : `Aplicação pessoal preservada por ${member.name}; o estado local contém uma sequência de acesso.`, clearance: "CREW", payload: { kind: "program", language: member.language, programType: isUtility ? "UTILITY" : "APPLICATION", code: isUtility ? [`// ${member.handle} / personal utility`, `// language: ${member.language}`, `// owner: ${family.id}`, `RUN MODE: ${action?.label ?? "LOCAL"}`, "VERIFY HANDSHAKE BEFORE EXECUTION"] : [`// ${member.handle} / family application`, `// language: ${member.language}`, "LOAD PROFILE", "LOCAL STATE .......... 7F-A1", "ARCHIVE SCORE ........ 0417", "EXIT TO SEED OS"], action }, links: [{ target: `/personal/${member.id}/diary.SCR`, label: "DIARY", relation: "manual de uso" }, { target: `/corporate/${member.id}/personnel.SCR`, label: "SEED_PERSONNEL", relation: "permissão", signal: isUtility ? "amber" : "clear" }], keywords: [member.name, member.role, member.language, "program", isUtility ? "utility" : "application"], system: false });
}

function personalCredential(member: CrewMember, family: FamilyRecord): SeedFile {
  const guestRecoveryCredential = member.id === "passenger-014";
  const special = member.id === "passenger-014" ? { service: "LOOP_02", username: "I.CHEN", secret: "TIDAL-04", hint: "a maré baixa aparece na última faixa da playlist", target: "/engineering/loop-02/thermal.VIS" } : member.id === "passenger-227" ? { service: "CRYO_MED", username: "S.OKAFOR", secret: "SIX-HUNDRED", hint: "o nome da cápsula que não deveria existir", target: "/cryo/capsule-601/neural-link.HLT" } : member.id === "passenger-600" ? { service: "BOTANY", username: "N.BAPTISTE", secret: "RING-04", hint: "o anel onde as plantas ainda respiram", target: "/botany/ring-04/cycle.ATA" } : { service: `FAMILY_${family.id.slice(-3)}`, username: member.handle, secret: `FAM-${member.capsule.toString(16).toUpperCase()}`, hint: "use a data da foto da família", target: `/personal/${member.id}/family-photo.VIS` };
  return baseFile({ path: `/personal/${member.id}/saved-passwords.SCR`, extension: ".SCR", kind: "credential", directory: "", name: "", size: "0.9 KB", updated: "T-04:01:01", ownerId: member.id, familyId: family.id, layer: "PERSONAL", language: member.language, summary: guestRecoveryCredential ? `Cofre de recuperação de ${member.name}; uma ACL órfã permite leitura pelo fallback local.` : `Senhas salvas por ${member.name}; algumas credenciais podem abrir subsistemas da nave.`, clearance: guestRecoveryCredential ? "GUEST" : "CREW", payload: { kind: "credential", language: member.language, service: special.service, username: special.username, secret: special.secret, hint: special.hint, target: special.target }, links: [{ target: `/personal/${member.id}/playlist.MUS`, label: "PLAYLIST", relation: "arquivo relacionado", signal: "amber" }, { target: special.target, label: special.service, relation: "alvo funcional", signal: "red" }], keywords: [member.name, member.language, special.service, "password", "credential", special.target, ...(guestRecoveryCredential ? ["recovery", "fallback", "guest"] : [])], system: false });
}

function familyFiles(family: FamilyRecord, crew: CrewMember[]): SeedFile {
  const members = crew.filter((member) => member.familyId === family.id);
  return baseFile({ path: `/families/${family.id}.SCR`, extension: ".SCR", kind: "text", directory: "", name: "", size: "2.7 KB", updated: "T-38:20:00", familyId: family.id, layer: "CORPORATE", language: "SEED-OPS", summary: `Manifesto familiar ${family.id}; quatro passageiros ligados por arquivos pessoais em ${family.language}.`, clearance: "CREW", payload: { kind: "text", language: "SEED-OPS", lines: [`FAMILY MANIFEST // ${family.id}`, `SURNAME     : ${family.surname}`, `NATIONALITY : ${family.nationality}`, `NATIVE LANG : ${family.language}`, "", ...members.map((member) => `${member.kinship.padEnd(10)} ${member.handle.padEnd(10)} ${member.name}`), "", family.note] }, links: members.map((member) => ({ target: `/corporate/${member.id}/personnel.SCR`, label: member.handle, relation: "membro" })), keywords: [family.id, family.surname, family.nationality, family.language, "family", "manifest"], system: false });
}

function createSystemFiles(): SeedFile[] {
  return [
    baseFile({ path: "/BOOT.ATA", extension: ".ATA", kind: "incident", directory: "", name: "", size: "12.8 KB", updated: "T+00:00:00", layer: "SYSTEM", language: "SEED-OPS", summary: "Registro de inicialização do Seed OS e montagem do VFS.", clearance: "GUEST", payload: { kind: "incident", language: "SEED-OPS", severity: "CRITICAL", events: ["00:00:00  MEMORY CHECK ................. PASS", "00:00:05  VFS /SHIP mounted READ_ONLY", "00:00:11  PASSENGERS 001—600 .......... PRESENT", "00:00:23  CAPSULE 601 .................. UNREGISTERED", "00:00:27  Neural_Buffer_Corrupted", "00:00:30  FALLBACK MODE: GUEST"] }, links: [{ target: "/cryo/capsule-601/scan.VIS", label: "CAPSULE_601", relation: "setor anômalo", signal: "red" }, { target: "/corporate/passenger-001/personnel.SCR", label: "A.VELEZ", relation: "autoridade do boot", signal: "amber" }], keywords: ["boot", "capsule 601", "memory", "guest", "600"], system: true }),
    baseFile({ path: "/seed/manifest.SCR", extension: ".SCR", kind: "text", directory: "", name: "", size: "42.0 KB", updated: "T-00:00:01", layer: "CORPORATE", language: "SEED-OPS", summary: "Manifesto corporativo dos 600 passageiros e 150 famílias.", clearance: "GUEST", payload: { kind: "text", language: "SEED-OPS", lines: ["SEED CORP / PASSENGER MANIFEST", "PASSENGERS ........ 600", "FAMILIES .......... 150", "COMMAND ........... 036", "PILOTS / FLIGHT ... 036", "ENGINEERING / WORKS 180", "SCIENCE / MEDICAL . 120", "FAMILIES / COLONISTS 228", "LANGUAGES .......... 08", "", "NOTE: personal records remain in native language.", "NOTE: corporate records use SEED-OPS."] }, links: [{ target: "/families/family-001.SCR", label: "FAMILY_001", relation: "primeiro grupo" }, { target: "/corporate/passenger-001/personnel.SCR", label: "A.VELEZ", relation: "comando", signal: "amber" }], keywords: ["manifest", "600", "families", "languages", "corporate"], system: true }),
    baseFile({ path: "/seed/telemetry.SCR", extension: ".SCR", kind: "text", directory: "", name: "", size: "4.2 KB", updated: "LIVE", layer: "SYSTEM", language: "SEED-OPS", summary: "Telemetria crítica da nave; três leituras foram removidas do painel público.", clearance: "GUEST", payload: { kind: "text", language: "SEED-OPS", lines: ["SEED OS // TELEMETRY SNAPSHOT", "", "POWER      : 31% // uneven draw", "LIFE SUPPORT: 14% // reserve unstable", "HULL       : 72% // ring 04 puncture", "NETWORK    : fragmented / sniffable", "MEMORY     : 86% / 3 bad sectors", "", "WARNING: public panel omits 3 private channels."] }, links: [{ target: "/net/ghost-packet.REC", label: "GHOST_PACKET", relation: "canal privado", signal: "red" }, { target: "/apps/sniff.PROC", label: "SNIFF", relation: "ferramenta" }], keywords: ["telemetry", "life support", "power", "hull"], system: true }),
    baseFile({ path: "/ship/operations/incident-601.ATA", extension: ".ATA", kind: "incident", directory: "", name: "", size: "9.1 KB", updated: "T-03:11:46", layer: "SYSTEM", language: "SEED-OPS", summary: "Ata de serviço parcialmente reescrita durante o apagão.", clearance: "CREW", payload: { kind: "incident", language: "SEED-OPS", severity: "CRITICAL", events: ["[T-03:11:46] COMMAND AUTHORITY revoked by local process", "[T-03:12:01] Passenger manifest checksum: 600 / capsule 601", "[T-03:12:08] M.ILYIN requested neural wipe quarantine", "[T-03:12:11] A.VELEZ approved manual override", "[T-03:12:13] audio channel sealed — reason: PERSONAL"] }, links: [{ target: "/corporate/passenger-344/personnel.SCR", label: "M.ILYIN", relation: "solicitante", signal: "red" }, { target: "/corporate/passenger-001/personnel.SCR", label: "A.VELEZ", relation: "aprovou", signal: "amber" }, { target: "/cryo/capsule-601/neural-link.HLT", label: "NEURAL_LINK", relation: "evidência", signal: "red" }], keywords: ["incident", "authority", "wipe", "checksum", "601"], system: true }),
    baseFile({ path: "/cryo/capsule-601/scan.VIS", extension: ".VIS", kind: "visual", directory: "", name: "", size: "842 KB", updated: "T-03:12:04", layer: "SYSTEM", language: "SEED-OPS", summary: "Quadro estático da cápsula sem assinatura no manifest.", clearance: "CREW", payload: { kind: "visual", language: "SEED-OPS", caption: "CAPSULE 601 // VISUAL FORENSICS", alt: "Baía criogênica industrial em uma nave escura", telemetry: ["GLASS TEMP  : −171.2°C", "LIFE SIGNAL : PRESENT", "OWNER ID    : null", "MANIFEST    : checksum mismatch"] }, links: [{ target: "/cryo/capsule-601/neural-link.HLT", label: "NEURAL_LINK", relation: "mesma captura", signal: "red" }, { target: "/corporate/passenger-227/biometrics.HLT", label: "S.OKAFOR", relation: "comentário médico", signal: "amber" }], keywords: ["visual", "cryo", "capsule 601", "manifest"], system: true }),
    baseFile({ path: "/cryo/capsule-601/neural-link.HLT", extension: ".HLT", kind: "health", directory: "", name: "", size: "6.0 KB", updated: "T-03:12:08", layer: "SYSTEM", language: "SEED-OPS", summary: "Prontuário órfão com assinatura neural parcialmente apagada.", clearance: "OFFICER", payload: { kind: "health", language: "SEED-OPS", vitals: [{ label: "NEURAL BUFFER", value: "CORRUPTED", status: "critical" }, { label: "IDENTITY HASH", value: "7F-A1-??-C0", status: "warning" }, { label: "VITALS", value: "PRESENT / LOW", status: "critical" }], note: "Pergunta operacional: por que a cápsula 601 foi adicionada depois do fechamento do manifest?" }, links: [{ target: "/corporate/passenger-344/personnel.SCR", label: "M.ILYIN", relation: "classificou", signal: "red" }, { target: "/net/ghost-packet.REC", label: "GHOST_PACKET", relation: "contém chave", signal: "amber" }], keywords: ["neural", "identity", "memory wipe", "capsule 601"], integrity: "CORRUPTED", corruption: ["sector 04: checksum mismatch", "identity hash fragment: 7F-A1", "payload: 31% unreadable"], access: { username: "GUEST", secret: "7F-A1", authority: "OFFICER", lockoutAfter: 3 }, system: true }),
    baseFile({ path: "/net/ghost-packet.REC", extension: ".REC", kind: "audio", directory: "", name: "", size: "1.4 MB", updated: "T-03:12:10", layer: "SYSTEM", language: "SEED-OPS", summary: "Interceptação de voz fora do canal oficial; timestamps não batem com o relógio da nave.", clearance: "OFFICER", payload: { kind: "audio", language: "SEED-OPS", duration: "00:17", transcript: "[voz não indexada] Se a cápsula acordar, não entregue a ela o nome. O Seed OS vai tentar completar o vazio. Procure o pulso em LOOP_02. Ivo sabe qual arquivo não deveria existir.", waveform: [12, 28, 17, 52, 34, 72, 40, 26, 68, 46, 84, 28, 56, 18, 76, 38, 92, 44, 24, 60] }, links: [{ target: "/corporate/passenger-014/personnel.SCR", label: "I.CHEN", relation: "nome citado", signal: "amber" }, { target: "/engineering/loop-02/thermal.VIS", label: "LOOP_02", relation: "origem do pulso", signal: "red" }], keywords: ["voice", "intercept", "ghost", "loop 02"], integrity: "ENCRYPTED", corruption: ["codec key missing", "timestamp offset: +00:04:17"], access: { username: "I.CHEN", secret: "TIDAL-04", authority: "OFFICER", lockoutAfter: 4 }, system: true }),
    baseFile({ path: "/engineering/loop-02/thermal.VIS", extension: ".VIS", kind: "visual", directory: "", name: "", size: "392 KB", updated: "T-03:10:41", layer: "SYSTEM", language: "SEED-OPS", summary: "Leitura térmica do loop 02; a anomalia coincide com a playlist de I. Chen.", clearance: "CREW", payload: { kind: "visual", language: "SEED-OPS", caption: "ENGINEERING LOOP 02 // THERMAL TRACE", alt: "Diagrama térmico de um loop de engenharia", telemetry: ["DRAW       : 08.4°C ABOVE BASELINE", "PULSE      : 00:04:17", "AUTH       : LOCAL / REVOKED", "NOTE       : run personal calibrator"] }, links: [{ target: "/personal/passenger-014/seed-tool.PROC", label: "SEED_TOOL", relation: "ferramenta pessoal", signal: "amber" }, { target: "/personal/passenger-014/saved-passwords.SCR", label: "LOOP_02", relation: "credencial", signal: "red" }], keywords: ["thermal", "loop 02", "pulse", "engineering"], system: true }),
    baseFile({ path: "/botany/ring-04/cycle.ATA", extension: ".ATA", kind: "incident", directory: "", name: "", size: "4.6 KB", updated: "T-08:14:29", layer: "SYSTEM", language: "SEED-OPS", summary: "Ciclo de hidroponia interrompido; o acesso manual ainda aceita uma ferramenta pessoal.", clearance: "CREW", payload: { kind: "incident", language: "SEED-OPS", severity: "WARNING", events: ["RING_04 / HYDROPONICS CYCLE", "WATER LOOP .......... PAUSED", "OXYGEN FORECAST ...... −02% / 00:18:00", "MANUAL SERVICE ........ AVAILABLE", "OWNER TRACE ........... N.BAPTISTE"] }, links: [{ target: "/personal/passenger-600/seed-tool.PROC", label: "SEED_TOOL", relation: "ferramenta" }, { target: "/personal/passenger-600/saved-passwords.SCR", label: "BOTANY", relation: "credencial", signal: "amber" }], keywords: ["botany", "ring 04", "hydroponics", "oxygen"], system: true }),
    baseFile({ path: "/apps/edit.PROC", extension: ".PROC", kind: "program", directory: "", name: "", size: "5.8 KB", updated: "T-00:30:00", layer: "SYSTEM", language: "SEED-OPS", summary: "Editor de scripts local; modo seguro, sem persistência fora da sessão.", clearance: "GUEST", payload: { kind: "program", language: "SEED-OPS", programType: "UTILITY", code: ["SEED EDIT 0.9", "MODE: SAFE / LOCAL", "commands: append, inspect, compile", "warning: no root write access"] }, links: [], keywords: ["edit", "script", "program"], system: true }),
    baseFile({ path: "/apps/calc.PROC", extension: ".PROC", kind: "program", directory: "", name: "", size: "3.9 KB", updated: "T-00:30:00", layer: "SYSTEM", language: "SEED-OPS", summary: "Calculadora hexadecimal e conversor de telemetria.", clearance: "GUEST", payload: { kind: "program", language: "SEED-OPS", programType: "UTILITY", code: ["SEED CALC 0.9", "HEX / DEC / O2 BURN RATE", "input: calc 0x7F + 1"] }, links: [], keywords: ["calc", "hex", "decimal", "program"], system: true }),
    baseFile({ path: "/apps/sniff.PROC", extension: ".PROC", kind: "program", directory: "", name: "", size: "8.7 KB", updated: "T-00:30:00", layer: "SYSTEM", language: "SEED-OPS", summary: "Ferramenta para observar canais fragmentados da rede.", clearance: "CREW", payload: { kind: "program", language: "SEED-OPS", programType: "UTILITY", code: ["SNIFF 1.4 // PASSIVE MODE", "channels: public, crew, ghost", "warning: packet traces may identify the observer"] }, links: [{ target: "/net/ghost-packet.REC", label: "GHOST_PACKET", relation: "canal" }], keywords: ["sniff", "network", "ghost", "program"], system: true }),
    baseFile({ path: "/apps/player.PROC", extension: ".PROC", kind: "program", directory: "", name: "", size: "6.2 KB", updated: "T-00:30:00", layer: "SYSTEM", language: "SEED-OPS", summary: "Reprodutor de áudio Seed OS; mantém uma faixa no dispositivo local.", clearance: "GUEST", payload: { kind: "program", language: "SEED-OPS", programType: "APPLICATION", code: ["SEED AUDIO PLAYER 0.7", "device: /dev/audio0", "commands: PLAY PAUSE RESUME STOP AUDIO", "source: proprietary .MUS container", "note: playback requires a user gesture"] }, links: [{ target: "/seed/manifest.SCR", label: "MANIFEST", relation: "aplicação instalada" }], keywords: ["player", "audio", "music", "MUS", "program"], system: true }),
    baseFile({ path: "/apps/ide.PROC", extension: ".PROC", kind: "program", directory: "", name: "", size: "14.8 KB", updated: "T-00:30:00", layer: "SYSTEM", language: "SEED-OPS", summary: "Ambiente de edição e compilação para programas Seed Script; sem escrita direta em dispositivos.", clearance: "GUEST", payload: { kind: "program", language: "SEED-OPS", programType: "APPLICATION", code: ["SEED IDE 1.0 // WORKBENCH", "source: /workspace/*.SCR", "commands: EDIT COMPILE TEST INSTALL", "language: SEED SCRIPT / bounded runtime", "policy: read-before-write / no host bindings", "output: derived .PROC entrypoint"] }, links: [{ target: "/library/programming/seed-script-field-guide.BOOK", label: "FIELD_GUIDE", relation: "manual de linguagem" }, { target: "/apps/edit.PROC", label: "EDITOR", relation: "editor de origem" }], keywords: ["ide", "compiler", "seed script", "workspace", "program"], system: true }),
    baseFile({ path: "/apps/msg.PROC", extension: ".PROC", kind: "program", directory: "", name: "", size: "9.6 KB", updated: "T-00:30:00", layer: "SYSTEM", language: "SEED-OPS", summary: "Cliente oficial de mensagens; preserva fila, entrega, leitura e anexos assinados.", clearance: "GUEST", payload: { kind: "program", language: "SEED-OPS", programType: "APPLICATION", code: ["SEED MSG 2.2 // OFFICIAL QUEUE", "commands: INBOX OPEN REPLY MARK", "states: QUEUED DELIVERED UNREAD READ", "attachments: .SCR .REC .VIS .BOOK", "policy: official channel only / ghost traffic excluded"] }, links: [{ target: "/comms/seed/mission-brief-001.MSG", label: "PUBLIC_QUEUE", relation: "fila inicial" }, { target: "/library/communications/seed-messaging.BOOK", label: "PROTOCOL", relation: "manual de comunicação" }], keywords: ["message", "official", "inbox", "queue", "communication"], system: true }),
    baseFile({ path: "/apps/backdoor_exploit.PROC", extension: ".PROC", kind: "program", directory: "", name: "", size: "0 B", updated: "CORRUPTED", layer: "SYSTEM", language: "SEED-OPS", summary: "Programa de serviço incompleto; o cabeçalho de compilação não foi preservado.", clearance: "ROOT", payload: { kind: "program", language: "SEED-OPS", programType: "SCRIPT", code: ["// binary missing", "// source sector unavailable", "// requires: identity, credential, authority"] }, links: [{ target: "/apps/edit.PROC", label: "EDIT", relation: "compilador" }], keywords: ["backdoor", "root", "exploit", "program"], integrity: "CORRUPTED", corruption: ["header missing", "binary length: 0 B", "signature: UNSIGNED"], access: { username: "ROOT", secret: "NEURAL_BUFFER", authority: "ROOT", lockoutAfter: 5 }, system: true }),
  ];
}

function corporateDocument(input: {
  path: string;
  extension: ".SCR" | ".ATA";
  documentType: CorporateDocumentType;
  eventTime: string;
  updated?: string;
  authorId?: string;
  recipientIds?: string[];
  department?: string;
  accessTerminal?: string;
  supersedes?: string;
  contradiction?: string;
  summary: string;
  clearance: "GUEST" | "CREW" | "OFFICER" | "ROOT";
  lines: string[];
  links: SeedLink[];
  keywords: string[];
}): SeedFile {
  return baseFile({ ...input, updated: input.updated ?? input.eventTime, layer: "CORPORATE", language: "SEED-OPS", kind: input.documentType === "SYSTEM_LOG" || input.documentType === "ACCESS_LOG" ? "incident" : "text", size: `${Math.max(1, Math.round(input.lines.join("\n").length / 14))} KB`, payload: { kind: "text", language: "SEED-OPS", lines: input.lines }, system: true });
}

function createCorporateDocuments(crew: CrewMember[]): SeedFile[] {
  const alma = crew.find((member) => member.id === "passenger-001")!;
  const ivo = crew.find((member) => member.id === "passenger-014")!;
  const sana = crew.find((member) => member.id === "passenger-227")!;
  const mara = crew.find((member) => member.id === "passenger-344")!;
  const noor = crew.find((member) => member.id === "passenger-600")!;
  const staticDocuments: SeedFile[] = [
    corporateDocument({ path: "/logs/system/boot-sequence.ATA", extension: ".ATA", documentType: "SYSTEM_LOG", eventTime: "T+00:00:00", department: "SYSTEMS", accessTerminal: "BOOT-LOCAL", summary: "Log técnico da sequência de inicialização e da montagem do VFS.", clearance: "GUEST", lines: ["SYSTEM LOG // BOOT SEQUENCE", "T+00:00:00 MEMORY CHECK ................. PASS", "T+00:00:05 VFS /SHIP mounted READ_ONLY", "T+00:00:15 cryo scan ............... 600 records", "T+00:00:23 capsule 601 ............. OWNER NULL", "T+00:00:27 neural_buffer_corrupted", "T+00:00:30 fallback shell ........... GUEST"], links: [{ target: "/BOOT.ATA", label: "BOOT_ATA", relation: "registro paralelo" }, { target: "/cryo/capsule-601/neural-link.HLT", label: "CAPSULE_601", relation: "anomalia", signal: "red" }], keywords: ["system log", "boot", "memory", "capsule 601"] }),
    corporateDocument({ path: "/logs/system/permission-delta.ATA", extension: ".ATA", documentType: "SYSTEM_LOG", eventTime: "T-03:11:51", department: "SECURITY", accessTerminal: "SEC-04", summary: "Alterações de autoridade detectadas imediatamente antes do apagão.", clearance: "OFFICER", lines: ["SYSTEM LOG // PERMISSION DELTA", "ACTOR      : LOCAL PROCESS / UNSIGNED", "TARGET     : COMMAND / BRIDGE", "BEFORE     : OFFICER (A.VELEZ)", "AFTER      : GUEST (NULL)", "REASON     : emergency containment", "WARNING    : no matching ATA found"], links: [{ target: "/corporate/passenger-001/personnel.SCR", label: "A.VELEZ", relation: "autoridade removida", signal: "red" }, { target: "/ship/operations/incident-601.ATA", label: "INCIDENT_601", relation: "janela temporal" }], keywords: ["system log", "permissions", "authority", "bridge", "containment"] }),
    corporateDocument({ path: "/logs/system/oxygen-drift.ATA", extension: ".ATA", documentType: "SYSTEM_LOG", eventTime: "T-00:18:00", department: "LIFE SUPPORT", accessTerminal: "LIFE-02", summary: "Variação de suporte de vida que aparece antes de qualquer dano de casco registrado.", clearance: "CREW", lines: ["SYSTEM LOG // OXYGEN DRIFT", "RING_04     : −02% forecast", "BOTANY LOOP : PAUSED", "CAUSE       : manual service required", "PUBLIC UI   : displays 14% reserve only", "PRIVATE NOTE : N.BAPTISTE tool may restore cycle"], links: [{ target: "/botany/ring-04/cycle.ATA", label: "RING_04", relation: "serviço", signal: "amber" }, { target: "/corporate/passenger-600/personnel.SCR", label: "N.BAPTISTE", relation: "responsável" }], keywords: ["system log", "oxygen", "botany", "ring 04"] }),
    corporateDocument({ path: "/logs/access/passenger-344.SCR", extension: ".SCR", documentType: "ACCESS_LOG", eventTime: "T-03:12:08", authorId: mara.id, department: "SCIENCE / MED", accessTerminal: "LAB-NL-01", summary: "Log de acesso de M. Ilyin ao prontuário órfão da cápsula 601.", clearance: "OFFICER", lines: ["ACCESS LOG // M.ILYIN", `USER       : ${mara.name} / ${mara.id}`, "TERMINAL   : LAB-NL-01", "T-03:12:08 READ /cryo/capsule-601/neural-link.HLT", "RESULT     : GRANTED / PRIVATE CHANNEL", "T-03:12:10 WRITE /ship/operations/incident-601.ATA", "RESULT     : PARTIAL / SIGNATURE MISSING", "NOTE       : user location conflicts with bridge camera"], links: [{ target: "/corporate/passenger-344/personnel.SCR", label: "M.ILYIN", relation: "usuária" }, { target: "/cryo/capsule-601/neural-link.HLT", label: "NEURAL_LINK", relation: "alvo", signal: "red" }, { target: "/cryo/capsule-601/scan.VIS", label: "SCAN_601", relation: "câmera" }], keywords: ["access log", "M.ILYIN", "neural", "capsule 601", "conflict"] }),
    corporateDocument({ path: "/logs/access/passenger-014.SCR", extension: ".SCR", documentType: "ACCESS_LOG", eventTime: "T-03:10:41", authorId: ivo.id, department: "FLIGHT", accessTerminal: "NAV-02", summary: "Log de acesso de I. Chen ao loop térmico e ao seu canal pessoal.", clearance: "OFFICER", lines: ["ACCESS LOG // I.CHEN", `USER       : ${ivo.name} / ${ivo.id}`, "TERMINAL   : NAV-02", "T-03:10:41 READ /engineering/loop-02/thermal.VIS", "T-03:10:44 READ /personal/passenger-014/playlist.MUS", "T-03:10:48 READ /personal/passenger-014/saved-passwords.SCR", "RESULT     : ALL GRANTED", "NOTE       : password store opened 00:04 before ghost packet"], links: [{ target: "/corporate/passenger-014/personnel.SCR", label: "I.CHEN", relation: "usuário" }, { target: "/net/ghost-packet.REC", label: "GHOST_PACKET", relation: "evento seguinte", signal: "amber" }], keywords: ["access log", "I.CHEN", "loop 02", "password"] }),
    corporateDocument({ path: "/meetings/command-031.ATA", extension: ".ATA", documentType: "MEETING_MINUTES", eventTime: "T-06:44:00", authorId: alma.id, recipientIds: [ivo.id, mara.id, sana.id], department: "COMMAND", accessTerminal: "BRIDGE-TABLE", summary: "Ata da reunião de comando que registra a decisão de não acordar a cápsula 601.", clearance: "OFFICER", lines: ["MEETING MINUTES // COMMAND 031", "DATE       : T-06:44:00", "CHAIR      : A.VELEZ", "ATTENDEES  : I.CHEN / M.ILYIN / S.OKAFOR", "AGENDA     : anomalous cryo signal", "DECISION   : capsule 601 is not part of passenger manifest", "DISSENT    : M.ILYIN requested neural-link inspection", "ACTION     : quarantine private channel", "STATUS     : CLOSED / signature A.VELEZ"], links: [{ target: "/ship/operations/incident-601.ATA", label: "INCIDENT_601", relation: "decisão posterior", signal: "red" }, { target: "/corporate/passenger-344/personnel.SCR", label: "M.ILYIN", relation: "dissenso" }, { target: "/meetings/medical-062.ATA", label: "MEDICAL_062", relation: "ata posterior" }], keywords: ["meeting", "minutes", "command", "capsule 601", "dissent"] }),
    corporateDocument({ path: "/meetings/medical-062.ATA", extension: ".ATA", documentType: "MEETING_MINUTES", eventTime: "T-03:18:00", authorId: sana.id, recipientIds: [alma.id, mara.id], department: "SCIENCE / MED", accessTerminal: "MED-CONFERENCE", supersedes: "/meetings/command-031.ATA", contradiction: "A ata diz que a cápsula 601 não foi aberta, mas o log de acesso de M. Ilyin registra leitura do prontuário.", summary: "Ata médica que tenta formalizar o encerramento do evento 601.", clearance: "OFFICER", lines: ["MEETING MINUTES // MEDICAL 062", "CHAIR      : S.OKAFOR", "ATTENDEES  : A.VELEZ / M.ILYIN", "SUBJECT    : unregistered cryo signal", "DECISION   : no patient exists in capsule 601", "ACTION     : purge orphan record after 00:20", "DISSENT    : record contains live vitals", "SIGNATURE  : S.OKAFOR / PENDING", "STATUS     : UNSIGNED COPY"], links: [{ target: "/logs/access/passenger-344.SCR", label: "ACCESS_344", relation: "contradição", signal: "red" }, { target: "/cryo/capsule-601/neural-link.HLT", label: "NEURAL_LINK", relation: "vitals" }], keywords: ["meeting", "medical", "purge", "orphan", "contradiction"] }),
    corporateDocument({ path: "/discipline/warning-344.SCR", extension: ".SCR", documentType: "DISCIPLINARY_WARNING", eventTime: "T-03:09:00", authorId: alma.id, recipientIds: [mara.id], department: "COMMAND", accessTerminal: "HR-LOCAL", contradiction: "A advertência acusa acesso indevido antes do log oficial registrar o acesso.", summary: "Advertência disciplinar contra M. Ilyin por investigar o buffer neural.", clearance: "OFFICER", lines: ["DISCIPLINARY WARNING // 344", "ISSUER     : A.VELEZ / COMMAND", "RECIPIENT  : M.ILYIN / SCIENCE", "VIOLATION  : unauthorized neural-buffer access", "EVIDENCE   : private channel request", "ORDER      : stop all work on capsule 601", "RESPONSE   : refused / copy not signed", "CLASS      : INTERNAL / RETAIN 30 DAYS"], links: [{ target: "/corporate/passenger-344/personnel.SCR", label: "M.ILYIN", relation: "destinatária" }, { target: "/logs/access/passenger-344.SCR", label: "ACCESS_344", relation: "evidência posterior", signal: "red" }, { target: "/personal/passenger-344/diary.SCR", label: "DIARY", relation: "resposta pessoal" }], keywords: ["warning", "disciplinary", "M.ILYIN", "neural", "command"] }),
    corporateDocument({ path: "/memos/memo-601.SCR", extension: ".SCR", documentType: "MEMO", eventTime: "T-03:12:01", authorId: alma.id, recipientIds: [ivo.id, sana.id, mara.id], department: "COMMAND", accessTerminal: "BRIDGE-LOCAL", supersedes: "/meetings/command-031.ATA", contradiction: "Memorando autoriza uma exceção para a cápsula 601 minutos depois de a ata dizer que ela não existe.", summary: "Memorando secreto enviado ao núcleo de comando durante o apagão.", clearance: "OFFICER", lines: ["SEED CORP MEMORANDUM // M-601", "FROM       : A.VELEZ", "TO         : I.CHEN / S.OKAFOR / M.ILYIN", "SUBJECT    : capsule 601 exception", "CLASS      : COMMAND EYES ONLY", "INSTRUCTION: do not wake the passenger", "INSTRUCTION: do not copy the identity hash", "AUTHORITY  : manual override / A.VELEZ", "DELIVERY   : private channel / no receipt"], links: [{ target: "/meetings/command-031.ATA", label: "COMMAND_031", relation: "substitui" }, { target: "/cryo/capsule-601/neural-link.HLT", label: "NEURAL_LINK", relation: "alvo", signal: "red" }, { target: "/net/ghost-packet.REC", label: "GHOST_PACKET", relation: "interceptação" }], keywords: ["memo", "601", "command", "eyes only", "override"] }),
    corporateDocument({ path: "/memos/memo-life-support.SCR", extension: ".SCR", documentType: "MEMO", eventTime: "T-00:22:00", authorId: noor.id, recipientIds: [alma.id], department: "BOTANY", accessTerminal: "BOTANY-04", summary: "Memorando de N. Baptiste sobre o corte deliberado no ciclo de oxigênio.", clearance: "CREW", lines: ["SEED CORP MEMORANDUM // LIFE SUPPORT", "FROM       : N.BAPTISTE / BOTANY", "TO         : A.VELEZ / COMMAND", "SUBJECT    : ring 04 oxygen forecast", "FINDING    : cycle paused by local command", "REQUEST    : authorize personal calibrator", "ATTACHMENT : /personal/passenger-600/seed-tool.PROC", "WARNING    : public telemetry will under-report drift"], links: [{ target: "/botany/ring-04/cycle.ATA", label: "RING_04", relation: "anexo" }, { target: "/personal/passenger-600/saved-passwords.SCR", label: "BOTANY", relation: "credencial" }], keywords: ["memo", "life support", "oxygen", "botany", "ring 04"] }),
  ];
  const accessLogs = crew.filter((member) => member.capsule % 20 === 0 || ["passenger-001", "passenger-227", "passenger-600"].includes(member.id)).map((member) => corporateDocument({ path: `/logs/access/${member.id}.SCR`, extension: ".SCR", documentType: "ACCESS_LOG", eventTime: `T-${String((member.capsule * 7) % 48).padStart(2, "0")}:${String((member.capsule * 11) % 60).padStart(2, "0")}:00`, authorId: member.id, department: member.department, accessTerminal: `TERM-${String((member.capsule % 17) + 1).padStart(2, "0")}`, summary: `Log de acesso de ${member.name} no terminal ${member.department}.`, clearance: member.clearance, lines: ["ACCESS LOG // PASSENGER TRACE", `USER       : ${member.name} / ${member.id}`, `NATIONALITY: ${member.nationality}`, `LANGUAGE   : ${member.language}`, `TERMINAL   : TERM-${String((member.capsule % 17) + 1).padStart(2, "0")}`, `ACTION     : READ /corporate/${member.id}/personnel.SCR`, "RESULT     : GRANTED", `ACTION     : READ /personal/${member.id}/diary.SCR`, "RESULT     : GRANTED / NATIVE LANGUAGE", member.capsule % 40 === 0 ? "NOTE       : user opened file outside assigned department" : "NOTE       : routine manifest review"], links: [{ target: `/corporate/${member.id}/personnel.SCR`, label: "PERSONNEL", relation: "registro aberto" }, { target: `/personal/${member.id}/diary.SCR`, label: "DIARY", relation: "arquivo pessoal" }], keywords: ["access log", member.id, member.name, member.department, member.language, "terminal"] }));
  return [...staticDocuments, ...accessLogs];
}

export function createSeedIndex(): SeedIndex {
  const families = createFamilies();
  const crew = createCrew(families);
  const familyMap = new Map(families.map((family) => [family.id, family]));
  const files = [...createSystemFiles(), ...createCorporateDocuments(crew), ...createKnowledgeFiles(crew), ...families.map((family) => familyFiles(family, crew)), ...crew.flatMap((member) => personalFiles(member, familyMap.get(member.familyId)!))];
  const fileMap = new Map(files.map((file) => [file.path.toLowerCase(), file]));
  const directories = new Set<string>(["/"]);
  files.forEach((file) => { let current = file.directory; while (current && current !== "/") { directories.add(current); current = current.slice(0, current.lastIndexOf("/")) || "/"; } });
  const counts = files.reduce<Record<FileExtension, number>>((result, file) => { result[file.extension] += 1; return result; }, { ".SCR": 0, ".REC": 0, ".MUS": 0, ".VIS": 0, ".HLT": 0, ".ATA": 0, ".PROC": 0, ".BOOK": 0, ".MSG": 0 });
  const index = { files, fileMap, crew, families, familyMap, directories: Array.from(directories).sort(), counts };
  const continuityIssues = validateSeedContinuity(index);
  if (continuityIssues.length) console.warn("SEED CONTINUITY CHECK", continuityIssues);
  return index;
}

export function validateSeedContinuity(input: Pick<SeedIndex, "files" | "crew" | "families">): string[] {
  const issues: string[] = [];
  const crewIds = new Set(input.crew.map((member) => member.id));
  const operationalRecipients = new Set(["ALL_SLEEPERS", "MEDICAL", "COMMAND"]);
  const familyIds = new Set(input.families.map((family) => family.id));
  const paths = new Set(input.files.map((file) => file.path.toLowerCase()));
  const languages = new Set< string | FileLanguage >(["pt-BR", "es-MX", "en-US", "fr-FR", "de-DE", "ja-JP", "zh-CN", "ar-EG", "SEED-OPS"]);
  if (input.crew.length !== 600) issues.push(`manifest: expected 600 passengers, found ${input.crew.length}`);
  if (input.families.length !== 150) issues.push(`families: expected 150 records, found ${input.families.length}`);
  if (new Set(input.crew.map((member) => member.id)).size !== input.crew.length) issues.push("manifest: duplicate passenger id");
  if (new Set(input.crew.map((member) => member.capsule)).size !== input.crew.length) issues.push("manifest: duplicate capsule number");
  if (new Set(input.files.map((file) => file.path.toLowerCase())).size !== input.files.length) issues.push("vfs: duplicate file path");
  input.crew.forEach((member) => {
    if (!familyIds.has(member.familyId)) issues.push(`${member.id}: family reference missing (${member.familyId})`);
    if (!languages.has(member.language)) issues.push(`${member.id}: unsupported language (${member.language})`);
  });
  input.families.forEach((family) => {
    if (!languages.has(family.language)) issues.push(`${family.id}: unsupported family language (${family.language})`);
    family.members.forEach((memberId) => { if (!crewIds.has(memberId)) issues.push(`${family.id}: member reference missing (${memberId})`); });
  });
  input.files.forEach((file) => {
    if (!languages.has(file.language)) issues.push(`${file.path}: unsupported file language (${file.language})`);
    if (file.ownerId && !crewIds.has(file.ownerId)) issues.push(`${file.path}: owner reference missing (${file.ownerId})`);
    if (file.familyId && !familyIds.has(file.familyId)) issues.push(`${file.path}: family reference missing (${file.familyId})`);
    if (file.authorId && !crewIds.has(file.authorId)) issues.push(`${file.path}: author reference missing (${file.authorId})`);
    (file.recipientIds ?? []).forEach((recipientId) => { if (!crewIds.has(recipientId) && !operationalRecipients.has(recipientId)) issues.push(`${file.path}: recipient reference missing (${recipientId})`); });
    if (file.supersedes && !paths.has(file.supersedes.toLowerCase())) issues.push(`${file.path}: superseded file missing (${file.supersedes})`);
    file.links.forEach((link) => { if (!paths.has(link.target.toLowerCase())) issues.push(`${file.path}: link target missing (${link.target})`); });
    if (file.extension === ".MUS" && (file.payload.kind !== "audio" || file.payload.audioType !== "MUSIC")) issues.push(`${file.path}: MUS payload is not marked MUSIC`);
    if (file.payload.kind === "audio" && file.payload.audioType === "MUSIC" && file.extension !== ".MUS") issues.push(`${file.path}: MUSIC payload uses ${file.extension}, expected .MUS`);
    if (file.payload.kind === "credential" && !paths.has(file.payload.target.toLowerCase())) issues.push(`${file.path}: credential target missing (${file.payload.target})`);
    if (file.eventTime && !/^(T[+-]\d{2}:\d{2}:\d{2}|LIVE|CORRUPTED)$/.test(file.eventTime)) issues.push(`${file.path}: invalid event time (${file.eventTime})`);
  });
  return issues;
}

export function normalizePath(input: string, cwd = "/") {
  const source = input.startsWith("/") ? input : `${cwd}/${input}`;
  const parts = source.split("/").filter(Boolean);
  const output: string[] = [];
  parts.forEach((part) => { if (part === "..") output.pop(); else if (part !== ".") output.push(part); });
  return `/${output.join("/")}` || "/";
}

export function resolveFile(index: SeedIndex, rawPath: string, cwd = "/") {
  const query = rawPath.trim().replace(/^['"]|['"]$/g, "");
  if (!query) return undefined;
  const exact = index.fileMap.get(normalizePath(query, cwd).toLowerCase()) ?? index.fileMap.get(query.toLowerCase());
  if (exact) return exact;
  const basename = query.split("/").pop()?.toLowerCase();
  return index.files.find((file) => file.directory.toLowerCase() === normalizePath(cwd).toLowerCase() && file.name.toLowerCase() === basename);
}

export function listDirectory(index: SeedIndex, cwd = "/") {
  const directory = normalizePath(cwd);
  const entries = new Map<string, { type: "dir" | "file"; name: string; file?: SeedFile }>();
  index.directories.forEach((path) => { if (path !== directory && path.startsWith(`${directory === "/" ? "" : directory}/`)) { const rest = path.slice(directory === "/" ? 1 : directory.length + 1); if (!rest.includes("/")) entries.set(rest, { type: "dir", name: rest }); } });
  index.files.forEach((file) => { if (file.directory === directory) entries.set(file.name, { type: "file", name: file.name, file }); });
  return Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name));
}
