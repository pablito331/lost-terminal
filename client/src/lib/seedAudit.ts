import type { SeedFile, SeedIndex } from "./seedData";

export type SeedSearchFilters = {
  type?: string;
  person?: string;
  terminal?: string;
  department?: string;
  time?: string;
  keyword?: string;
  contradiction?: string;
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
    const match = token.match(/^(type|person|terminal|department|time|keyword|contradiction)=(.+)$/i);
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
      person: [file.ownerId, file.authorId, ...(file.recipientIds ?? [])].join(" ").toLowerCase(),
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
  return text.includes("commands // hybrid shell") && text.includes("legacy aliases") && !text.includes("tutorial") && !text.includes("mission");
}
