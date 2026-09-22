import type { IllustrationStyle } from "./illustrationStyle";

const PLACEHOLDER_PROMPT = "Placeholder prompt text — replace via the style's edit view once the real wording is ready.";

/**
 * Six starting library entries. Real prompt text lands separately (produced via Gemini) —
 * these carry the intended name and genre tag so the library isn't empty on day one, but
 * the promptText itself is a marked placeholder until that content arrives.
 */
export const BUILTIN_ILLUSTRATION_STYLES: IllustrationStyle[] = [
  {
    id: "builtin-storybook",
    name: "Bold flat-color storybook",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy",
    name: "Painterly epic fantasy",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi",
    name: "Neon-lit cyberpunk",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-horror",
    name: "Ink-wash gothic",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary",
    name: "Muted literary realism",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-historical",
    name: "Sepia vintage etching",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  }
];
