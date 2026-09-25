import { useEffect } from "react";
import { useLocale } from "./i18n";

/**
 * Stable, locale-independent anchors for the guide's reference sections —
 * other panels can link straight to one (e.g. a "?" by the Story Bible
 * heading) without caring about wording or array order. Keep this in sync
 * by hand with `guide.sections` in the locale files (index-for-index).
 */
export const GUIDE_SECTION_IDS = [
  "privacy",
  "author",
  "brainstorm-synopsis",
  "chapters",
  "scenes",
  "story-bible",
  "continuity",
  "timeline",
  "plotlines",
  "method",
  "proofread",
  "ask-manuscript",
  "publish"
] as const;

/** Same idea, for the FAQ list. Keep in sync by hand with `guide.faq`, index-for-index. */
export const GUIDE_FAQ_IDS = ["no-model", "storage", "cloud"] as const;

export type GuideSectionId = (typeof GUIDE_SECTION_IDS)[number] | (typeof GUIDE_FAQ_IDS)[number];

function guideAnchorId(id: string): string {
  return `guide-${id}`;
}

export function GuidePanel({ scrollTo }: { scrollTo?: GuideSectionId | null }) {
  const { messages: m } = useLocale();

  useEffect(() => {
    if (!scrollTo) return;
    document.getElementById(guideAnchorId(scrollTo))?.scrollIntoView({ block: "start" });
  }, [scrollTo]);

  return (
    <main className="manuscript guide-page">
      <h1 className="chapter-title">{m.guide.title}</h1>
      <p className="synopsis-lede">{m.guide.intro}</p>

      <section className="guide-block">
        <h2 className="settings-heading">{m.guide.quickstartHeading}</h2>
        <ol className="guide-steps">
          {m.guide.quickstartSteps.map((step, index) => (
            <li key={index}>
              <h3>{step.heading}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="guide-block">
        <h2 className="settings-heading">{m.guide.howHeading}</h2>
        <div className="guide-sections">
          {m.guide.sections.map((entry, index) => (
            <article key={index} id={guideAnchorId(GUIDE_SECTION_IDS[index] ?? String(index))} className="guide-section">
              <h3>{entry.heading}</h3>
              <p>{entry.body}</p>
            </article>
          ))}
        </div>
      </section>

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
    </main>
  );
}
