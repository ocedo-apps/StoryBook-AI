import { en, type Messages } from "./en";
import { nb } from "./nb";
import { sv } from "./sv";

export type LocalePack = {
  /** BCP-47, like `en` or later `zh-Hans`. */
  id: string;
  htmlLang: string;
  nativeLabel: string;
  messages: Messages;
  /** Extra tags that should resolve to this pack (`no` → `nb`). */
  aliases?: readonly string[];
};

/**
 * Register a language here. A new pack is: messages file + one row.
 * Unknown ids and regional tags (`sv-SE`) fall back to prefix, then English.
 */
export const LOCALE_PACKS: readonly LocalePack[] = [
  { id: "en", htmlLang: "en", nativeLabel: "English", messages: en },
  { id: "sv", htmlLang: "sv", nativeLabel: "Svenska", messages: sv },
  { id: "nb", htmlLang: "nb", nativeLabel: "Norsk", aliases: ["no"], messages: nb }
];

export const DEFAULT_LOCALE = "en";
export const LOCALE_KEY = "storybook-ai.locale";

const byId = new Map(LOCALE_PACKS.map((pack) => [pack.id.toLowerCase(), pack]));
const byAlias = new Map<string, LocalePack>();
for (const pack of LOCALE_PACKS) {
  for (const alias of pack.aliases ?? []) {
    byAlias.set(alias.toLowerCase(), pack);
  }
}

export function packFor(id: string): LocalePack {
  const lower = id.toLowerCase();
  return (
    byId.get(lower) ??
    byAlias.get(lower) ??
    LOCALE_PACKS[0] ?? { id: "en", htmlLang: "en", nativeLabel: "English", messages: en }
  );
}

export function localeIds(): string[] {
  return LOCALE_PACKS.map((pack) => pack.id);
}

export function matchLocale(requested: string | null | undefined, available = localeIds()): string {
  const fallback = available.find((id) => id.toLowerCase() === DEFAULT_LOCALE) ?? available[0] ?? DEFAULT_LOCALE;
  if (!requested) return fallback;
  const lower = requested.trim().toLowerCase().replace(/_/g, "-");
  if (!lower) return fallback;
  const exact = available.find((id) => id.toLowerCase() === lower);
  if (exact) return exact;
  const prefix = lower.split("-")[0] ?? "";
  const prefixed = available.find((id) => id.toLowerCase() === prefix);
  if (prefixed) return prefixed;
  const aliased = availablePacks(available).find((pack) =>
    (pack.aliases ?? []).some((alias) => {
      const tag = alias.toLowerCase();
      return lower === tag || prefix === tag || lower.startsWith(`${tag}-`);
    })
  );
  if (aliased) return aliased.id;
  const nested = available.find((id) => lower.startsWith(`${id.toLowerCase()}-`));
  return nested ?? fallback;
}

function availablePacks(available: string[]): LocalePack[] {
  const allowed = new Set(available.map((id) => id.toLowerCase()));
  return LOCALE_PACKS.filter((pack) => allowed.has(pack.id.toLowerCase()));
}

export function parseLocale(value: string | null | undefined): string {
  return matchLocale(value);
}

export function readLocale(): string {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored) return matchLocale(stored);
  } catch {
    /* private mode */
  }
  if (typeof navigator !== "undefined") {
    return matchLocale(navigator.language);
  }
  return DEFAULT_LOCALE;
}

let currentId = DEFAULT_LOCALE;
let currentMessages: Messages = en;

export function getLocaleId(): string {
  return currentId;
}

export function getMessages(): Messages {
  return currentMessages;
}

export function applyLocale(id: string): string {
  const locale = matchLocale(id);
  const pack = packFor(locale);
  currentId = pack.id;
  currentMessages = pack.messages;
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.lang = pack.htmlLang;
    root.dataset.locale = pack.id;
  }
  try {
    localStorage.setItem(LOCALE_KEY, pack.id);
  } catch {
    /* private mode */
  }
  return pack.id;
}
