import { addPlotline } from "./plotlines";
import type { Book } from "./BookSchema";
import { formatCraftForBrainstorm } from "./craft";
import { formatLanguageForPrompt } from "./generateProse";

/**
 * A Development Method (roadmap-ideas.md #13) is only ever a fixed menu
 * of steps — it never owns data of its own. A "beat" step becomes a
 * Plotline (already built, already the chapter × thread matrix authors
 * use); an "expand" step is a guided prompt whose accepted answer is
 * lifted straight into Synopsis, the same "Send to Synopsis" motion
 * Brainstorm already uses. Switching method, or picking none, never
 * deletes anything either of those already hold.
 *
 * Display text (name, description, step labels/hints/prompts) lives in
 * i18n under `method.methods.<id>`, not here — this module only fixes
 * the shape and step order, which is the same in every locale.
 */
export type DevelopmentStep = { kind: "beat"; id: string; position: string } | { kind: "expand"; id: string };

export type DevelopmentMethod = {
  id: string;
  steps: DevelopmentStep[];
};

export const DEVELOPMENT_METHODS: DevelopmentMethod[] = [
  {
    id: "snowflake",
    steps: [
      { kind: "expand", id: "logline" },
      { kind: "expand", id: "paragraph" },
      { kind: "expand", id: "synopsis" }
    ]
  },
  {
    id: "three-act",
    steps: [
      { kind: "beat", id: "setup", position: "0%" },
      { kind: "beat", id: "inciting", position: "~10%" },
      { kind: "beat", id: "break-two", position: "~25%" },
      { kind: "beat", id: "midpoint", position: "~50%" },
      { kind: "beat", id: "all-is-lost", position: "~75%" },
      { kind: "beat", id: "climax", position: "~90%" },
      { kind: "beat", id: "resolution", position: "100%" }
    ]
  },
  {
    id: "save-the-cat",
    steps: [
      { kind: "beat", id: "opening-image", position: "0%" },
      { kind: "beat", id: "theme-stated", position: "~5%" },
      { kind: "beat", id: "set-up", position: "~1–10%" },
      { kind: "beat", id: "catalyst", position: "~10%" },
      { kind: "beat", id: "debate", position: "~10–20%" },
      { kind: "beat", id: "break-two", position: "~20%" },
      { kind: "beat", id: "b-story", position: "~22%" },
      { kind: "beat", id: "fun-and-games", position: "~20–50%" },
      { kind: "beat", id: "midpoint", position: "~50%" },
      { kind: "beat", id: "bad-guys-close-in", position: "~50–75%" },
      { kind: "beat", id: "all-is-lost", position: "~75%" },
      { kind: "beat", id: "dark-night", position: "~75–80%" },
      { kind: "beat", id: "break-three", position: "~80%" },
      { kind: "beat", id: "finale", position: "~80–99%" },
      { kind: "beat", id: "final-image", position: "100%" }
    ]
  },
  {
    id: "hero-journey",
    steps: [
      { kind: "beat", id: "ordinary-world", position: "~1" },
      { kind: "beat", id: "call", position: "~2" },
      { kind: "beat", id: "refusal", position: "~3" },
      { kind: "beat", id: "mentor", position: "~4" },
      { kind: "beat", id: "threshold", position: "~5" },
      { kind: "beat", id: "tests", position: "~6" },
      { kind: "beat", id: "approach", position: "~7" },
      { kind: "beat", id: "ordeal", position: "~8" },
      { kind: "beat", id: "reward", position: "~9" },
      { kind: "beat", id: "road-back", position: "~10" },
      { kind: "beat", id: "resurrection", position: "~11" },
      { kind: "beat", id: "return", position: "~12" }
    ]
  }
];

export const DEVELOP_EXPAND_SYSTEM = `You are a thinking partner helping a novelist grow a short premise into a fuller synopsis, one guided step at a time.
Write only the requested step's text — no title, no commentary, no numbering.
Stay consistent with anything the author already wrote in this step or an earlier one; grow it, don't replace its meaning.
Match the language of the author's own text.`;

export function developExpandUserPrompt(args: {
  book: Book;
  stepLabel: string;
  stepPrompt: string;
  priorStepsText: string;
  draft: string;
}): string {
  const { book, stepLabel, stepPrompt, priorStepsText, draft } = args;
  const parts = [
    `Manuscript: ${book.title}`,
    formatCraftForBrainstorm(book),
    formatLanguageForPrompt(book.prose_language),
    priorStepsText.trim()
      ? `What the author has already worked out:\n${priorStepsText.trim()}`
      : "Nothing worked out yet — this is the first step.",
    `This step: ${stepLabel}\n${stepPrompt}`,
    draft.trim()
      ? `The author's own draft for this step so far — refine and grow it, keep its intent:\n${draft.trim()}`
      : "The author has not written a draft for this step yet — propose one."
  ];
  return parts.filter(Boolean).join("\n\n");
}

export function developmentMethodById(id: string | undefined): DevelopmentMethod | undefined {
  return DEVELOPMENT_METHODS.find((method) => method.id === id);
}

/**
 * Adds one Plotline per beat this method defines, using the already-
 * localized labels the caller resolved from i18n (keyed by step id),
 * skipping any title that already exists (so re-selecting the same
 * method, or selecting it after the author already added a same-named
 * thread by hand, never duplicates). Safe to call every time the
 * method is (re)selected.
 */
export function materializeBeats(book: Book, method: DevelopmentMethod, labelsByStepId: Record<string, string>): Book {
  const existing = new Set(book.plotlines.map((plotline) => plotline.title.trim().toLowerCase()));
  let next = book;
  for (const step of method.steps) {
    if (step.kind !== "beat") continue;
    const label = labelsByStepId[step.id];
    if (!label) continue;
    if (existing.has(label.trim().toLowerCase())) continue;
    next = addPlotline(next, label);
    existing.add(label.trim().toLowerCase());
  }
  return next;
}
