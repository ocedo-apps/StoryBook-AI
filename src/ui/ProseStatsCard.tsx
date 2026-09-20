import React, { useEffect, useMemo, useRef, useState } from "react";
import { analyzeProse, entityNameTokens, type ProseStats } from "@core/proseStats";
import {
  scoreDirectness,
  scorePacing,
  scoreVocabulary,
  type GaugeId
} from "@core/proseScores";
import { readerTuning } from "@core/reader";
import type { CastMember } from "@core/characterProfile";
import type { CraftFields } from "@core/craft";
import { flagEchoes } from "@core/echoDetect";
import { htmlFromProse } from "@core/proseFlow";
import { flagPovLeaks } from "@core/povLeak";
import { tallyRareWords } from "@core/rareWords";
import { proseFromElement } from "./proseDom";
import { useLocale, format, count, type Messages } from "./i18n";

const MIN_SPLIT_WORDS = 12;
const GAUGE_ORDER: GaugeId[] = ["directness", "pacing", "vocabulary"];

function leakBlurb(craft: CraftFields, m: Messages): string {
  if (craft.pov === "objective") return m.stats.leakObjective;
  const who = craft.viewpoint.trim();
  if (craft.pov === "first") {
    return who ? format(m.stats.leakFirstNamed, { who }) : m.stats.leakOther;
  }
  return who ? format(m.stats.leakLimitedNamed, { who }) : m.stats.leakOther;
}

function mixCopy(mix: ProseStats["mix"], m: Messages): string {
  return m.stats.mix[mix];
}

function profileCopy(stats: ProseStats, m: Messages): string {
  if (stats.profile.id === "short") return mixCopy(stats.mix, m);
  const profile = m.stats.profiles[stats.profile.id as keyof Messages["stats"]["profiles"]];
  if (!profile) return stats.profile.label;
  return profile.genres ? `${profile.label} · ${profile.genres}` : profile.label;
}

function readout(
  id: GaugeId,
  stats: ProseStats,
  rareCount: number,
  longSentence: number,
  plainVocabulary: boolean,
  m: Messages
): string {
  if (id === "directness") {
    const passivesPerThousand = stats.words ? (stats.passiveCount / stats.words) * 1000 : 0;
    return format(m.stats.directnessReadout, {
      adverbs: fmt(stats.adverbPerThousand),
      passives: fmt(passivesPerThousand)
    });
  }
  if (id === "pacing") {
    const span =
      stats.sentenceMin === stats.sentenceMax
        ? format(m.stats.pacingSpanSame, { count: stats.sentenceMin })
        : format(m.stats.pacingSpanRange, { min: stats.sentenceMin, max: stats.sentenceMax });
    return format(m.stats.pacingReadout, {
      mix: mixCopy(stats.mix, m),
      mean: fmt(stats.meanSentence),
      span,
      n: longSentence
    });
  }
  const share = stats.words ? Math.round((rareCount / stats.words) * 100) : 0;
  return format(plainVocabulary ? m.stats.vocabularyReadoutKid : m.stats.vocabularyReadout, {
    share,
    ttr: stats.typeTokenRatio.toFixed(2)
  });
}

