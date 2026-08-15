export type AudioSourceMode = "LOCAL" | "DIRECT_REMOTE" | "SOURCE_MISSING";

export type AudioSourceInput = {
  mediaSrc?: string;
  remoteProvider?: "PUBLIC_PLAYLIST";
};

/**
 * The Seed OS renderer accepts only an audio resource, never a provider page.
 * A playlist/provider URL is metadata and must not become a visual fallback.
 */
export function resolveAudioSource(input: AudioSourceInput): AudioSourceMode {
  const source = input.mediaSrc?.trim();
  if (!source) return "SOURCE_MISSING";

  if (/^https?:\/\//i.test(source)) return "DIRECT_REMOTE";
  return "LOCAL";
}

export function canRenderOwnPlayer(input: AudioSourceInput): boolean {
  return resolveAudioSource(input) !== "SOURCE_MISSING";
}
