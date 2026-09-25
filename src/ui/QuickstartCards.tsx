import { Fragment } from "react";
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
 * The "getting started with a local AI" three-card row — shared between the
 * Guide and the home page. Caller supplies the wrapping element (a
 * `guide-quickstart-block` for the width/grid rules to apply to).
 */
export function QuickstartCards({ headingClassName = "settings-heading" }: { headingClassName?: string }) {
  const { messages: m } = useLocale();

  return (
    <Fragment>
      <h2 className={headingClassName}>{m.guide.quickstartHeading}</h2>
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
    </Fragment>
  );
}
