import { describe, expect, it } from "vitest";
import { createBook, updateChapter } from "@core/BookSchema";
import { ANALYZE_SYSTEM, analyzeUserPrompt, locateQuote, parseChapterFeedback } from "@core/chapterFeedback";

function bookWithProse(prose: string) {
  const book = createBook("Night Keys");
  const chapter = book.chapters[0]!;
  return {
    book: updateChapter(book, chapter.id, { prose }),
    chapterId: chapter.id
  };
}

describe("analyzeUserPrompt", () => {
  it("sends the chapter and Story Bible, never brainstorm", () => {
    const { book, chapterId } = bookWithProse("Emma locked the quay door. She felt tired to her bones.");
    const withSecret = {
      ...book,
      brainstorm: "The stowaway is the captain's sister. Do not reveal this yet.",
      facts: [
        {
          id: "1",
          entity_ref: "emma",
          entity_label: "Emma",
          predicate: "core.trait" as const,
          value: "Slow to trust",
          sequence_index: 0,
          status: "locked" as const,
          source: "author" as const,
          created_at: book.created_at
        },
        {
          id: "2",
          entity_ref: "emma",
          entity_label: "Emma",
          predicate: "core.trait" as const,
          value: "She killed the skipper",
          sequence_index: 1,
          status: "locked" as const,
          source: "author" as const,
          hidden_from_ai: true,
          created_at: book.created_at
        }
      ]
    };
    const chapter = withSecret.chapters.find((item) => item.id === chapterId)!;
    const prompt = analyzeUserPrompt(withSecret, chapter);
    expect(prompt).toContain("Emma locked the quay door");
    expect(prompt).toContain("Slow to trust");
    expect(prompt).toContain("Skip voice_drift");
    expect(prompt).not.toContain("captain's sister");
    expect(prompt).not.toContain("brainstorm");
    expect(prompt).not.toContain("stowaway");
    expect(prompt).not.toContain("She killed the skipper");
  });

  it("sends Voice when the manuscript has one", () => {
    const { book, chapterId } = bookWithProse("Emma locked the quay door.");
    const withVoice = { ...book, voice: "Dry, maritime, short sentences" };
    const chapter = withVoice.chapters.find((item) => item.id === chapterId)!;
    const prompt = analyzeUserPrompt(withVoice, chapter);
    expect(prompt).toContain("Dry, maritime, short sentences");
    expect(prompt).not.toContain("Skip voice_drift");
  });
});

describe("ANALYZE_SYSTEM", () => {
  it("covers the four review categories and never rewrites", () => {
    expect(ANALYZE_SYSTEM).toContain("show_vs_tell");
    expect(ANALYZE_SYSTEM).toContain("dialogue_purpose");
    expect(ANALYZE_SYSTEM).toContain("voice_drift");
    expect(ANALYZE_SYSTEM).toContain("character_fidelity");
    expect(ANALYZE_SYSTEM).toMatch(/do not write prose/i);
    expect(ANALYZE_SYSTEM).toMatch(/not a rewrite/i);
    expect(ANALYZE_SYSTEM).toContain("symphony of machinery");
    expect(ANALYZE_SYSTEM).toContain("keep you on your toes");
  });
});