export function ProseStatsCard({
  text,
  names,
  craft,
  cast = [],
  readerAge,
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
  readerAge?: number;
  highlighting: boolean;
  onHighlight: () => void;
  onSuggestSplit: (sentence: string, signal: AbortSignal) => Promise<string>;
  onSuggestBreak: (paragraph: string, signal: AbortSignal) => Promise<string>;
  onApplySplit: (sentence: string, split: string) => boolean;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const tuning = useMemo(() => readerTuning(readerAge), [readerAge]);
  const stats = useMemo(
    () => analyzeProse(text, entityNameTokens(names), { longSentence: tuning.longSentence }),
    [names, text, tuning.longSentence]
  );
  const rare = useMemo(
    () => tallyRareWords(text, names, tuning.extraSyllables !== undefined ? { extraSyllables: tuning.extraSyllables } : undefined),
    [names, text, tuning.extraSyllables]
  );
  const echoes = useMemo(() => flagEchoes(text, names), [names, text]);
  const leaks = useMemo(() => flagPovLeaks(text, craft, cast), [cast, craft, text]);
  const gauges = useMemo(
    () => ({
      directness: scoreDirectness(stats, tuning.directnessWeight),
      pacing: scorePacing(stats, tuning.longSentence, tuning.longRun),
      vocabulary: scoreVocabulary(stats, rare.count, tuning.rarePeak, tuning.plainScore)
    }),
    [rare.count, stats, tuning]
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
          <p className="chapter-craft-label">{m.stats.label}</p>
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.close}
          </button>
        </div>
        <h2 id="stats-title">{stats.words > 0 ? m.stats.title : m.stats.emptyTitle}</h2>

        {stats.sentenceLengths.length > 0 ? (
          <SentenceSparkline stats={stats} selected={selected} onSelect={pickBar} />
        ) : (
          <p className="quiet">{m.stats.writeSome}</p>
        )}

        {sentence ? (
          <div className="stats-sentence">
            <p className="chapter-craft-label">
              {format(m.stats.sentence, {
                n: selected === null ? 0 : selected + 1,
                words: count(sentenceWords, m.stats.wordsShort)
              })}
            </p>
            <blockquote>{sentence}</blockquote>
            {sentenceWords < MIN_SPLIT_WORDS ? (
              <p className="quiet">{m.stats.alreadyShort}</p>
            ) : (
              <div className="stats-sentence-actions">
                <button type="button" onClick={() => void suggestSplit()} disabled={splitBusy}>
                  {splitBusy ? m.stats.looking : m.stats.suggestSplit}
                </button>
              </div>
            )}
            {splitError ? <p className="quiet">{m.stats.noSplit}</p> : null}
            {suggestion ? (
              <>
                <p className="chapter-craft-label">{m.stats.split}</p>
                <textarea
                  className="stats-split"
                  value={suggestion}
                  onChange={(event) => setSuggestion(event.target.value)}
                  rows={3}
                  autoFocus
                  aria-label={m.stats.editSplit}
                />
                <div className="stats-sentence-actions">
                  <button type="button" className="primary" onClick={applySplit} disabled={!suggestion.trim()}>
                    {m.stats.useSplit}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : packedFlag ? (
          <div className="stats-sentence">
            <p className="chapter-craft-label">
              {format(m.stats.paragraph, {
                n: packedFlag.index + 1,
                words: count(packedFlag.words, m.stats.wordsShort)
              })}
            </p>
            <blockquote>{packedFlag.text}</blockquote>
            <p className="quiet">{m.stats.packedHint}</p>
            <div className="stats-sentence-actions">
              <button type="button" onClick={() => void suggestBreak()} disabled={splitBusy}>
                {splitBusy ? m.stats.looking : m.stats.suggestBreak}
              </button>
            </div>
            {splitError ? <p className="quiet">{m.stats.noBreak}</p> : null}
            {suggestion ? (
              <>
                <p className="chapter-craft-label">{m.stats.break}</p>
                <BreakDraft value={suggestion} onChange={setSuggestion} />
                <div className="stats-sentence-actions">
                  <button type="button" className="primary" onClick={applyBreak} disabled={!suggestion.trim()}>
                    {m.stats.useBreak}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : stats.sentenceLengths.length > 0 ? (
          <p className="quiet stats-spark-hint">{m.stats.clickBar}</p>
        ) : null}

        {stats.words > 0 ? (
          <>
            <div className="stats-gauges">
              {GAUGE_ORDER.map((id) => {
                const copy = m.stats.gauges[id];
                const expanded = detail === id;
                return (
                  <div key={id} className={expanded ? "stats-accordion is-open" : "stats-accordion"}>
                    <GaugeRow
                      id={id}
                      label={copy.label}
                      score={gauges[id]}
                      {...(id === "pacing"
                        ? {
                            note: stats.profile.id === "short" ? mixCopy(stats.mix, m) : profileCopy(stats, m)
                          }
                        : {})}
                      expanded={expanded}
                      onToggle={() => toggleDetail(id)}
                    />
                    {expanded ? (
                      <GaugeDetail
                        id={id}
                        detail={copy}
                        stats={stats}
                        rare={rare}
                        longSentence={tuning.longSentence}
                        plainVocabulary={tuning.plainScore >= 85}
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
                <p className="chapter-craft-label">{m.stats.mixedFocus}</p>
                <p className="quiet">
                  {stats.mixedParagraphs.length === 1 ? m.stats.mixedOne : m.stats.mixedMany}
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
                <p className="chapter-craft-label">{m.stats.echo}</p>
                <p className="quiet">{m.stats.echoBody}</p>
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
                <p className="chapter-craft-label">{m.stats.povLeak}</p>
                <p className="quiet">{leakBlurb(craft, m)}</p>
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
              {format(m.stats.foot, {
                words: stats.words,
                sentences: stats.sentences,
                spoken: Math.round(stats.dialogueShare * 100)
              })}
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
                {highlighting ? m.stats.keepHighlight : m.stats.highlight}
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
  const { messages: m } = useLocale();
  return (
    <button
      type="button"
      className="stats-gauge"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={`stats-panel-${id}`}
      aria-label={format(m.stats.gaugeAria, {
        label,
        score: fmtScore(score),
        detail: expanded ? m.stats.hideGauge : m.stats.aboutGauge
      })}
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
  id,
  detail,
  stats,
  rare,
  longSentence,
  plainVocabulary,
  highlighting,
  onHighlight,
  onShowSentence
}: {
  id: GaugeId;
  detail: Messages["stats"]["gauges"][GaugeId];
  stats: ProseStats;
  rare: ReturnType<typeof tallyRareWords>;
  longSentence: number;
  plainVocabulary: boolean;
  highlighting: boolean;
  onHighlight: () => void;
  onShowSentence: (index: number) => void;
}) {
  const { messages: m } = useLocale();
  return (
    <div className="stats-detail" id={`stats-panel-${id}`} role="region" aria-label={detail.label}>
      <section>
        <p className="chapter-craft-label">{m.stats.measures}</p>
        <p>{detail.measures}</p>
      </section>
      <section>
        <p className="chapter-craft-label">{m.stats.raise}</p>
        <ul>
          {detail.raise.map((item) => (
            <li key={item}>{format(item, { n: longSentence })}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className="chapter-craft-label">{m.stats.remember}</p>
        <p>{detail.remember}</p>
      </section>
      <p className="quiet">{readout(id, stats, rare.count, longSentence, plainVocabulary, m)}</p>
      {id === "pacing" && stats.longSentences.length > 0 ? (
        <div className="stats-long">
          <p className="chapter-craft-label">{format(m.stats.longSentences, { n: longSentence })}</p>
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
      {id === "vocabulary" && rare.unique.length > 0 ? (
        <div className="stats-rare">
          <p className="chapter-craft-label">{m.stats.rareList}</p>
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
              {highlighting ? m.stats.keepHighlight : m.stats.highlight}
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
  const { messages: m } = useLocale();
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
          title={format(m.stats.sparkTitle, { count: length })}
          aria-label={format(m.stats.sparkAria, { n: index + 1, count: length })}
          aria-pressed={selected === index}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}

const LONG_BAR = 30;

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
  const { messages: m } = useLocale();

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
      aria-label={m.stats.editBreak}
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
