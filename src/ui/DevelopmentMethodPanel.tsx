import { useState } from "react";
import { DEVELOPMENT_METHODS, developmentMethodById, type DevelopmentStep } from "@core/developmentMethod";
import { useLocale, type Messages } from "./i18n";

type MethodMessages = Messages["method"]["methods"][keyof Messages["method"]["methods"]];

export function DevelopmentMethodPanel({
  developmentMethod,
  busy,
  suggestion,
  onUseMethod,
  onNoMethod,
  onAssist,
  onDismissSuggestion,
  onSendToSynopsis,
  onOpenPlotlines
}: {
  developmentMethod: string | undefined;
  busy: boolean;
  suggestion: string | null;
  onUseMethod: (id: string) => void;
  onNoMethod: () => void;
  onAssist: (step: Extract<DevelopmentStep, { kind: "expand" }>, draft: string) => void;
  onDismissSuggestion: () => void;
  onSendToSynopsis: (text: string) => void;
  onOpenPlotlines: () => void;
}) {
  const { messages: m } = useLocale();
  const [pickerOpen, setPickerOpen] = useState(!developmentMethod);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pendingStepId, setPendingStepId] = useState<string | null>(null);

  const method = developmentMethodById(developmentMethod);
  const methodMessages: MethodMessages | undefined = developmentMethod
    ? m.method.methods[developmentMethod as keyof Messages["method"]["methods"]]
    : undefined;

  return (
    <main className="manuscript method-panel">
      <h1 className="chapter-title">{m.method.title}</h1>
      <p className="synopsis-lede">{m.method.lede}</p>

      {method && methodMessages && !pickerOpen ? (
        <div className="method-active">
          <div className="method-active-head">
            <div>
              <span className="method-active-badge">{m.method.activeBadge}</span>
              <h2>{methodMessages.name}</h2>
              <p className="quiet">{methodMessages.description}</p>
            </div>
            <div className="method-active-actions">
              <button type="button" className="text-button" onClick={() => setPickerOpen(true)}>
                {m.method.changeAction}
              </button>
              <button type="button" className="text-button" onClick={onNoMethod}>
                {m.method.noneAction}
              </button>
            </div>
          </div>

          {method.steps[0]?.kind === "beat" ? (
            <section className="method-beats">
              <h3>{m.method.beatsHeading}</h3>
              <p className="quiet">{m.method.beatsHint}</p>
              <ol className="method-beat-list">
                {method.steps.map((step) => {
                  if (step.kind !== "beat") return null;
                  const stepMessages = (methodMessages.steps as Record<string, { label: string; hint: string }>)[step.id];
                  if (!stepMessages) return null;
                  return (
                    <li key={step.id} className="method-beat-row">
                      <span className="method-beat-position">{step.position}</span>
                      <div>
                        <strong>{stepMessages.label}</strong>
                        <p className="quiet">{stepMessages.hint}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <button type="button" className="text-button" onClick={onOpenPlotlines}>
                {m.method.openPlotlines}
              </button>
            </section>
          ) : (
            <section className="method-expand-steps">
              {method.steps.map((step, index) => {
                if (step.kind !== "expand") return null;
                const stepMessages = (methodMessages.steps as Record<string, { label: string; prompt: string }>)[step.id];
                if (!stepMessages) return null;
                const draft = drafts[step.id] ?? "";
                const showSuggestion = pendingStepId === step.id && suggestion !== null;
                return (
                  <div key={step.id} className="method-expand-step">
                    <h3>
                      {index + 1}. {stepMessages.label}
                    </h3>
                    <p className="quiet">{stepMessages.prompt}</p>
                    <textarea
                      value={draft}
                      onChange={(event) => setDrafts((prev) => ({ ...prev, [step.id]: event.target.value }))}
                      placeholder={m.method.draftPlaceholder}
                      rows={3}
                    />
                    <div className="method-expand-actions">
                      <button
                        type="button"
                        className="text-button"
                        disabled={busy}
                        onClick={() => {
                          setPendingStepId(step.id);
                          onAssist(step, draft);
                        }}
                      >
                        {busy && pendingStepId === step.id ? m.method.assisting : m.method.assistAction}
                      </button>
                      <button
                        type="button"
                        className="primary"
                        disabled={!draft.trim()}
                        onClick={() => onSendToSynopsis(draft)}
                      >
                        {m.method.sendToSynopsisAction}
                      </button>
                    </div>
                    {showSuggestion ? (
                      <div className="method-suggestion">
                        <h4>{m.method.suggestionHeading}</h4>
                        <p>{suggestion}</p>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            setDrafts((prev) => ({ ...prev, [step.id]: suggestion ?? "" }));
                            onDismissSuggestion();
                          }}
                        >
                          {m.method.useSuggestionAction}
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </section>
          )}
        </div>
      ) : (
        <div className="method-picker">
          <p className="synopsis-lede">{m.method.pickerLede}</p>
          <div className="method-picker-grid">
            {DEVELOPMENT_METHODS.map((candidate) => {
              const candidateMessages = m.method.methods[candidate.id as keyof Messages["method"]["methods"]];
              return (
                <div key={candidate.id} className="method-card">
                  <h3>{candidateMessages.name}</h3>
                  <p className="quiet">{candidateMessages.description}</p>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      onUseMethod(candidate.id);
                      setPickerOpen(false);
                      setPendingStepId(null);
                    }}
                  >
                    {m.method.useAction}
                  </button>
                </div>
              );
            })}
          </div>
          {method ? (
            <button type="button" className="text-button" onClick={() => setPickerOpen(false)}>
              {m.common.cancel}
            </button>
          ) : null}
        </div>
      )}
    </main>
  );
}
