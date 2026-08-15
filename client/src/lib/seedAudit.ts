import type { SeedFile, SeedIndex } from "./seedData";

export type SeedSearchFilters = {
  type?: string;
  person?: string;
  family?: string;
  nationality?: string;
  terminal?: string;
  department?: string;
  time?: string;
  keyword?: string;
  contradiction?: string;
  path?: string;
};

const searchable = (file: SeedFile) => [
  file.path,
  file.summary,
  file.language,
  file.layer,
  file.documentType ?? "",
  file.eventTime ?? "",
  file.authorId ?? "",
  ...(file.recipientIds ?? []),
  file.department ?? "",
  file.accessTerminal ?? "",
  file.contradiction ?? "",
  ...file.keywords,
].join(" ").toLowerCase();

export function parseSeedSearch(query: string): SeedSearchFilters {
  const filters: SeedSearchFilters = {};
  const free: string[] = [];
  for (const token of query.trim().split(/\s+/).filter(Boolean)) {
    const match = token.match(/^(type|person|family|nationality|terminal|department|time|keyword|contradiction|path)=(.+)$/i);
    if (match) filters[match[1].toLowerCase() as keyof SeedSearchFilters] = match[2].toLowerCase();
    else free.push(token.toLowerCase());
  }
  if (free.length) filters.keyword = [filters.keyword, ...free].filter(Boolean).join(" ");
  return filters;
}

export function searchSeedFiles(index: SeedIndex, query: string): SeedFile[] {
  const filters = parseSeedSearch(query);
  return index.files.filter((file) => {
    const fields = {
      type: [file.extension, file.kind, file.documentType ?? ""].join(" ").toLowerCase(),
      path: file.path.toLowerCase(),
      person: [file.ownerId, file.authorId, ...(file.recipientIds ?? [])].join(" ").toLowerCase(),
      family: (file.familyId ?? "").toLowerCase(),
      nationality: searchable(file),
      terminal: (file.accessTerminal ?? "").toLowerCase(),
      department: (file.department ?? "").toLowerCase(),
      time: [file.eventTime ?? "", file.updated].join(" ").toLowerCase(),
      keyword: searchable(file),
      contradiction: (file.contradiction ?? "").toLowerCase(),
    };
    return Object.entries(filters).every(([key, value]) => fields[key as keyof typeof fields].includes(value as string));
  }).slice(0, 24);
}

export function documentSchemaIssues(index: SeedIndex): string[] {
  const required = ["documentType", "eventTime", "links"] as const;
  return index.files.filter((file) => file.layer === "CORPORATE" && Boolean(file.documentType)).flatMap((file) => required.filter((field) => {
    const value = file[field];
    return field === "links" ? !Array.isArray(value) : typeof value !== "string" || value.length === 0;
  }).map((field) => `${file.path}:${field}`));
}

export function personalInventory(index: SeedIndex, ownerId: string) {
  const files = index.files.filter((file) => file.ownerId === ownerId);
  return {
    files,
    extensions: new Set(files.map((file) => file.extension)),
    hasVisual: files.some((file) => file.extension === ".VIS"),
    hasProgram: files.some((file) => file.extension === ".PROC"),
    hasAudio: files.some((file) => file.extension === ".MUS" || file.extension === ".REC"),
    hasText: files.some((file) => file.extension === ".SCR" || file.extension === ".BOOK"),
    hasCredential: files.some((file) => file.kind === "credential"),
  };
}

export function searchFieldCoverage(index: SeedIndex): Record<string, number> {
  return {
    type: index.files.filter((file) => Boolean(file.extension || file.documentType)).length,
    person: index.files.filter((file) => Boolean(file.ownerId || file.authorId || file.recipientIds?.length)).length,
    terminal: index.files.filter((file) => Boolean(file.accessTerminal)).length,
    department: index.files.filter((file) => Boolean(file.department)).length,
    time: index.files.filter((file) => Boolean(file.eventTime || file.updated)).length,
    keyword: index.files.filter((file) => file.keywords.length > 0).length,
    contradiction: index.files.filter((file) => Boolean(file.contradiction)).length,
  };
}

export function isLegacyHelp(lines: Array<{ text: string }>): boolean {
  const text = lines.map((line) => line.text).join(" ").toLowerCase();
  return lines.length <= 12 && text.includes("commands // hybrid shell") && text.includes("legacy index") && text.includes("syntax registry :: incomplete") && text.includes("legacy aliases") && !text.includes("tutorial") && !text.includes("mission") && !text.includes("objective");
}

