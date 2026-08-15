import { describe, expect, it } from "vitest";
import { canRenderOwnPlayer, resolveAudioSource } from "./audioSource";

describe("Seed OS audio source policy", () => {
  it("accepts local and direct remote audio resources", () => {
    expect(resolveAudioSource({ mediaSrc: "/audio/passenger-014.MUS" })).toBe("LOCAL");
    expect(resolveAudioSource({ mediaSrc: "https://cdn.example.test/audio/track.mp3", remoteProvider: "PUBLIC_PLAYLIST" })).toBe("DIRECT_REMOTE");
  });

  it("never treats a missing source as a page fallback", () => {
    expect(resolveAudioSource({ remoteProvider: "PUBLIC_PLAYLIST" })).toBe("SOURCE_MISSING");
    expect(canRenderOwnPlayer({ remoteProvider: "PUBLIC_PLAYLIST" })).toBe(false);
  });
});
