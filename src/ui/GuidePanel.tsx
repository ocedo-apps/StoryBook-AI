import { useEffect } from "react";
import { useLocale } from "./i18n";

/** Minimal line-art badges for the quickstart cards — no fill, single stroke, matching the logo's sketched-line character. */
const QUICKSTART_ICONS = [
  // Install: download into a tray
  <svg key="install" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v10" />
    <path d="M8 9l4 4 4-4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>,
  // Choose: a spark, standing for the model's own "intelligence"
  <svg key="choose" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
  </svg>,
  // Connect: a chain link
  <svg key="connect" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14a4 4 0 0 0 5.66 0l2-2a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-2 2a4 4 0 0 0 5.66 5.66l1-1" />
  </svg>
];

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

      <section className="guide-block guide-quickstart-block">
        <h2 className="settings-heading">{m.guide.quickstartHeading}</h2>
        <div className="guide-quickstart-grid">
          {m.guide.quickstartCards.map((card, index) => (
            <article key={index} className="guide-card">
              <span className="guide-card-icon" aria-hidden="true">
                {QUICKSTART_ICONS[index]}
              </span>
              <h3>{card.heading}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

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
