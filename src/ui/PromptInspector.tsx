import type { PromptDebugEntry } from "./promptDebug";
import { totalEstimatedTokens } from "./promptDebug";
import { format, useLocale } from "./i18n";

export function PromptInspectorCard({ entry, onClose }: { entry: PromptDebugEntry | null; onClose: () => void }) {
  const { messages: m } = useLocale();
  const system = entry?.messages.find((message) => message.role === "system");
  const user = entry?.messages.find((message) => message.role === "user");
  const operationLabel = entry ? m.aiContext.operations[entry.operation] : undefined;
  const targetLabel = entry?.target ? m.aiContext.target[entry.target] : undefined;

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card prompt-inspector-card" role="dialog" aria-modal="true" aria-labelledby="ai-context-title">
        <h2 id="ai-context-title">{m.aiContext.title}</h2>
        <p className="quiet">{m.aiContext.hint}</p>
        {!entry ? (
          <p className="quiet">{m.aiContext.empty}</p>
        ) : (
          <>
            <dl className="prompt-inspector-meta">
              <div>
                <dt>{m.aiContext.operation}</dt>
                <dd>{operationLabel}{targetLabel ? ` — ${targetLabel}` : ""}</dd>
              </div>
              <div>
                <dt>{m.aiContext.model}</dt>
                <dd>{entry.model}</dd>
              </div>
            </dl>
            <p className="quiet">{format(m.aiContext.tokensEstimate, { n: totalEstimatedTokens(entry) })}</p>
            {system ? (
              <>
                <h3 className="prompt-inspector-heading">{m.aiContext.systemInstructions}</h3>
                <pre className="prompt-inspector-block">{system.content}</pre>
              </>
            ) : null}
            {user ? (
              <>
                <h3 className="prompt-inspector-heading">{m.aiContext.whatWasSent}</h3>
                <pre className="prompt-inspector-block">{user.content}</pre>
              </>
            ) : null}
          </>
        )}
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
      </div>
    </div>
  );
}
