import React, { useEffect, useMemo, useRef, useState } from "react";
import { analyzeProse, entityNameTokens, type ProseStats } from "@core/proseStats";
import {
  GAUGE_DETAILS,
  mixLabel,
  profileLine,
  scoreDirectness,
  scorePacing,
  scoreVocabulary,
  type GaugeId
} from "@core/proseScores";
import type { CastMember } from "@core/characterProfile";
import type { CraftFields } from "@core/craft";
import { flagEchoes } from "@core/echoDetect";
import { htmlFromProse } from "@core/proseFlow";
import { flagPovLeaks, povLeakBlurb } from "@core/povLeak";
import { tallyRareWords } from "@core/rareWords";
import { proseFromElement } from "./proseDom";

const MIN_SPLIT_WORDS = 12;
const GAUGE_ORDER: GaugeId[] = ["directness", "pacing", "vocabulary"];

export function ProseStatsCard({
  text,
  names,
  craft,
  cast = [],
  highlighting,
  onHighlight,
  onSuggestSplit,
  onSuggestBreak,
  onApplySplit,
  onClose
}: {
  text: string;
  names: string[];
  craft?: CraftFields;
  cast?: CastMember[];
  highlighting: boolean;
  onHighlight: () => void;
  onSuggestSplit: (sentence: string, signal: AbortSignal) => Promise<string>;
  onSuggestBreak: (paragraph: string, signal: AbortSignal) => Promise<string>;
  onApplySplit: (sentence: string, split: string) => boolean;
  onClose: () => void;
}) {
  const stats = useMemo(() => analyzeProse(text, entityNameTokens(names)), [names, text]);
  const rare = useMemo(() => tallyRareWords(text, names), [names, text]);
  const echoes = useMemo(() => flagEchoes(text, names), [names, text]);
  const leaks = useMemo(() => flagPovLeaks(text, craft, cast), [cast, craft, text]);
  const gauges = useMemo(
    () => ({
      directness: scoreDirectness(stats),
      pacing: scorePacing(stats),
      vocabulary: scoreVocabulary(stats, rare.count)
    }),
    [rare.count, stats]
  );
  const [detail, setDetail] = useState<GaugeId | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [packed, setPacked] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [splitBusy, setSplitBusy] = useState(false);
  const [splitError, setSplitError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (detail) {
        setDetail(null);
        return;
      }
      if (packed !== null) {
        setPacked(null);
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, onClose, packed]);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSelected(null);
    setPacked(null);
    setSuggestion("");
    setSplitBusy(false);
    setSplitError(false);
  }, [text]);

  const sentence = selected !== null ? (stats.sentenceTexts[selected] ?? "") : "";
  const sentenceWords = selected !== null ? (stats.sentenceLengths[selected] ?? 0) : 0;
  const packedFlag = packed !== null ? (stats.mixedParagraphs[packed] ?? null) : null;

  function pickPacked(index: number) {
    abortRef.current?.abort();
    abortRef.current = null;
    setSuggestion("");
    setSplitBusy(false);
    setSplitError(false);
    setSelected(null);
    setPacked((current) => (current === index ? null : index));
  }

  function showBar(index: number) {
    abortRef.current?.abort();
    abortRef.current = null;
    setSuggestion("");
    setSplitBusy(false);
    setSplitError(false);
    setSelected(index);
    setPacked(null);
  }

  function pickBar(index: number) {
    if (selected === index) {
      abortRef.current?.abort();
      abortRef.current = null;
      setSuggestion("");
      setSplitBusy(false);
      setSplitError(false);
      setSelected(null);
      return;
    }
    showBar(index);
  }

  async function suggestSplit() {
    if (!sentence || sentenceWords < MIN_SPLIT_WORDS || splitBusy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSplitBusy(true);
    setSplitError(false);
    setSuggestion("");
    try {
      const split = await onSuggestSplit(sentence, controller.signal);
      if (controller.signal.aborted) return;
      if (!split) {
        setSplitError(true);
        return;
      }
      setSuggestion(split);
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setSplitError(true);
    } finally {
      if (!controller.signal.aborted) setSplitBusy(false);
    }
  }

  function applySplit() {
    const next = suggestion.trim();
    if (!sentence || !next) return;
    if (!onApplySplit(sentence, next)) {
      setSplitError(true);
      return;
    }
    setSelected(null);
    setSuggestion("");
  }

  async function suggestBreak() {
    if (!packedFlag || splitBusy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSplitBusy(true);
    setSplitError(false);
    setSuggestion("");
    try {
      const split = await onSuggestBreak(packedFlag.text, controller.signal);
      if (controller.signal.aborted) return;
      if (!split) {
        setSplitError(true);
        return;
      }
      setSuggestion(split);
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setSplitError(true);
    } finally {
      if (!controller.signal.aborted) setSplitBusy(false);
    }
  }

  function applyBreak() {
    const next = suggestion.trim();
    if (!packedFlag || !next) return;
    if (!onApplySplit(packedFlag.text, next)) {
      setSplitError(true);
      return;
    }
    setPacked(null);
    setSuggestion("");
  }

  const open = detail ? GAUGE_DETAILS[detail] : null;

  function toggleDetail(id: GaugeId) {
    setDetail((current) => (current === id ? null : id));
  }

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="edit-card stats-card" role="dialog" aria-modal="true" aria-labelledby="stats-title">
        <div className="stats-card-head">
          <p className="chapter-craft-label">Stats</p>
          <button type="button" className="text-button" onClick={onClose}>
            Close
          </button>
        </div>
        <h2 id="stats-title">{stats.words > 0 ? "How it reads" : "No prose yet"}</h2>

        {stats.sentenceLengths.length > 0 ? (
          <SentenceSparkline stats={stats} selected={selected} onSelect={pickBar} />
        ) : (
          <p className="quiet">Write some prose to see how it reads.</p>
        )}

        {sentence ? (
          <div className="stats-sentence">
            <p className="chapter-craft-label">
              Sentence {selected === null ? 0 : selected + 1} · {sentenceWords} word{sentenceWords === 1 ? "" : "s"}
            </p>
            <blockquote>{sentence}</blockquote>
            {sentenceWords < MIN_SPLIT_WORDS ? (
              <p className="quiet">Already short.</p>
            ) : (
              <div className="stats-sentence-actions">
                <button type="button" onClick={() => void suggestSplit()} disabled={splitBusy}>
                  {splitBusy ? "Looking…" : "Suggest a split"}
                </button>
              </div>
            )}
            {splitError ? <p className="quiet">No split this time.</p> : null}
            {suggestion ? (
              <>
                <p className="chapter-craft-label">Split</p>
                <textarea
                  className="stats-split"
                  value={suggestion}
                  onChange={(event) => setSuggestion(event.target.value)}
                  rows={3}
                  autoFocus
                  aria-label="Edit split"
                />
                <div className="stats-sentence-actions">
                  <button type="button" className="primary" onClick={applySplit} disabled={!suggestion.trim()}>
                    Use this split
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : packedFlag ? (
          <div className="stats-sentence">
            <p className="chapter-craft-label">
              Paragraph {packedFlag.index + 1} · {packedFlag.words} word{packedFlag.words === 1 ? "" : "s"}
            </p>
            <blockquote>{packedFlag.text}</blockquote>
            <p className="quiet">Action, a long look back, and stacked senses in this block.</p>
            <div className="stats-sentence-actions">
              <button type="button" onClick={() => void suggestBreak()} disabled={splitBusy}>
                {splitBusy ? "Looking…" : "Suggest a break"}
              </button>
            </div>
            {splitError ? <p className="quiet">No break this time.</p> : null}
            {suggestion ? (
              <>
                <p className="chapter-craft-label">Break</p>
                <BreakDraft value={suggestion} onChange={setSuggestion} />
                <div className="stats-sentence-actions">
                  <button type="button" className="primary" onClick={applyBreak} disabled={!suggestion.trim()}>
                    Use this break
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : stats.sentenceLengths.length > 0 ? (
          <p className="quiet stats-spark-hint">Click a bar to read that sentence.</p>
        ) : null}

        {stats.words > 0 ? (
          <>
            <div className="stats-gauges">
              {GAUGE_ORDER.map((id) => {
                const copy = GAUGE_DETAILS[id];
                const expanded = detail === id;
                return (
                  <div key={id} className={expanded ? "stats-accordion is-open" : "stats-accordion"}>
                    <GaugeRow
                      id={id}
                      label={copy.label}
                      score={gauges[id]}
                      {...(id === "pacing"
                        ? {
                            note:
                              stats.profile.id === "short" ? mixLabel(stats.mix) : profileLine(stats.profile)
                          }
                        : {})}
                      expanded={expanded}
                      onToggle={() => toggleDetail(id)}
                    />
                    {expanded ? (
                      <GaugeDetail
                        detail={copy}
                        stats={stats}
                        rare={rare}
                        highlighting={highlighting}
                        onHighlight={() => {
                          onHighlight();
                          onClose();
                        }}
                        onShowSentence={showBar}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            {stats.mixedParagraphs.length > 0 ? (
              <div className="stats-long stats-packed">
                <p className="chapter-craft-label">Mixed focus</p>
                <p className="quiet">
                  {stats.mixedParagraphs.length === 1
                    ? "This block mixes present action, a long look back, and stacked senses."
                    : "These blocks mix present action, a long look back, and stacked senses."}
                </p>
                <ul>
                  {stats.mixedParagraphs.map((item, index) => (
                    <li key={item.index} className={packed === index ? "is-selected" : undefined}>
                      <button type="button" className="stats-long-pick" onClick={() => pickPacked(index)}>
                        {clip(item.text, 140)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {echoes.length > 0 ? (
              <div className="stats-long stats-packed">
                <p className="chapter-craft-label">Echo</p>
                <p className="quiet">
                  The same word or phrase repeats in a short span. A refrain can be the point.
                </p>
                <ul>
                  {echoes.map((hit) => (
                    <li
                      key={hit.phrase}
                      className={selected !== null && hit.sentenceIndexes.includes(selected) ? "is-selected" : undefined}
                    >
                      <button
                        type="button"
                        className="stats-long-pick"
                        onClick={() => pickBar(hit.sentenceIndexes[0] ?? 0)}
                      >
                        {hit.phrase} ×{hit.count}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {leaks.length > 0 && craft ? (
              <div className="stats-long stats-packed">
                <p className="chapter-craft-label">POV leak</p>
                <p className="quiet">{povLeakBlurb(craft)}</p>
                <ul>
                  {leaks.map((hit) => (
                    <li key={`${hit.sentenceIndex}-${hit.who}`} className={selected === hit.sentenceIndex ? "is-selected" : undefined}>
                      <button type="button" className="stats-long-pick" onClick={() => pickBar(hit.sentenceIndex)}>
                        {clip(hit.sentence, 140)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="quiet stats-foot">
              {stats.words} words · {stats.sentences} sentences · {Math.round(stats.dialogueShare * 100)}% spoken
            </p>
            <div className="edit-actions">
              <button
                type="button"
                className="primary"
                onClick={() => {
                  onHighlight();
                  onClose();
                }}
                disabled={rare.count === 0 && !highlighting}
              >
                {highlighting ? "Keep highlighting" : "Highlight in text"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function GaugeRow({
  id,
  label,
  score,
  note,
  expanded,
  onToggle
}: {
  id: GaugeId;
  label: string;
  score: number | null;
  note?: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="stats-gauge"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={`stats-panel-${id}`}
      aria-label={`${label} ${fmtScore(score)}. ${expanded ? "Hide" : "About"} this gauge.`}
    >
      <span className="stats-gauge-copy">
        <span className="stats-gauge-label">{label}</span>
        {note ? <span className="quiet">{note}</span> : null}
      </span>
      <span className="stats-gauge-score">{fmtScore(score)}</span>
      <span className="stats-info" aria-hidden="true">
        i
      </span>
    </button>
  );
}

function GaugeDetail({
  detail,
  stats,
  rare,
  highlighting,
  onHighlight,
  onShowSentence
}: {
  detail: (typeof GAUGE_DETAILS)[GaugeId];
  stats: ProseStats;
  rare: ReturnType<typeof tallyRareWords>;
  highlighting: boolean;
  onHighlight: () => void;
  onShowSentence: (index: number) => void;
}) {
  return (
    <div className="stats-detail" id={`stats-panel-${detail.id}`} role="region" aria-label={detail.label}>
      <section>
        <p className="chapter-craft-label">What this measures</p>
        <p>{detail.measures}</p>
      </section>
      <section>
        <p className="chapter-craft-label">How to raise it</p>
        <ul>
          {detail.raise.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className="chapter-craft-label">Remember</p>
        <p>{detail.remember}</p>
      </section>
      <p className="quiet">{detailReadout(detail.id, stats, rare.count)}</p>
      {detail.id === "pacing" && stats.longSentences.length > 0 ? (
        <div className="stats-long">
          <p className="chapter-craft-label">30+ words</p>
          <ul>
            {stats.longSentences.map((item, index) => {
              const bar = stats.sentenceTexts.indexOf(item);
              return (
                <li key={index}>
                  <button type="button" className="stats-long-pick" onClick={() => bar >= 0 && onShowSentence(bar)}>
                    {clip(item, 140)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {detail.id === "vocabulary" && rare.unique.length > 0 ? (
        <div className="stats-rare">
          <p className="chapter-craft-label">Off the familiar list</p>
          <ul className="stats-rare-list">
            {rare.unique.slice(0, 24).map((entry) => (
              <li key={entry.word}>
                {entry.word}
                {entry.count > 1 ? <span className="quiet"> ×{entry.count}</span> : null}
              </li>
            ))}
          </ul>
          <div className="edit-actions">
            <button type="button" className="primary" onClick={onHighlight} disabled={rare.count === 0 && !highlighting}>
              {highlighting ? "Keep highlighting" : "Highlight in text"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SentenceSparkline({
  stats,
  selected,
  onSelect
}: {
  stats: ProseStats;
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const peak = Math.max(LONG_BAR, ...stats.sentenceLengths);
  return (
    <div className="stats-spark" role="list">
      {stats.sentenceLengths.map((length, index) => (
        <button
          key={index}
          type="button"
          role="listitem"
          className={[length >= LONG_BAR ? "is-long" : "", selected === index ? "is-selected" : ""]
            .filter(Boolean)
            .join(" ")}
          style={{ height: `${Math.max(12, Math.round((length / peak) * 100))}%` }}
          title={`${length} words`}
          aria-label={`Sentence ${index + 1}, ${length} words`}
          aria-pressed={selected === index}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}

const LONG_BAR = 30;

function detailReadout(id: GaugeId, stats: ProseStats, rareCount: number): string {
  if (id === "directness") {
    const passivesPerThousand = stats.words ? (stats.passiveCount / stats.words) * 1000 : 0;
    return `${fmt(stats.adverbPerThousand)} -ly / 1k · ${fmt(passivesPerThousand)} possible passives / 1k · start at 100, minus those two.`;
  }
  if (id === "pacing") {
    const span =
      stats.sentenceMin === stats.sentenceMax
        ? `${stats.sentenceMin} words each`
        : `${stats.sentenceMin}–${stats.sentenceMax} words`;
    return `${mixLabel(stats.mix)} · ${fmt(stats.meanSentence)} words typical · ${span}. Variation raises it; a stack of 30+ lines or a monotone lowers it.`;
  }
  const share = stats.words ? Math.round((rareCount / stats.words) * 100) : 0;
  return `${share}% uncommon · variety ${stats.typeTokenRatio.toFixed(2)}. A mix scores higher than all-plain or all-rare.`;
}

function fmtScore(score: number | null): string {
  return score === null ? "—" : String(score);
}

function fmt(value: number): string {
  return value >= 10 ? String(Math.round(value)) : value.toFixed(1);
}

function clip(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

function BreakDraft({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el && proseFromElement(el) === value) return;
    if (proseFromElement(el) === value) return;
    el.innerHTML = htmlFromProse(value);
    el.focus();
  }, [value]);

  return (
    <div
      ref={ref}
      className="stats-split is-break"
      contentEditable
      role="textbox"
      aria-multiline="true"
      aria-label="Edit paragraph break"
      suppressContentEditableWarning
      onInput={(event) => onChange(proseFromElement(event.currentTarget))}
      onKeyDown={(event) => {
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        document.execCommand("insertParagraph");
      }}
    />
  );
}
