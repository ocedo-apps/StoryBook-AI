/**
 * Plotlines used to share Brainstorm's note-card palette (`NoteColor` —
 * five muted, theme-adapted pastels meant to sit behind dark ink text on a
 * card). That's the wrong palette for a Timeline/Plotlines bar: nothing
 * sits on top of a bar, so there's no text-contrast reason to keep it
 * muted, and the author asked for clearly distinguishable, brighter
 * colors — eight saturated hues plus a grey and a dark grey, chosen freely
 * per thread rather than auto-cycled. This is a separate, dedicated
 * palette so widening it never touches Brainstorm's note colors.
 */
export const PLOTLINE_COLORS = [
  "lime",
  "green",
  "cyan",
  "blue",
  "violet",
  "magenta",
  "orange",
  "coral",
  "grey",
  "charcoal"
] as const;

export type PlotlineColor = (typeof PLOTLINE_COLORS)[number];

export const DEFAULT_PLOTLINE_COLOR: PlotlineColor = "blue";

/** A save made before this palette existed still has the old note-color names on its plotlines — map each to its closest new hue so nothing fails to load. */
const LEGACY_COLOR_MAP: Record<string, PlotlineColor> = {
  paper: "grey",
  rust: "coral",
  sage: "green",
  gold: "orange",
  lilac: "violet"
};

export function parsePlotlineColor(value: unknown): PlotlineColor {
  if (typeof value === "string") {
    if ((PLOTLINE_COLORS as readonly string[]).includes(value)) return value as PlotlineColor;
    const mapped = LEGACY_COLOR_MAP[value];
    if (mapped) return mapped;
  }
  return DEFAULT_PLOTLINE_COLOR;
}
