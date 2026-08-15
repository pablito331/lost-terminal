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

  it("covers the documented corporate metadata contract", () => {
    expect(documentSchemaIssues(index)).toEqual([]);
  });

  it("reports a meaningful personal inventory for the central passenger", () => {
    const inventory = personalInventory(index, "passenger-014");
    expect(inventory.files.length).toBeGreaterThan(0);
    expect(inventory.hasAudio).toBe(true);
    expect(inventory.hasProgram).toBe(true);
    expect(inventory.hasCredential).toBe(true);
  });

  it("keeps all indexed fields available for deterministic search", () => {
    const coverage = searchFieldCoverage(index);
    expect(coverage.type).toBe(index.files.length);
    expect(coverage.keyword).toBe(index.files.length);
    expect(coverage.time).toBe(index.files.length);
  });

  it("recognizes a terse diegetic reference instead of a tutorial", () => {
    expect(isLegacyHelp([
      { text: "COMMANDS // HYBRID SHELL" },
      { text: "legacy aliases: linux / dos / seed" },
    ])).toBe(true);
  });
});
