import { describe, expect, it } from "vitest";
import { createSeedIndex, type FileLanguage, type SeedFile } from "./seedData";
import { translateSeedFile } from "./seedTranslator";

describe("Seed OS native translator", () => {
  const index = createSeedIndex();

  it("creates a temporary phrase interpretation without replacing the source", () => {
    const file = index.files.find((entry) => entry.ownerId === "passenger-014" && entry.payload.kind === "text");
    expect(file).toBeDefined();
    if (!file || file.payload.kind !== "text") return;
    const layer = translateSeedFile(file);
    expect(layer?.sourceLanguage).toBe(file.payload.language);
    expect(layer?.targetLanguage).toBe("SEED-OPS");
    expect(layer?.fidelity).toBe("PARTIAL_PHRASE_MAP");
    expect(layer?.mappedSegments).toBeGreaterThan(0);
    expect(layer?.originalLines).toEqual(file.payload.lines);
    expect(layer?.interpretedLines).toHaveLength(file.payload.lines.length);
  });

  it("produces useful non-identical layers for the supported source languages", () => {
    const languages: FileLanguage[] = ["pt-BR", "es-MX", "en-US", "fr-FR", "de-DE", "zh-CN", "ja-JP", "ar-EG"];
    for (const language of languages) {
      const source = index.files.find((entry) => {
        if (entry.payload.language !== language) return false;
        const layer = translateSeedFile(entry);
        return Boolean(layer && layer.mappedSegments > 0);
      });
      expect(source, `missing mapped source for ${language}`).toBeDefined();
      if (!source) continue;
      const layer = translateSeedFile(source);
      expect(layer?.interpretedLines.length).toBeGreaterThan(0);
      expect(layer?.mappedSegments).toBeGreaterThan(0);
      expect(layer?.interpretedLines.some((line, position) => line !== layer.originalLines[position])).toBe(true);
    }
  });

  it("interprets message, health and incident payloads as temporary text layers", () => {
    for (const kind of ["message", "health", "incident"] as const) {
      const file = index.files.find((entry) => entry.payload.kind === kind);
      expect(file, `missing ${kind} source`).toBeDefined();
      if (!file) continue;
      const layer = translateSeedFile(file);
      expect(layer?.originalLines.length).toBeGreaterThan(0);
      expect(layer?.interpretedLines).toHaveLength(layer.originalLines.length);
    }
  });

  it("does not translate binary payloads as text", () => {
    const file = index.files.find((entry) => entry.payload.kind === "program");
    expect(file).toBeDefined();
    expect(file && translateSeedFile(file)).toBeNull();
  });
});
