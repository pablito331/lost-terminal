/**
 * Seed OS content audit: validates the authored knowledge layer and the bounded
 * Seed Script runtime without opening a browser or mutating a player session.
 */
import { createSeedIndex, resolveFile, validateSeedContinuity } from "../client/src/lib/seedData";
import { compileSeedScript, runSeedScript } from "../client/src/lib/seedScript";

const index = createSeedIndex();
const bootstrapCredential = resolveFile(index, "/personal/passenger-014/saved-passwords.SCR");
const knowledge = index.files.filter((file) => file.extension === ".BOOK");
const messages = index.files.filter((file) => file.extension === ".MSG");
const videos = index.files.filter((file) => file.extension === ".VIS" && file.directory === "/media/public");
const languages = new Set(knowledge.map((file) => file.language));
const brokenContinuity = validateSeedContinuity(index);
const paginatedBooks = knowledge.filter((file) => file.payload.kind === "book" && (file.payload.pages?.length ?? 0) >= 6);
const editorialProfiles = knowledge.map((file) => {
  if (file.payload.kind !== "book") return { path: file.path, language: file.language, chapters: 0, pages: 0, characters: 0 };
  return {
    path: file.path,
    language: file.language,
    chapters: file.payload.chapters.filter((entry) => entry.includes("//")).length,
    pages: file.payload.pages?.length ?? 0,
    characters: file.payload.chapters.filter((entry) => !entry.includes("//")).join(" ").length,
  };
});
const hasEditorialMinimum = ({ language, chapters, pages, characters }: typeof editorialProfiles[number]) => chapters >= 9 && pages >= 12 && characters >= (language === "zh-CN" || language === "ja-JP" ? 3500 : 6000);
const completeBooks = editorialProfiles.filter(hasEditorialMinimum);
const ivoJournal = index.files.filter((file) => file.path.startsWith("/personal/passenger-014/journal/day-") && file.extension === ".SCR");

const repairExample = [
  'let network = seed("network")',
  'print("NETWORK = " + network)',
  'if network == "STABLE":',
  '  repair("SCRUBBER-B")',
];
const compiled = compileSeedScript(repairExample);
const executed = runSeedScript(repairExample, {
  read: (key) => key === "network" ? "STABLE" : key === "oxygen" ? 14 : "UNKNOWN",
  repair: (target) => ({ ok: true, target, output: [`REPAIR REQUEST :: ${target}`], effects: { service: target } }),
});

const requiredLanguages = ["pt-BR", "en-US", "es-MX", "fr-FR", "de-DE", "ja-JP", "zh-CN", "ar-EG"];
const missingLanguages = requiredLanguages.filter((language) => !languages.has(language as typeof knowledge[number]["language"]));
const unresolvedReferences = [...knowledge, ...messages, ...videos].flatMap((file) => file.links.map((link) => ({ source: file.path, target: link.target }))).filter(({ target }) => !resolveFile(index, target));

const failures = [
  !bootstrapCredential ? "BOOTSTRAP_CREDENTIAL=MISSING" : "",
  bootstrapCredential?.clearance !== "GUEST" ? `BOOTSTRAP_CLEARANCE=${bootstrapCredential?.clearance ?? "MISSING"}` : "",
  bootstrapCredential?.payload.kind !== "credential" || bootstrapCredential.payload.username !== "I.CHEN" || bootstrapCredential.payload.secret !== "TIDAL-04" ? "BOOTSTRAP_AUTH=INVALID" : "",
  knowledge.length < 10 ? `BOOK_COUNT=${knowledge.length}` : "",
  paginatedBooks.length !== knowledge.length ? `PAGINATED_BOOKS=${paginatedBooks.length}/${knowledge.length}` : "",
  completeBooks.length !== knowledge.length ? `EDITORIAL_MINIMUMS=${completeBooks.length}/${knowledge.length} :: ${editorialProfiles.filter((profile) => !hasEditorialMinimum(profile)).map(({ path, chapters, pages, characters }) => `${path}[chapters=${chapters},pages=${pages},characters=${characters}]`).join(" | ")}` : "",
  ivoJournal.length < 12 ? `IVO_JOURNAL_ENTRIES=${ivoJournal.length}` : "",
  messages.length < 5 ? `MSG_COUNT=${messages.length}` : "",
  videos.length < 2 ? `PUBLIC_VIS_COUNT=${videos.length}` : "",
  missingLanguages.length ? `MISSING_LANGUAGES=${missingLanguages.join(",")}` : "",
  brokenContinuity.length ? `CONTINUITY=${brokenContinuity.join(" | ")}` : "",
  unresolvedReferences.length ? `UNRESOLVED_REFERENCES=${unresolvedReferences.map(({ source, target }) => `${source}->${target}`).join(" | ")}` : "",
  !compiled.ok ? `COMPILE=${compiled.errors.join(" | ")}` : "",
  !executed.ok || !executed.repairs.includes("SCRUBBER-B") ? `RUN=${executed.errors.join(" | ") || "repair not executed"}` : "",
].filter(Boolean);

console.log(`BOOKS=${knowledge.length}`);
console.log(`PAGINATED_BOOKS=${paginatedBooks.length}`);
console.log(`BOOK_EDITORIAL_MINIMUMS=${completeBooks.length}/${knowledge.length}`);
console.log(`IVO_JOURNAL_ENTRIES=${ivoJournal.length}`);
console.log(`BOOTSTRAP_CREDENTIAL=${bootstrapCredential?.path ?? "MISSING"}`);
console.log(`BOOTSTRAP_CLEARANCE=${bootstrapCredential?.clearance ?? "MISSING"}`);
console.log(`MESSAGES=${messages.length}`);
console.log(`PUBLIC_VIS=${videos.length}`);
console.log(`LANGUAGES=${Array.from(languages).sort().join(",")}`);
console.log(`SEED_SCRIPT_COMPILE=${compiled.ok ? "PASS" : "FAIL"}`);
console.log(`SEED_SCRIPT_REPAIR=${executed.repairs.join(",") || "NONE"}`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("SEED_ECOSYSTEM_AUDIT=PASS");
}
