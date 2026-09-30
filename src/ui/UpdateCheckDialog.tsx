import React, { useEffect } from "react";
import { format, useLocale } from "./i18n";
import { openExternalUrl, type UpdateStatus } from "./desktopBridge";

const CHANGELOG_URL = "https://github.com/ocedo-apps/StoryBook-AI/blob/main/CHANGELOG.md";

export function UpdateCheckDialog({
  checking,
  status,
  error,
  onClose
}: {
  checking: boolean;
  status: UpdateStatus | null;
  error: string | null;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card" role="dialog" aria-modal="true" aria-labelledby="update-check-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">{m.home.desktopCheckUpdate}</p>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
        <h2 id="update-check-title">{m.home.desktopCheckUpdate}</h2>

        {checking ? (
          <p className="quiet">{m.home.desktopCheckingUpdate}</p>
        ) : error ? (
          <p className="banner home-banner" role="status">
            {format(m.home.desktopUpdateCheckFailed, { error })}
          </p>
        ) : status?.updateAvailable ? (
          <>
            <p role="status">{format(m.home.desktopUpdateAvailable, { current: status.current, latest: status.latest })}</p>
            <div className="edit-actions">
              <button type="button" className="link-button" onClick={() => void openExternalUrl(CHANGELOG_URL)}>
                {m.home.desktopViewChangelog}
              </button>
              <button type="button" className="home-guide-button" onClick={() => void openExternalUrl(status.releaseUrl)}>
                {m.home.desktopDownloadUpdate}
              </button>
            </div>
          </>
        ) : status ? (
          <p className="quiet" role="status">
            {format(m.home.desktopUpToDate, { current: status.current })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
