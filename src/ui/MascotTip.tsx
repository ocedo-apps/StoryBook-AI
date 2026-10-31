import { useState } from "react";
import { pickMascotPose, type MascotId } from "./mascot";

/**
 * One mascot speech bubble (Home's "New here?" tip is the first spot this
 * is used in). `action` absent -> a short, pointed bubble (see .has-point
 * in styles.css for why it's capped at ~2 lines); `action` present -> a
 * plain rounded card with a docked button instead, no point.
 *
 * `intro`, when given, adds a second bubble to the right of the main one
 * (Mats, 2026-10-31: Kaamilla's one-time "This is Kaamilla, your
 * assistant..." bubble, shown next to her existing Guide tip the first
 * time she appears as the new default) - its own dismiss button, not tied
 * to `action`.
 *
 * Picks one of the character's poses at random on mount, so the same
 * picture doesn't show every time (Mats, 2026-10-31). The caller passes
 * `key={mascot}` (Home.tsx does) so switching characters in Settings
 * re-mounts this and re-rolls, rather than keeping the old character's
 * pose string around.
 */
export function MascotTip({
  mascot,
  name,
  text,
  action,
  intro
}: {
  mascot: Exclude<MascotId, "none">;
  name: string;
  text: string;
  action?: { label: string; onClick: () => void };
  intro?: { text: string; actionLabel: string; onDismiss: () => void };
}) {
  const [pose] = useState(() => pickMascotPose(mascot));
  return (
    <div className="mascot-tip">
      <img className="mascot-tip-avatar" src={pose} alt={name} />
      <div className="mascot-tip-bubbles">
        <div className={action ? "mascot-bubble has-action" : "mascot-bubble has-point"}>
          <span>{text}</span>
          {action ? (
            <div className="mascot-bubble-action-row">
              <button type="button" className="primary" onClick={action.onClick}>
                {action.label}
              </button>
            </div>
          ) : null}
        </div>
        {intro ? (
          <div className="mascot-bubble has-action">
            <span>{intro.text}</span>
            <div className="mascot-bubble-action-row">
              <button type="button" className="primary" onClick={intro.onDismiss}>
                {intro.actionLabel}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
