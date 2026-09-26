import { useEffect, useState } from "react";
import { useLocale } from "./i18n";
import { QuickstartCards } from "./QuickstartCards";

/**
 * Stable, locale-independent anchors for the guide's reference sections —
 * other panels can link straight to one (e.g. a "?" by the Story Bible
 * heading) without caring about wording, category, or array order. Keep
 * this in sync by hand with `guide.sections` in the locale files (same
 * keys, `Record`-typed so TypeScript catches a mismatch).
 */
export const GUIDE_SECTION_IDS = [
  "privacy",
  "author",
  "chapters",
  "editor-tools",
  "add-picture",
  "illustration-prompts",
  "brainstorm-synopsis",
  "method",
  "plotlines",
  "scenes",
  "timeline",
  "story-bible",
  "continuity",
  "proofread",
  "ask-manuscript",
  "publish"
] as const;

/** Same idea, for the FAQ list. Keep in sync by hand with `guide.faq`, index-for-index. */
export const GUIDE_FAQ_IDS = ["no-model", "storage", "cloud"] as const;

export type GuideMainSectionId = (typeof GUIDE_SECTION_IDS)[number];
export type GuideSectionId = GuideMainSectionId | (typeof GUIDE_FAQ_IDS)[number];

/**
 * The guide used to be one long scroll — 16 sections deep, per tester
 * feedback nobody was going to read start to finish. Grouped into tabs
 * instead, one topic at a time. FAQ and the AI-server quickstart always
 * live under "getting-started", since they're not per-feature reference.
 */
export const GUIDE_CATEGORY_IDS = [
  "getting-started",
  "basic-writing",
  "the-writer",
  "images",
  "focused-workflow",
  "advanced-tools",
  "world-bible",
  "polish-publish"
] as const;
export type GuideCategoryId = (typeof GUIDE_CATEGORY_IDS)[number];

export const GUIDE_SECTION_CATEGORY: Record<GuideMainSectionId, GuideCategoryId> = {
  privacy: "getting-started",
  author: "getting-started",
  chapters: "basic-writing",
  "editor-tools": "the-writer",
  "add-picture": "the-writer",
  "illustration-prompts": "images",
  "brainstorm-synopsis": "focused-workflow",
  method: "advanced-tools",
  plotlines: "advanced-tools",
  scenes: "advanced-tools",
  timeline: "advanced-tools",
  "story-bible": "world-bible",
  continuity: "world-bible",
  proofread: "polish-publish",
  "ask-manuscript": "polish-publish",
  publish: "polish-publish"
};

function categoryForAnchor(id: GuideSectionId): GuideCategoryId {
  return (GUIDE_SECTION_CATEGORY as Partial<Record<GuideSectionId, GuideCategoryId>>)[id] ?? "getting-started";
}

function guideAnchorId(id: string): string {
  return `guide-${id}`;
}

export function GuidePanel({ scrollTo }: { scrollTo?: GuideSectionId | null }) {
  const { messages: m } = useLocale();
  const [category, setCategory] = useState<GuideCategoryId>("getting-started");

  useEffect(() => {
    if (!scrollTo) return;
    setCategory(categoryForAnchor(scrollTo));
  }, [scrollTo]);

  useEffect(() => {
    if (!scrollTo) return;
    document.getElementById(guideAnchorId(scrollTo))?.scrollIntoView({ block: "start" });
  }, [scrollTo, category]);

  const sectionsInCategory = GUIDE_SECTION_IDS.filter((id) => GUIDE_SECTION_CATEGORY[id] === category);

  return (
    <main className="manuscript guide-page">
      <h1 className="chapter-title">{m.guide.title}</h1>
      <p className="synopsis-lede">{m.guide.intro}</p>

      <div className="guide-tabs" role="tablist">
        {GUIDE_CATEGORY_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={category === id}
            className={category === id ? "guide-tab is-active" : "guide-tab"}
            onClick={() => setCategory(id)}
          >
            {m.guide.categories[id]}
          </button>
        ))}
      </div>

      {category === "getting-started" ? (
        <section className="guide-block guide-quickstart-block">
          <QuickstartCards />

          <h2 className="settings-heading guide-steps-heading">{m.guide.quickstartStepsHeading}</h2>
          <div className="guide-quickstart-grid">
            <ol className="guide-steps guide-quickstart-steps">
              {m.guide.quickstartSteps.map((step, index) => (
                <li key={index}>
                  <h3>{step.heading}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="guide-block">
        <h2 className="settings-heading">{m.guide.categories[category]}</h2>
        <div className="guide-sections">
          {sectionsInCategory.map((id) => {
            const entry = m.guide.sections[id];
            return (
              <article key={id} id={guideAnchorId(id)} className="guide-section">
                <h3>{entry.heading}</h3>
                <p>{entry.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {category === "getting-started" ? (
        <section className="guide-block">
          <h2 className="settings-heading">{m.guide.faqHeading}</h2>
          <div className="guide-sections">
            {m.guide.faq.map((entry, index) => (
              <article key={index} id={guideAnchorId(GUIDE_FAQ_IDS[index] ?? String(index))} className="guide-section">
                <h3>{entry.heading}</h3>
                <p>{entry.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
