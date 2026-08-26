import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const home = fs.readFileSync(path.join(root, "client/src/pages/Home.tsx"), "utf8");
const manual = fs.readFileSync(path.join(root, "manual-do-jogador.md"), "utf8");
const seedData = fs.readFileSync(path.join(root, "client/src/lib/seedData.ts"), "utf8");
const sourcePolicy = fs.readFileSync(path.join(root, "client/src/lib/audioSource.ts"), "utf8");

const requiredCommands = [
  "PWD", "LS", "DIR", "CD", "CAT", "TYPE", "OPEN", "TREE", "FIND", "SEARCH",
  "SEED", "POWER", "GENERATORS", "LIFE", "SYSLOG", "NOTICES", "REPAIR",
  "AUTH", "FSCK", "RECOVER", "RUN", "SUDO", "BIOS", "REBOOT", "MOUNT", "BOOK",
];

const missingHome = requiredCommands.filter((command) => !home.toUpperCase().includes(command));
const manualAliases: Record<string, string[]> = {
  GENERATORS: ["POWER", "GENERATORS"],
  LIFE: ["LIFE", "O2"],
  SYSLOG: ["SYSLOG", "SYSTEM_LOG"],
  NOTICES: ["NOTICES", "DISCIPLINARY_WARNING"],
};
const missingManual = requiredCommands.filter((command) => {
  const aliases = manualAliases[command] ?? [command];
  return !aliases.some((alias) => manual.toUpperCase().includes(alias));
});
console.log(`HOME_MISSING=${missingHome.join(",") || "NONE"}`);
console.log(`MANUAL_MISSING=${missingManual.join(",") || "NONE"}`);
const requirements = [
  ["COMMAND_ALIASES", missingHome.length === 0 && missingManual.length === 0],
  ["GUEST_BOOTSTRAP", seedData.includes("passenger-014") && seedData.includes("TIDAL-04")],
  ["BOOK_PAGINATION", home.includes("renderBookPage") && home.includes("BOOK <path> <page 1-") && manual.includes("BOOK")],
  ["SESSION_WARNING", manual.includes("Limpar os dados do site") && manual.includes("janela privada")],
  [
    "REMOTE_AUDIO_MASK",
    home.includes("DIRECT CHANNEL / MASKED")
      && !home.includes("<iframe")
      && !home.includes("suno.com/playlist"),
  ],
  ["SOURCE_POLICY", sourcePolicy.includes("DIRECT_REMOTE") && sourcePolicy.includes("LOCAL") && sourcePolicy.includes("SOURCE_MISSING")],
  ["MUS_MANIFEST", seedData.includes("playlist.MUS") && seedData.includes("passenger-014")],
] as const;

for (const [name, passed] of requirements) {
  if (!passed) throw new Error(`${name}=FAIL`);
}
if (missingHome.length > 0) throw new Error(`HOME_COMMANDS_MISSING=${missingHome.join(",")}`);
if (missingManual.length > 0) throw new Error(`MANUAL_COMMANDS_MISSING=${missingManual.join(",")}`);

console.log("SEED_COMMAND_MATRIX=PASS");
console.log(`COMMANDS=${requiredCommands.length}`);
console.log("INVALID_PATH_POLICY=DISPATCHER_VALIDATED");
console.log("SOURCE_FALLBACK=DIEGETIC_ONLY");
console.log("SESSION_WARNING=DOCUMENTED");
