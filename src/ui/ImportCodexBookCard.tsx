import { useEffect, useState } from "react";
import { CloseIconButton } from "./CloseIconButton";
import { corePrivateManuscripts, type CorePrivateManuscript } from "@persistence/CoreDesktopTransport";
import { useLocale } from "./i18n";

/**
 * "Import Codex book" (Mats, 2026-10-31): the counterpart to Import backup
 * (a JSON file) for a machine that doesn't have the manuscript locally at
 * all, but where kaampi Codex still holds a private snapshot of it - e.g.
 * a fresh install, or a second computer that was never opened this book
 * before. Lists every Codex-held manuscript this install doesn't already
 * have (`localIds`), picked by title/date rather than needing to locate
 * an exported file; importing reuses the same "bring it in with its own
 * original identity" path the Codex version-history restore already has
 * (`importCoreManuscript`, BookStore.tsx), just without a currently open
 * book to restore into.
 */
export function ImportCodexBookCard({
  localIds,
  onImport,
  onClose
}: {
  localIds: Set<string>;
  onImport: (projectId: string) => Promise<void>;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [manuscripts, setManuscripts] = useState<CorePrivateManuscript[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    corePrivateManuscripts()
      .then((list) => {
        if (cancelled) return;
        setManuscripts(list.filter((entry) => !localIds.has(entry.projectId)));
        setState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : String(err));
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [localIds]);

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card bible-card" role="dialog" aria-modal="true" aria-labelledby="import-codex-book-title">
        <div className="bible-card-head">
          <h2 id="import-codex-book-title">{m.home.importCodexBookTitle}</h2>
          <div className="bible-card-head-actions">
            <CloseIconButton onClick={onClose} label={m.bible.close} />
          </div>
        </div>
        <p className="quiet">{m.home.importCodexBookLede}</p>
        {state === "loading" ? <p className="quiet">{m.home.importCodexBookLoading}</p> : null}
        {state === "error" ? (
          <p className="banner" role="status">
            {errorMessage}
          </p>
        ) : null}
        {state === "ready" && manuscripts.length === 0 ? <p className="quiet">{m.home.importCodexBookEmpty}</p> : null}
        {state === "ready" && manuscripts.length > 0 ? (
          <ul className="core-version-list">
            {manuscripts.map((entry) => (
              <li key={entry.projectId}>
                {entry.title.trim() || m.editor.untitled} · {new Date(entry.updatedAt).toLocaleString()}{" "}
                <button
                  type="button"
                  className="text-button"
                  disabled={importingId !== null}
                  onClick={() => {
                    setImportingId(entry.projectId);
                    void onImport(entry.projectId).finally(() => {
                      setImportingId(null);
                      onClose();
                    });
                  }}
                >
                  {importingId === entry.projectId ? m.home.importCodexBookImporting : m.home.importCodexBookImport}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
