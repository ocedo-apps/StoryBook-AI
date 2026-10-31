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

/**
 * Kaamilla by default (Mats, 2026-10-31: "Jag föreslåt att Kaamilla är
 * default") - but only for someone who has never touched this setting at
 * all. A stored value of "none" (the author explicitly turned the
 * assistant off) must stay off, so the no-value and explicit-"none" cases
 * can't share one fallback the way they used to.
 */
const DEFAULT_MASCOT: MascotId = "kaamilla";

export function parseMascot(value: string | null | undefined): MascotId {
  return value === "kaamilla" || value === "kaamy" || value === "kaambot" ? value : "none";
}

export function readMascot(): MascotId {
  try {
    const stored = localStorage.getItem(MASCOT_KEY);
    return stored === null ? DEFAULT_MASCOT : parseMascot(stored);
  } catch {
    return DEFAULT_MASCOT;
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

/**
 * Any EXPLICIT choice in Settings - including picking Kaamilla again,
 * since that's still the author deliberately touching the control - also
 * retires the one-time intro bubble below. Mats: the intro "ska inte
 * dyka upp om man har ändrat assistent eller slagit av den funktionen" -
 * once the author has shown they know the setting exists, by using it, the
 * intro has nothing left to teach them, whatever character they land on.
 */
export function setMascot(mascot: MascotId): void {
  try {
    localStorage.setItem(MASCOT_KEY, mascot);
  } catch {
    /* private mode */
  }
  listeners.forEach((listener) => listener(mascot));
  dismissMascotIntro();
}

export function subscribeMascot(listener: (mascot: MascotId) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const MASCOT_INTRO_KEY = "storybook-ai.mascot-intro-seen";

/**
 * Kaamilla's one-time "This is Kaamilla, your assistant..." bubble, shown
 * only the first time the default-on Kaamilla appears on Home for someone
 * who has never touched the Assistant setting (see setMascot above for
 * the other way this gets retired - an explicit choice in Settings).
 */
export function readMascotIntroSeen(): boolean {
  try {
    return localStorage.getItem(MASCOT_INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

const introListeners = new Set<() => void>();

export function dismissMascotIntro(): void {
  try {
    localStorage.setItem(MASCOT_INTRO_KEY, "1");
  } catch {
    /* private mode */
  }
  introListeners.forEach((listener) => listener());
}

export function subscribeMascotIntroSeen(listener: () => void): () => void {
  introListeners.add(listener);
  return () => introListeners.delete(listener);
}
