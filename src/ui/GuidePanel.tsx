import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "./i18n";
import { QuickstartCards } from "./QuickstartCards";

const HELP_TIP_WIDTH = 280;

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
export const GUIDE_FAQ_IDS = ["no-model", "storage", "network", "cloud"] as const;

export type GuideMainSectionId = (typeof GUIDE_SECTION_IDS)[number];
export type GuideSectionId = GuideMainSectionId | (typeof GUIDE_FAQ_IDS)[number];

/**
 * The guide used to be one long scroll — 16 sections deep, per tester
 * feedback nobody was going to read start to finish. Grouped into tabs
 * instead, one topic at a time. The AI-server quickstart lives behind a
 * button under "getting-started"; FAQ gets its own tab at the far right,
 * since it's troubleshooting reference, not a feature to learn.
 */
export const GUIDE_CATEGORY_IDS = [
  "getting-started",
  "basic-writing",
  "the-writer",
  "images",
  "focused-workflow",
  "advanced-tools",
  "world-bible",
  "polish-publish",
  "troubleshooting"
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
  if ((GUIDE_FAQ_IDS as readonly string[]).includes(id)) return "troubleshooting";
  return (GUIDE_SECTION_CATEGORY as Partial<Record<GuideSectionId, GuideCategoryId>>)[id] ?? "getting-started";
}

function guideAnchorId(id: string): string {
  return `guide-${id}`;
}

/**
 * A small "?" next to a heading or nav item. Used to jump straight to the
 * old Guide's page — now shows that section's text as a hover/focus tooltip
 * instead, so a quick reminder never pulls the author out of what they're
 * doing. The old Guide page itself (`GuidePanel`) is unreachable from here
 * on purpose; this button is now the tooltip, not a navigation shortcut.
 *
 * Rendered through a portal at a `position: fixed` spot computed from the
 * button's own bounding box: several call sites live inside `.rail`
 * (`overflow-y: auto`, which browsers also clip horizontally), so an
 * ordinary `position: absolute` tooltip gets silently cut off there.
 */
export function GuideHelpButton({ anchor, ariaLabel }: { anchor: GuideMainSectionId; ariaLabel: string }) {
  const { messages: m } = useLocale();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function show() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - HELP_TIP_WIDTH - 12));
      setPos({ top: rect.bottom + 6, left });
    }
    setOpen(true);
  }
  function hide() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", hide, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", hide, true);
    };
  }, [open]);

  const entry = m.guide.sections[anchor];

  return (
    <span className="guide-help-wrap" onMouseEnter={show} onMouseLeave={hide}>
      <button
        ref={buttonRef}
        type="button"
        className="guide-help-button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onFocus={show}
        onBlur={hide}
      >
        ?
      </button>
      {open && pos
        ? createPortal(
            <span className="guide-help-tip" role="tooltip" style={{ top: pos.top, left: pos.left }}>
              <strong>{entry.heading}</strong>
              <span className="handbook-body">{entry.body}</span>
            </span>,
            document.body
          )
        : null}
    </span>
  );
}

export function GuidePanel({ scrollTo }: { scrollTo?: GuideSectionId | null }) {
  const { messages: m } = useLocale();
  const [category, setCategory] = useState<GuideCategoryId>("getting-started");
  const [aiSetupOpen, setAiSetupOpen] = useState(false);

  useEffect(() => {
    if (!scrollTo) return;
    setCategory(categoryForAnchor(scrollTo));
  }, [scrollTo]);

  useEffect(() => {
    if (!scrollTo) return;
    document.getElementById(guideAnchorId(scrollTo))?.scrollIntoView({ block: "start" });
  }, [scrollTo, category]);

  useEffect(() => {
    if (!aiSetupOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setAiSetupOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiSetupOpen]);

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
        <section className="guide-block">
          <button type="button" className="primary" onClick={() => setAiSetupOpen(true)}>
            {m.guide.connectAiButton}
          </button>
        </section>
      ) : null}

      {category !== "troubleshooting" ? (
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
      ) : null}

      {category === "troubleshooting" ? (
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

      {aiSetupOpen ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAiSetupOpen(false);
          }}
        >
          <div className="edit-card ai-setup-card" role="dialog" aria-modal="true" aria-label={m.guide.connectAiButton}>
            <div className="stats-card-head">
              <p className="chapter-craft-label">{m.guide.connectAiButton}</p>
              <button type="button" className="text-button" onClick={() => setAiSetupOpen(false)}>
                {m.common.close}
              </button>
            </div>
            <QuickstartCards />
          </div>
        </div>
      ) : null}
    </main>
  );
}
