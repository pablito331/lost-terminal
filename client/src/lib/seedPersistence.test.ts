import { describe, expect, it } from "vitest";
import { decodeSeedSession, encodeSeedSession } from "./seedPersistence";

describe("Seed session transfer envelope", () => {
  it("round-trips UTF-8 snapshot data without browser storage", () => {
    const payload = { version: 1, cwd: "/personal/é", lines: ["██", "neural_buffer_corrupted"] };
    const encoded = encodeSeedSession(payload);
    expect(encoded.startsWith("SEED_SESSION_V1:")).toBe(true);
    expect(decodeSeedSession<typeof payload>(encoded)).toEqual(payload);
  });

  it("rejects foreign prefixes and malformed payloads", () => {
    expect(decodeSeedSession("OTHER:abc")).toBeNull();
    expect(decodeSeedSession("SEED_SESSION_V1:not-base64-json")).toBeNull();
  });
});
