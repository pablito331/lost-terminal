import { describe, expect, it } from "vitest";
import { createSeedIndex } from "@/lib/seedData";
import { initialRuntime, runCommand } from "./Home";

describe("Seed OS player command flow", () => {
  const index = createSeedIndex();
  const playlistPath = "/personal/passenger-014/playlist.MUS";
  const attachedRuntime = { ...initialRuntime, authority: "CREW" as const, authenticatedUsers: ["I.CHEN"] };

  it("arms a direct remote manifest without autoplay or provider metadata", () => {
    const result = runCommand(`PLAY ${playlistPath}`, "/", index, attachedRuntime);

    expect(result.nextRuntime?.audio.status).toBe("PAUSED");
    expect(result.nextRuntime?.audio.source).toMatch(/^https:\/\//);
    expect(result.lines.map((line) => line.text).join("\n")).toContain("DIRECT CHANNEL / MASKED");
    expect(result.lines.map((line) => line.text).join("\n").toLowerCase()).not.toContain("suno");
  });

  it("transitions an armed channel through resume, pause and stop", () => {
    const armed = runCommand(`PLAY ${playlistPath}`, "/", index, attachedRuntime).nextRuntime!;
    const playing = runCommand("RESUME", "/", index, armed).nextRuntime!;
    const paused = runCommand("PAUSE", "/", index, playing).nextRuntime!;
    const stopped = runCommand("STOP", "/", index, paused).nextRuntime!;

    expect(playing.audio.status).toBe("PLAYING");
    expect(paused.audio.status).toBe("PAUSED");
    expect(stopped.audio.status).toBe("STOPPED");
    expect(stopped.audio.position).toBe(0);
  });
});
