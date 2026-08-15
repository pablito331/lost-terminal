import { createSeedIndex } from "../client/src/lib/seedData";
import { terminalCoherenceIssues } from "../client/src/lib/seedAudit";
import { initialRuntime, runCommand } from "../client/src/pages/Home";

const index = createSeedIndex();
const cwd = "/";
const commands = ["PWD", "LS /", "FIND person=passenger-014", "SEED", "STATUS", "POWER", "LIFE", "SYSLOG", "NOTICES", "BIOS", "BOOT", "REBOOT", "OPEN /personal/passenger-014/diary.scr"];
const errors: string[] = [];

for (const command of commands) {
  const result = runCommand(command, cwd, index, initialRuntime);
  if (result.lines.some((line) => /file not found|no such directory|unknown command|invalid path/i.test(line.text))) errors.push(`${command}:unexpected-error`);
}

const open = runCommand("OPEN /personal/passenger-014/diary.scr", cwd, index, initialRuntime);
const openText = open.lines.map((line) => line.text).join("\n");
for (const marker of ["LAYER    ::", "LANGUAGE ::", "IDENTITY :: NATIONALITY", "FAMILY family-"]) {
  if (!openText.includes(marker)) errors.push(`OPEN:missing-marker:${marker}`);
}

const runtimeIssues = terminalCoherenceIssues(index, {
  openFiles: [],
  recoveredPaths: [],
  authenticatedUsers: [],
  installedApps: [],
  processes: [],
  audio: { status: initialRuntime.audio.status },
  boot: initialRuntime.boot,
  firmware: initialRuntime.firmware,
  mountedVolumes: initialRuntime.mountedVolumes,
});
errors.push(...runtimeIssues);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`SEED_TERMINAL_COHERENCE=PASS`);
console.log(`COMMANDS=${commands.length}`);
console.log(`OPEN_INDICATORS=PASS`);
console.log(`RUNTIME_REFERENCES=PASS`);