describe("parseChapterFeedback", () => {
  const prose = "Emma locked the quay. She felt tired to her bones.\n\nShe told the stranger everything before the tide turned.";

  it("reads items and finds the paragraph", () => {
    const items = parseChapterFeedback(
      JSON.stringify({
        items: [
          {
            category: "show_vs_tell",
            quote: "She felt tired to her bones.",
            observation: "The fatigue is named rather than shown in the body."
          },
          {
            category: "character_fidelity",
            quote: "She told the stranger everything before the tide turned.",
            observation: "Immediate disclosure sits against a reserved trait.",
            relatedFact: "Emma · Trait: Slow to trust"
          }
        ]
      }),
      prose
    );
    expect(items).toHaveLength(2);
    expect(items[0]?.category).toBe("show_vs_tell");
    expect(items[0]?.paragraphIndex).toBe(0);
    expect(items[1]?.paragraphIndex).toBe(1);
    expect(items[1]?.relatedFact).toBe("Emma · Trait: Slow to trust");
  });

  it("drops unknown categories, rewrites, and empty quotes", () => {
    const items = parseChapterFeedback(
      JSON.stringify({
        items: [
          { category: "pacing_rant", quote: "Emma locked the quay.", observation: "Too slow." },
          { category: "show_vs_tell", quote: "Hi", observation: "Too short." },
          { category: "show_vs_tell", quote: "Emma locked the quay.", observation: "" }
        ]
      }),
      prose
    );
    expect(items).toEqual([]);
  });

  it("keeps dialogue with quotation marks and drops narration posing as talk", () => {
    const spoken = 'Emma locked the quay. "Tide\'s late," she said.\n\nShe felt tired to her bones.';
    const items = parseChapterFeedback(
      JSON.stringify({
        items: [
          {
            category: "dialogue_purpose",
            quote: '"Tide\'s late," she said.',
            observation: "Weather small talk that does not move the scene."
          },
          {
            category: "dialogue_purpose",
            quote: "She felt tired to her bones.",
            observation: "Not speech."
          }
        ]
      }),
      spoken
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.category).toBe("dialogue_purpose");
  });

  it("drops dialogue notes that admit the line reveals character", () => {
    const spoken =
      "Emma shrugs, her eyes never leaving Jeff's. 'Someone's gotta keep you on your toes, Captain,' she says, her tone light but with an undercurrent of seriousness.";
    const items = parseChapterFeedback(
      JSON.stringify({
        items: [
          {
            category: "dialogue_purpose",
            quote: spoken,
            observation: "This line reveals Emma's seriousness without advancing the scene."
          }
        ]
      }),
      spoken
    );
    expect(items).toEqual([]);
  });

  it("keeps voice drift only when Voice is set", () => {
    const payload = JSON.stringify({
      items: [
        {
          category: "voice_drift",
          quote: "She felt tired to her bones.",
          observation: "The line goes lush against a dry register."
        }
      ]
    });
    expect(parseChapterFeedback(payload, prose)).toEqual([]);
    expect(parseChapterFeedback(payload, prose, { voice: "Dry, maritime" })).toHaveLength(1);
  });

  it("recovers fenced JSON", () => {
    const raw = 'Here you go:\n```json\n{"items":[{"category":"show_vs_tell","quote":"She felt tired to her bones.","observation":"Named feeling."}]}\n```';
    expect(parseChapterFeedback(raw, prose)).toHaveLength(1);
  });

  it("returns nothing when the model rambles", () => {
    expect(parseChapterFeedback("Sorry, I cannot.", prose)).toEqual([]);
  });

  it("drops imagery posing as show-vs-tell", () => {
    const ship =
      "The Odyssey hums to life around them, a symphony of machinery and energy that fills the ship with purpose and possibility.";
    const items = parseChapterFeedback(
      JSON.stringify({
        items: [
          {
            category: "show_vs_tell",
            quote: ship,
            observation:
              "The Odyssey humming to life and the symphony of machinery and energy show the ship's readiness and the crew's determination, rather than explicitly stating their purpose."
          },
          {
            category: "show_vs_tell",
            quote: "She felt tired to her bones.",
            observation: "The fatigue is named rather than shown in the body."
          }
        ]
      }),
      `${ship}\n\nShe felt tired to her bones.`
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.quote).toBe("She felt tired to her bones.");
  });

  it("drops a show-vs-tell note that says the quote already shows", () => {
    const items = parseChapterFeedback(
      JSON.stringify({
        items: [
          {
            category: "show_vs_tell",
            quote: "She felt tired to her bones.",
            observation:
              "The locked door implies fatigue rather than explicitly stating her feelings."
          }
        ]
      }),
      prose
    );
    expect(items).toEqual([]);
  });

  it("caps the list at ten items", () => {
    const items = parseChapterFeedback(
      JSON.stringify({
        items: Array.from({ length: 12 }, (_, index) => ({
          category: "show_vs_tell",
          quote: `She felt tired to her bones. ${index}`,
          observation: "Named feeling."
        }))
      }),
      prose
    );
    expect(items).toHaveLength(10);
  });
});

describe("locateQuote", () => {
  it("returns null when the quote is not in the chapter", () => {
    expect(locateQuote("Emma locked the quay.", "Jeff wondered about the keys.")).toBeNull();
  });
});
