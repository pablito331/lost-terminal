import { describe, expect, it } from "vitest";
import { createSeedIndex } from "./seedData";
import { continuityIssues, credentialContextIssues, culturalCoverage, documentSchemaIssues, isLegacyHelp, personalInventory, searchFieldCoverage, searchSeedFiles, sensitiveRecordIssues, terminalCoherenceIssues, terminalIdentityLine } from "./seedAudit";

describe("Seed OS audit helpers", () => {
  const index = createSeedIndex();

  it("supports contextual field filters without changing the VFS", () => {
    const results = searchSeedFiles(index, "person=passenger-014 type=.SCR");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((file) => (file.ownerId === "passenger-014" || file.authorId === "passenger-014" || file.recipientIds?.includes("passenger-014")) && file.extension === ".SCR")).toBe(true);
  });

  it("searches family, language, nationality and corporate path fields", () => {
    expect(searchSeedFiles(index, "family=family-001").some((file) => file.familyId === "family-001")).toBe(true);
    expect(searchSeedFiles(index, "keyword=fr-FR").some((file) => file.language === "fr-FR" || file.keywords.includes("fr-FR"))).toBe(true);
    expect(searchSeedFiles(index, "keyword=BR").some((file) => file.keywords.includes("BR") || file.summary.includes("BR"))).toBe(true);
    expect(searchSeedFiles(index, "path=/corporate/passenger-014").every((file) => file.path.includes("/corporate/passenger-014"))).toBe(true);
    expect(searchSeedFiles(index, "path=/corporate type=.HLT").every((file) => file.path.startsWith("/corporate/") && file.extension === ".HLT")).toBe(true);
  });

  it("covers the documented corporate metadata contract", () => {
    expect(documentSchemaIssues(index)).toEqual([]);
  });

  it("reports a meaningful personal inventory for the central passenger", () => {
    const inventory = personalInventory(index, "passenger-014");
    expect(inventory.files.length).toBeGreaterThan(0);
    expect(inventory.hasAudio).toBe(true);
    expect(inventory.hasVisual).toBe(true);
    expect(inventory.hasProgram).toBe(true);
    expect(inventory.hasCredential).toBe(true);
  });

  it("models utilities, applications and offline games as real PROC payloads", () => {
    const programs = index.files.filter((file) => file.extension === ".PROC" && file.payload.kind === "program");
    expect(programs.some((file) => file.payload.kind === "program" && file.payload.programType === "UTILITY")).toBe(true);
    expect(programs.some((file) => file.payload.kind === "program" && file.payload.programType === "APPLICATION")).toBe(true);
    expect(programs.some((file) => file.payload.kind === "program" && file.payload.programType === "GAME")).toBe(true);
    expect(programs.some((file) => file.path.includes("passenger-344") && file.payload.kind === "program" && file.payload.code.some((line) => line.includes("LOAD BOARD")))).toBe(true);
    const damaged = programs.find((file) => file.path.includes("passenger-512"));
    expect(damaged?.corruption).toEqual(["CHECKSUM_MISMATCH", "BLOCK_09_UNREADABLE"]);
    const library = index.files.find((file) => file.path === "/personal/passenger-512/seed-snippets.SCR");
    expect(library?.payload.kind).toBe("text");
    expect(library?.payload.kind === "text" && library.payload.lines.some((line) => line.includes("PATCH BLOCK_09 USING verify_checksum"))).toBe(true);
    expect(damaged?.links.some((link) => link.target === "/personal/passenger-512/seed-snippets.SCR")).toBe(true);
  });

  it("keeps all indexed fields available for deterministic search", () => {
    const coverage = searchFieldCoverage(index);
    expect(coverage.type).toBe(index.files.length);
    expect(coverage.keyword).toBe(index.files.length);
    expect(coverage.time).toBe(index.files.length);
  });

  it("keeps narrative links, sensitive records and credential context attributable", () => {
    expect(continuityIssues(index)).toEqual([]);
    expect(sensitiveRecordIssues(index)).toEqual([]);
    expect(credentialContextIssues(index)).toEqual([]);
  });

  it("preserves cultural and linguistic coverage in the manifest", () => {
    const coverage = culturalCoverage(index);
    expect(coverage.languageCount).toBe(8);
    expect(coverage.familyCount).toBe(150);
    expect(coverage.personalNativeFiles).toBeGreaterThan(600);
  });

  it("emits explicit nationality and family indicators only when file context exists", () => {
    const personal = index.files.find((file) => file.ownerId === "passenger-014");
    const system = index.files.find((file) => file.layer === "SYSTEM");
    expect(personal).toBeDefined();
    expect(terminalIdentityLine(personal!, index)).toMatch(/IDENTITY :: NATIONALITY [A-Z]{2}    FAMILY family-\d+/);
    expect(terminalIdentityLine(system!, index)).toBeNull();
  });

  it("rejects runtime references and firmware combinations that cannot exist in the VFS", () => {
    const issues = terminalCoherenceIssues(index, {
      openFiles: ["/missing.SCR"],
      recoveredPaths: ["/missing.HLT"],
      authenticatedUsers: ["UNKNOWN"],
      installedApps: [{ sourcePath: "/missing.PROC", installedPath: "/tmp/app.PROC" }],
      processes: [{ path: "/missing.PROC", state: "RUNNING" }],
      audio: { path: "/missing.MUS", status: "PLAYING" },
      boot: "BIOS",
      firmware: { maintenancePort: true, ghostBus: true, cryo601: true, rootWrite: true, hiddenVolume: false, debugConsole: false },
      mountedVolumes: [],
    });
    expect(issues).toEqual(expect.arrayContaining([
      "openFiles:missing-path:/missing.SCR",
      "recoveredPaths:missing-path:/missing.HLT",
      "authenticatedUsers:unknown-account:UNKNOWN",
      "installedApps:invalid-target:/tmp/app.PROC",
      "audio:missing-path:/missing.MUS",
      "boot:BIOS-without-ship-volume",
      "firmware:ghost-bus-without-debug-console",
      "firmware:cryo601-without-hidden-volume",
      "firmware:maintenance-port-without-volume",
    ]));
  });

  it("recognizes only a short incomplete legacy reference as HELP", () => {
    expect(isLegacyHelp([
      { text: "COMMANDS // HYBRID SHELL // LEGACY INDEX" },
      { text: "syntax registry :: incomplete / aliases preserved" },
      { text: "legacy aliases: linux / dos / seed" },
    ])).toBe(true);
    expect(isLegacyHelp(Array.from({ length: 20 }, (_, index) => ({ text: `COMMAND ${index}` })))).toBe(false);
  });
});
