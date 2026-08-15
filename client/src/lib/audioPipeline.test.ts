import { describe, expect, it } from "vitest";
import { LOFI_AUDIO_PROFILE } from "./audioPipeline";

describe("hidden LO-FI audio pipeline", () => {
  it("defines one fixed profile for every local audio source", () => {
    expect(LOFI_AUDIO_PROFILE.lowpassFrequency).toBe(5200);
    expect(LOFI_AUDIO_PROFILE.compressorRatio).toBeGreaterThan(1);
    expect(LOFI_AUDIO_PROFILE.gain).toBeLessThan(1);
  });

  it("does not expose a bypass flag in the profile", () => {
    expect(Object.keys(LOFI_AUDIO_PROFILE)).not.toContain("bypass");
    expect(Object.keys(LOFI_AUDIO_PROFILE)).not.toContain("enabled");
  });
});
