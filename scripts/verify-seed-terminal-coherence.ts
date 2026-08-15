import { createSeedIndex } from "../client/src/lib/seedData";
import { terminalCoherenceIssues } from "../client/src/lib/seedAudit";
import { initialRuntime, runCommand } from "../client/src/pages/Home";

const index = createSeedIndex();
const cwd = "/";
const commands = [
  "PWD",
  "LS /",
  "FIND person=passenger-014",
  "SEED",
  "STATUS",
  "POWER",
  "LIFE",
  "SYSLOG",
  "NOTICES",
  "BIOS",
  "BOOT",
  "REBOOT",
  "OPEN /personal/passenger-014/diary.scr",
  "CAT /personal/passenger-014/diary.scr",
  "RUN /apps/player.PROC",
  "MIGRATE /apps/missing.PROC 0.9.2",
  "ROLLBACK /apps/missing.PROC",
  "EXPLOIT CACHE",
];
const errors: string[] = [];
const unexpectedError = /unknown command|no such directory|file not found|path not found|unexpected exception/i;

for (const command of commands) {
  const result = runCommand(command, cwd, index, initialRuntime);
  if (result.lines.some((line) => unexpectedError.test(line.text))) errors.push(`${command}:unexpected-error`);
}

const assertOutput = (command: string, markers: string[]) => {
  const result = runCommand(command, cwd, index, initialRuntime);
  const text = result.lines.map((line) => line.text).join("\n");
  for (const marker of markers) {
    if (!text.includes(marker)) errors.push(`${command}:missing-marker:${marker}`);
  }
};

for (const command of ["OPEN /personal/passenger-014/diary.scr", "CAT /personal/passenger-014/diary.scr"]) {
  assertOutput(command, ["LAYER    ::", "LANGUAGE ::", "IDENTITY :: NATIONALITY", "FAMILY family-"]);
}
assertOutput("RUN /apps/player.PROC", ["executing /apps/player.PROC", "SEED AUDIO PLAYER"]);
assertOutput("MIGRATE /apps/missing.PROC 0.9.2", ["user application not registered"]);
assertOutput("ROLLBACK /apps/missing.PROC", ["user application not registered"]);
assertOutput("EXPLOIT CACHE", ["debug console + ghost bus + BIOS window required"]);

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
console.log(`OPEN_CAT_INDICATORS=PASS`);
console.log(`PROC_VERSION_GATES=PASS`);
console.log(`EXPLOIT_GATE=PASS`);
console.log(`RUNTIME_REFERENCES=PASS`);
