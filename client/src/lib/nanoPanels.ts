export type NanoPanel = { path: string; openedAt: number; collapsed: boolean };

export function pushNanoPanel(panels: NanoPanel[], path: string, openedAt = Date.now()): NanoPanel[] {
  return [...panels.filter((panel) => panel.path.toLowerCase() !== path.toLowerCase()), { path, openedAt, collapsed: false }];
}

export function closeNanoPanel(panels: NanoPanel[], path: string): NanoPanel[] {
  return panels.filter((panel) => panel.path.toLowerCase() !== path.toLowerCase());
}

export function toggleNanoPanel(panels: NanoPanel[], path: string): NanoPanel[] {
  return panels.map((panel) => panel.path.toLowerCase() === path.toLowerCase() ? { ...panel, collapsed: !panel.collapsed } : panel);
}

export function focusNanoPanel(panels: NanoPanel[], path: string): NanoPanel[] {
  const panel = panels.find((candidate) => candidate.path.toLowerCase() === path.toLowerCase());
  if (!panel) return panels;
  return [...panels.filter((candidate) => candidate.path.toLowerCase() !== path.toLowerCase()), { ...panel, collapsed: false }];
}

export function visibleNanoPanels(panels: NanoPanel[]): NanoPanel[] {
  return [...panels].reverse();
}

export function nanoPanelStatus(panel: NanoPanel, position: number): "PARKED" | "FOCUSED" | "ACTIVE" {
  return panel.collapsed ? "PARKED" : position === 0 ? "FOCUSED" : "ACTIVE";
}
