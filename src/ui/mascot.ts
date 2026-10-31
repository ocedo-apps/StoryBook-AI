/**
 * App-wide, localStorage-backed - same pattern as theme.ts. Per-app, not
 * per-manuscript (Mats: "Kanske ska inställningen vara per app?") - Home's
 * own tips need it before any manuscript exists.
 */
export type MascotId = "none" | "kaamilla" | "kaamy" | "kaambot";

export const MASCOT_IDS: MascotId[] = ["none", "kaamilla", "kaamy", "kaambot"];

/**
 * Several poses per character so the same mascot doesn't always show the
 * same picture (Mats, 2026-10-31: "Vi kanske kan slumpa ut en av
 * bilderna så att det inte alltid är samma bild?"). First entry is each
 * character's original/default pose.
 */
export const MASCOT_POSES: Record<Exclude<MascotId, "none">, string[]> = {
  kaamilla: [
    "/mascots/kaamilla.png",
    "/mascots/kaamilla-thinking.png",
    "/mascots/kaamilla-idea.png",
    "/mascots/kaamilla-shrug.png",
    "/mascots/kaamilla-laugh.png"
  ],
  kaamy: [
    "/mascots/kaamy.png",
    "/mascots/kaamy-shrug.png",
    "/mascots/kaamy-thumbsup.png",
    "/mascots/kaamy-coffee.png",
    "/mascots/kaamy-thinking.png"
  ],
  kaambot: ["/mascots/kaambot.png", "/mascots/kaambot-thumbsup.png", "/mascots/kaambot-books.png"]
};

export function pickMascotPose(mascot: Exclude<MascotId, "none">): string {
  const poses = MASCOT_POSES[mascot];
  return poses[Math.floor(Math.random() * poses.length)]!;
}

/** Proper names, same in every language - like the app's own name, not translated. */
export const MASCOT_NAMES: Record<Exclude<MascotId, "none">, string> = {
  kaamilla: "Kaamilla",
  kaamy: "Kaamy",
  kaambot: "Kaambot"
};

const MASCOT_KEY = "storybook-ai.mascot";

export function parseMascot(value: string | null | undefined): MascotId {
  return value === "kaamilla" || value === "kaamy" || value === "kaambot" ? value : "none";
}

export function readMascot(): MascotId {
  try {
    return parseMascot(localStorage.getItem(MASCOT_KEY));
  } catch {
    return "none";
  }
}

/**
 * The `storage` event only fires in OTHER tabs, never the one that wrote
 * the value - and AppSettingsDialog (Settings) and Home (the mascot tip)
 * are both mounted the whole time in the same tab, Home just hidden
 * behind the dialog. Without this, Home's own useState(readMascot) would
 * only ever see the value from when it first mounted.
 */
const listeners = new Set<(mascot: MascotId) => void>();

export function setMascot(mascot: MascotId): void {
  try {
    localStorage.setItem(MASCOT_KEY, mascot);
  } catch {
    /* private mode */
  }
  listeners.forEach((listener) => listener(mascot));
}

export function subscribeMascot(listener: (mascot: MascotId) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
