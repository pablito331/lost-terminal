import { describe, expect, it } from "vitest";
import { createSeedIndex } from "./seedData";
import { documentSchemaIssues, isLegacyHelp, personalInventory, searchFieldCoverage, searchSeedFiles } from "./seedAudit";

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

  it("keeps all indexed fields available for deterministic search", () => {
    const coverage = searchFieldCoverage(index);
    expect(coverage.type).toBe(index.files.length);
    expect(coverage.keyword).toBe(index.files.length);
    expect(coverage.time).toBe(index.files.length);
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
