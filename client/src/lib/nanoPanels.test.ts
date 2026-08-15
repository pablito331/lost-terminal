import { describe, expect, it } from "vitest";
import { closeNanoPanel, focusNanoPanel, nanoPanelStatus, pushNanoPanel, toggleNanoPanel, visibleNanoPanels, type NanoPanel } from "./nanoPanels";

const seedPanels: NanoPanel[] = [
  { path: "/apps/player.PROC", openedAt: 1, collapsed: false },
  { path: "/apps/msg.PROC", openedAt: 2, collapsed: false },
];

describe("nano panel stack", () => {
  it("pushes a program to the focused top without duplicating it", () => {
    const panels = pushNanoPanel(seedPanels, "/apps/player.PROC", 3);
    expect(panels.map((panel) => panel.path)).toEqual(["/apps/msg.PROC", "/apps/player.PROC"]);
    expect(visibleNanoPanels(panels)[0]?.path).toBe("/apps/player.PROC");
    expect(nanoPanelStatus(visibleNanoPanels(panels)[0]!, 0)).toBe("FOCUSED");
  });

  it("parks and focuses an existing instrument", () => {
    const parked = toggleNanoPanel(seedPanels, "/apps/msg.PROC");
    expect(parked[1]?.collapsed).toBe(true);
    const focused = focusNanoPanel(parked, "/apps/msg.PROC");
    expect(visibleNanoPanels(focused)[0]?.path).toBe("/apps/msg.PROC");
    expect(visibleNanoPanels(focused)[0]?.collapsed).toBe(false);
  });

  it("cuts only the selected process", () => {
    const remaining = closeNanoPanel(seedPanels, "/apps/player.PROC");
    expect(remaining.map((panel) => panel.path)).toEqual(["/apps/msg.PROC"]);
  });
});