const contradictionCauses = /(version|vers[aã]o|permission|permiss[aã]o|access|acesso|delet|apag|interest|interesse|override|exception|exce[cç][aã]o|refused|recus|warning|advert)/i;
const consequenceSignals = /(event|evento|access|acesso|repair|repar|recover|recuper|corrupt|corrup|firmware|service|servi[cç]o|override|autoriza|blocked|bloque)/i;

export function continuityIssues(index: SeedIndex): string[] {
  const paths = new Set(index.files.map((file) => file.path.toLowerCase()));
  return index.files.flatMap((file) => {
    const text = [file.contradiction, file.summary, ...file.keywords, ...(file.payload.kind === "text" ? file.payload.lines : [])].filter(Boolean).join(" ");
    return [
      ...file.links.filter((link) => !paths.has(link.target.toLowerCase())).map((link) => `${file.path}:missing-link:${link.target}`),
      ...(file.contradiction && (!contradictionCauses.test(file.contradiction) || file.links.length < 1) ? [`${file.path}:contradiction-cause-unverifiable`] : []),
      ...(file.contradiction && !consequenceSignals.test(text) ? [`${file.path}:contradiction-consequence-unverifiable`] : []),
    ];
  });
}

export function sensitiveRecordIssues(index: SeedIndex): string[] {
  const crewById = new Map(index.crew.map((member) => [member.id, member]));
  return index.files.filter((file) => {
    const sensitive = file.extension === ".PROC" || file.extension === ".HLT" || file.extension === ".ATA" || file.kind === "credential" || Boolean(file.corruption?.length) || file.keywords.some((keyword) => /firmware|flag/i.test(keyword));
    if (!sensitive || file.layer === "SYSTEM" || file.path.startsWith("/logs/system/")) return false;
    const pathPerson = file.path.match(/passenger-\d+/)?.[0];
    const person = file.ownerId || file.authorId || file.recipientIds?.[0] || pathPerson;
    const member = person ? crewById.get(person) : undefined;
    const hasPerson = Boolean(person && member);
    const hasDepartment = Boolean(file.department || member?.department);
    const hasEvent = Boolean(file.eventTime || file.updated);
    const payloadText = [file.summary, ...file.keywords, ...(file.payload.kind === "program" ? file.payload.code : []), ...(file.payload.kind === "health" ? file.payload.vitals.map((vital) => `${vital.label} ${vital.status}`) : [])].join(" ");
    const hasConsequence = file.links.length > 0 || Boolean(file.corruption?.length) || Boolean(file.payload.kind === "program" && file.payload.action?.effects) || Boolean(file.payload.kind === "health" && file.payload.vitals.some((vital) => vital.status !== "stable")) || consequenceSignals.test(payloadText);
    return !(hasPerson && hasDepartment && hasEvent && hasConsequence);
  }).map((file) => `${file.path}:event-person-department-consequence-incomplete`);
}

export function culturalCoverage(index: SeedIndex) {
  const languages = new Set(index.crew.map((member) => member.language));
  const families = index.families.filter((family) => family.members.length > 0 && languages.has(family.language));
  const languageVoices = Array.from(languages).filter((language) => index.files.some((file) => file.layer === "PERSONAL" && file.language === language && file.kind === "text" && file.payload.kind === "text" && file.payload.lines.some((line) => line.trim().length > 20)));
  const familyVoices = families.filter((family) => index.files.some((file) => file.familyId === family.id && file.layer === "PERSONAL" && file.language === family.language && file.payload.kind === "text" && file.payload.lines.some((line) => line.length > 20))).length;
  const personalNative = index.files.filter((file) => file.layer === "PERSONAL" && file.language !== "SEED-OPS").length;
  return { languageCount: languages.size, familyCount: families.length, personalNativeFiles: personalNative, languageVoices, familyVoices };
}

export function credentialContextIssues(index: SeedIndex): string[] {
  const crewIds = new Set(index.crew.map((member) => member.id));
  return index.files.filter((file) => {
    if (file.kind !== "credential" || file.payload.kind !== "credential") return false;
    const pathOwner = file.path.match(/passenger-\d+/)?.[0];
    const owner = file.ownerId || pathOwner;
    return !owner || !crewIds.has(owner) || !file.payload.target || file.links.length === 0;
  }).map((file) => `${file.path}:credential-context-incomplete`);
}
