import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BIBLE_KIND_DEFAULT_PREDICATE,
  BIBLE_KINDS,
  classifyEntity,
  entityMatchesQuery,
  groupBibleEntities,
  groupFacts,
  setEntityKind,
  type BibleEntityGroup,
  type BibleKind
} from "@core/bibleGroups";
import { activeFacts, type NarrativeFact } from "@core/NarrativeFact";
import { chainsWithHistory, factHistoryForEntity, factsAsOfSequence, type FactHistoryChain } from "@core/bibleHistory";
import { mentionsForEntity, type MentionHit } from "@core/bibleMentions";
import { CORE_PREDICATES, type CorePredicate } from "@core/predicates";
import { normalizeValue, slugify } from "@core/ids";
import {
  CHARACTER_PRONOUNS,
  formatTagList,
  parseTagList,
  profileFor,
  upsertCharacterProfile,
  type CharacterProfile,
  type CharacterProfileInput
} from "@core/characterProfile";
import {
  addEntityPicture,
  MAX_ENTITY_PICTURES,
  picturesFor,
  removeEntityPicture,
  type EntityMedia,
  type EntityPicture
} from "@core/entityMedia";
import { sortedChapters, touch, type Chapter } from "@core/BookSchema";
import { manuscriptNameHits, renameEntityLabel, replaceNameInManuscript } from "@core/renameEntity";
import { deleteEntity } from "@core/deleteEntity";
import { storyTimeRankByChapterId } from "@core/timeline";
import { entityIsHidden, nextPositionOverride, setFactHidden, setFactPositionOverride, toggleHiddenEntity } from "@core/visibility";
import { count, format, useLocale } from "./i18n";
import { picturesFromFile, EntityImageError } from "./entityImage";
import { downloadJson } from "./downloadJson";
import { useBookStore } from "./useBookStore";
import { exportSandboxCards, sandboxCardCount, sandboxExportFilename } from "@core/sandboxExport";
import { LoreImportCard } from "./LoreImportCard";

type Overlay =
  | { type: "review" }
  | { type: "entity"; ref: string }
  | { type: "asOfEntity"; ref: string }
  | { type: "new"; kind: BibleKind }
  | { type: "importLore" };

function chapterLabel(chapterId: string | undefined, chapters: Chapter[], untitled: string): string {
  const chapter = chapterId ? chapters.find((item) => item.id === chapterId) : undefined;
  if (!chapter) return "—";
  return `${chapter.sequence_index + 1} · ${chapter.title.trim() || untitled}`;
}

export function BiblePanel({
  onOpenGuide,
  onInterview,
  openEntitySignal
}: {
  onOpenGuide?: () => void;
  onInterview?: (entityRef: string, entityLabel: string) => void;
  /** A fresh object each time, so opening the same entity twice in a row still re-opens the card. */
  openEntitySignal?: { ref: string } | null;
}) {
  const { book, busy, approve, reject, addFact, reviseFact, patchBook, setChapterId, importLoreArticle } = useBookStore();
  const { messages: m } = useLocale();
  const [kind, setKind] = useState<BibleKind>("characters");
  const [query, setQuery] = useState("");
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [asOfChapterId, setAsOfChapterId] = useState<string | null>(null);
  const pendingSeen = useRef(0);

  useEffect(() => {
    if (openEntitySignal) setOverlay({ type: "entity", ref: openEntitySignal.ref });
  }, [openEntitySignal]);

  const sections = useMemo(() => (book ? groupBibleEntities(book.facts, book.entity_kinds) : []), [book]);
  const liveChapters = useMemo(() => (book ? sortedChapters(book) : []), [book]);
  const asOfChapter = asOfChapterId ? liveChapters.find((item) => item.id === asOfChapterId) : undefined;
  const storyTimeRanks = useMemo(() => (book ? storyTimeRankByChapterId(book) : new Map<string, number>()), [book]);
  const displaySections = useMemo(() => {
    const asOfRank = asOfChapter ? storyTimeRanks.get(asOfChapter.id) : undefined;
    return book && asOfChapter && asOfRank !== undefined
      ? groupFacts(factsAsOfSequence(book.facts, storyTimeRanks, asOfRank), book.entity_kinds)
      : sections;
  }, [book, asOfChapter, storyTimeRanks, sections]);
  const pending = book ? activeFacts(book.facts).filter((fact) => fact.status !== "locked") : [];
  const flagged = pending.some((fact) => fact.status === "flagged" && !fact.is_merge_suggestion);
  const canExportCards = sections.some(
    (section) =>
      (section.kind === "characters" || section.kind === "locations" || section.kind === "objects") &&
      section.entities.length > 0
  );

  useEffect(() => {
    if (pending.length > pendingSeen.current) setOverlay({ type: "review" });
    pendingSeen.current = pending.length;
  }, [pending.length]);

  useEffect(() => {
    if (overlay?.type === "review" && pending.length === 0) setOverlay(null);
  }, [overlay, pending.length]);

  const searching = query.trim().length > 0;
  const visibleSections = useMemo(() => {
    const filtered = displaySections
      .map((section) => ({
        ...section,
        entities: section.entities.filter((entity) =>
          entityMatchesQuery(entity, query, profileFor(book?.profiles ?? [], entity.entity_ref))
        )
      }))
      .filter((section) => section.entities.length > 0);
    if (searching) return filtered;
    return filtered.filter((section) => section.kind === kind);
  }, [book?.profiles, kind, query, searching, displaySections]);
  const openSection =
    overlay?.type === "entity" ? sections.find((section) => section.entities.some((entity) => entity.entity_ref === overlay.ref)) : undefined;
  const openEntity = openSection?.entities.find((entity) => overlay?.type === "entity" && entity.entity_ref === overlay.ref);
  const openAsOfEntity =
    overlay?.type === "asOfEntity"
      ? displaySections.flatMap((section) => section.entities).find((entity) => entity.entity_ref === overlay.ref)
      : undefined;

  if (!book) return null;

  return (
    <aside className="rail rail-right">
      <div className="rail-head">
        <span className="rail-head-title">
          <h2>{m.bible.title}</h2>
          {onOpenGuide ? (
            <button
              type="button"
              className="guide-help-button"
              aria-label={format(m.guide.helpFor, { topic: m.bible.title })}
              title={format(m.guide.helpFor, { topic: m.bible.title })}
              onClick={onOpenGuide}
            >
              ?
            </button>
          ) : null}
        </span>
        <div className="bible-head-tools">
          {asOfChapter ? null : pending.length > 0 ? (
            <button
              type="button"
              className={flagged ? "text-button bible-review-btn is-flagged" : "text-button bible-review-btn"}
              onClick={() => setOverlay({ type: "review" })}
            >
              {format(m.bible.reviewCount, { count: pending.length })}
            </button>
          ) : (
            <span className="quiet">
              {format(m.bible.lockedCount, {
                count: book.facts.filter((fact) => fact.status === "locked" && fact.superseded_by === undefined).length
              })}
            </span>
          )}
          {asOfChapter ? null : (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                const payload = exportSandboxCards(book);
                if (sandboxCardCount(payload) === 0) return;
                downloadJson(sandboxExportFilename(book), payload);
              }}
              disabled={!canExportCards}
              title={m.bible.exportCardsTitle}
            >
              {m.bible.exportCards}
            </button>
          )}
          {asOfChapter ? null : (
            <button type="button" className="text-button" onClick={() => setOverlay({ type: "importLore" })}>
              {m.bible.importLoreNav}
            </button>
          )}
        </div>
      </div>

      <label className="bible-asof">
        <span>{m.bible.asOfLabel}</span>
        <select
          value={asOfChapterId ?? ""}
          onChange={(event) => setAsOfChapterId(event.target.value === "" ? null : event.target.value)}
          aria-label={m.bible.asOfLabel}
        >
          <option value="">{m.bible.asOfNow}</option>
          {liveChapters.map((item) => (
            <option key={item.id} value={item.id}>
              {chapterLabel(item.id, liveChapters, m.editor.untitled)}
            </option>
          ))}
        </select>
      </label>
      {asOfChapter ? (
        <p className="banner bible-asof-banner" role="status">
          {format(m.bible.asOfBanner, { chapter: chapterLabel(asOfChapter.id, liveChapters, m.editor.untitled) })}
          <button type="button" className="text-button" onClick={() => setAsOfChapterId(null)}>
            {m.bible.asOfBack}
          </button>
        </p>
      ) : null}

      <label className="bible-search">
        <span className="visually-hidden">{m.bible.search}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={m.bible.searchPlaceholder}
          aria-label={m.bible.search}
        />
      </label>

      <div className="bible-tabs" role="tablist" aria-label={m.bible.shelves}>
        {BIBLE_KINDS.map((item) => {
          const count = displaySections.find((section) => section.kind === item)?.entities.length ?? 0;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={!searching && kind === item}
              className={!searching && kind === item ? "bible-tab is-active" : "bible-tab"}
              onClick={() => {
                setKind(item);
                setQuery("");
              }}
            >
              {m.bible.kinds[item]}
              {count ? <span className="bible-tab-count">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <section className="bible-roster">
        {visibleSections.length === 0 ? (
          <p className="quiet">
            {searching ? m.bible.nothingMatches : m.bible.empty[kind]}
          </p>
        ) : searching ? (
          visibleSections.map((section) => (
            <div key={section.kind} className="bible-kind">
              <h3>{m.bible.kinds[section.kind]}</h3>
              <RosterList
                entities={section.entities}
                thumbs={book.media}
                hiddenEntities={book.hidden_entities}
                onOpen={(ref) => setOverlay(asOfChapter ? { type: "asOfEntity", ref } : { type: "entity", ref })}
              />
            </div>
          ))
        ) : (
          <RosterList
            entities={visibleSections[0]?.entities ?? []}
            thumbs={book.media}
            hiddenEntities={book.hidden_entities}
            onOpen={(ref) => setOverlay(asOfChapter ? { type: "asOfEntity", ref } : { type: "entity", ref })}
          />
        )}
      </section>

      {asOfChapter ? null : (
        <button type="button" className="bible-new" onClick={() => setOverlay({ type: "new", kind })}>
          {m.bible.newLabel[kind]}
        </button>
      )}

      {overlay?.type === "review" ? (
        <ReviewOverlay
          pending={pending}
          against={(id) => book.facts.find((row) => row.id === id)}
          onLock={(id, value) => void approve(id, value)}
          onReject={(id) => void reject(id)}
          onClose={() => setOverlay(null)}
        />
      ) : null}

      {overlay?.type === "entity" && openEntity && openSection ? (
        <EntityOverlay
          entity={openEntity}
          kind={openSection.kind}
          hidden={entityIsHidden(book.hidden_entities, openEntity.entity_ref)}
          profile={profileFor(book.profiles, openEntity.entity_ref)}
          pictures={picturesFor(book.media, openEntity.entity_ref)}
          history={chainsWithHistory(factHistoryForEntity(book.facts, openEntity.entity_ref))}
          mentions={mentionsForEntity(book, openEntity.entity_label)}
          chapters={book.chapters}
          onJumpToChapter={(chapterId) => {
            setChapterId(chapterId);
            setOverlay(null);
          }}
          onAdd={(predicate, value, mode) =>
            void addFact({ label: openEntity.entity_label, predicate, value, ...(mode ? { mode } : {}) })
          }
          onSave={(id, value) => void reviseFact(id, value)}
          onToggleHidden={() =>
            void patchBook((current) =>
              touch(current, { hidden_entities: toggleHiddenEntity(current.hidden_entities, openEntity.entity_ref) })
            )
          }
          onToggleFactHidden={(id, hidden) =>
            void patchBook((current) => touch(current, { facts: setFactHidden(current.facts, id, hidden) }))
          }
          onCycleFactPositionOverride={(id, current) =>
            void patchBook((book) =>
              touch(book, { facts: setFactPositionOverride(book.facts, id, nextPositionOverride(current)) })
            )
          }
          onKind={(kind) =>
            void patchBook((current) =>
              touch(current, {
                entity_kinds: setEntityKind(
                  current.entity_kinds,
                  openEntity.entity_ref,
                  kind,
                  classifyEntity(openEntity.facts)
                )
              })
            )
          }
          onProfile={(next) =>
            void patchBook((current) =>
              touch(current, { profiles: upsertCharacterProfile(current.profiles, { ...next, entity_ref: openEntity.entity_ref }) })
            )
          }
          onAddPicture={async (file) => {
            const picture = await picturesFromFile(file);
            await patchBook((current) => touch(current, { media: addEntityPicture(current.media, openEntity.entity_ref, picture) }));
          }}
          onRemovePicture={(index) =>
            void patchBook((current) => touch(current, { media: removeEntityPicture(current.media, openEntity.entity_ref, index) }))
          }
          onCommitName={(next) => {
            const from = openEntity.entity_label;
            const to = next.trim();
            if (!to || to === from) return null;
            const hits = manuscriptNameHits(book, from);
            void patchBook((current) =>
              touch(current, { facts: renameEntityLabel(current.facts, openEntity.entity_ref, to) })
            );
            return hits > 0 ? { from, to, hits } : null;
          }}
          onReplaceTexts={(from, to) => {
            void patchBook((current) => replaceNameInManuscript(current, from, to));
          }}
          {...(onInterview
            ? { onInterview: () => onInterview(openEntity.entity_ref, openEntity.entity_label) }
            : {})}
          onDelete={() => {
            if (!window.confirm(format(m.bible.deleteConfirm, { name: openEntity.entity_label }))) return;
            void patchBook((current) => deleteEntity(current, openEntity.entity_ref));
            setOverlay(null);
          }}
          onClose={() => setOverlay(null)}
        />
      ) : null}

      {overlay?.type === "asOfEntity" && openAsOfEntity && asOfChapter ? (
        <AsOfEntityOverlay
          entity={openAsOfEntity}
          chapterLabel={chapterLabel(asOfChapter.id, liveChapters, m.editor.untitled)}
          onClose={() => setOverlay(null)}
        />
      ) : null}

      {overlay?.type === "new" ? (
        <NewEntityOverlay
          kind={overlay.kind}
          onCreate={async (label, predicate, value) => {
            await addFact({ label, predicate, value });
            setOverlay({ type: "entity", ref: slugify(label) });
          }}
          onClose={() => setOverlay(null)}
        />
      ) : null}
      {overlay?.type === "importLore" ? (
        <LoreImportCard
          busy={busy === "import-lore"}
          onImport={(title, text) => void importLoreArticle(title, text)}
          onClose={() => setOverlay(null)}
        />
      ) : null}
    </aside>
  );
}

function RosterList({
  entities,
  thumbs,
  hiddenEntities,
  onOpen
}: {
  entities: BibleEntityGroup[];
  thumbs: EntityMedia[];
  hiddenEntities: string[];
  onOpen: (ref: string) => void;
}) {
  const { messages: m } = useLocale();
  return (
    <ul className="bible-names">
      {entities.map((entity) => {
        const thumb = picturesFor(thumbs, entity.entity_ref)[0]?.thumbDataUrl;
        const hidden = entityIsHidden(hiddenEntities, entity.entity_ref);
        return (
          <li key={entity.entity_ref}>
            <button
              type="button"
              className={[thumb ? "bible-name has-thumb" : "bible-name", hidden ? "is-hidden-from-model" : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onOpen(entity.entity_ref)}
            >
              {thumb ? <img className="bible-name-thumb" src={thumb} alt="" /> : null}
              <span>{entity.entity_label}</span>
              {hidden ? <span className="bible-hidden-mark">{m.bible.hidden}</span> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function OverlayCard({
  titleId,
  title,
  onClose,
  onEscape,
  onRename,
  actions,
  className,
  children
}: {
  titleId: string;
  title: string;
  onClose: () => void;
  onEscape?: () => void;
  onRename?: (next: string) => void;
  actions?: React.ReactNode;
  className?: string | undefined;
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState(title);
  const dismiss = onEscape ?? onClose;
  const { messages: m } = useLocale();

  useEffect(() => {
    setDraft(title);
  }, [title]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  function commitName() {
    if (!onRename) return;
    const next = draft.trim();
    if (!next) {
      setDraft(title);
      return;
    }
    if (next !== title) onRename(next);
  }

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={["edit-card bible-card", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="bible-card-head">
          {onRename ? (
            <input
              id={titleId}
              className="bible-card-title"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  (event.target as HTMLInputElement).blur();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  setDraft(title);
                  (event.target as HTMLInputElement).blur();
                }
              }}
              aria-label={m.bible.name}
            />
          ) : (
            <h2 id={titleId}>{title}</h2>
          )}
          <div className="bible-card-head-actions">
            {actions}
            <button type="button" className="text-button" onClick={onClose}>
              {m.bible.close}
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function AsOfEntityOverlay({
  entity,
  chapterLabel: label,
  onClose
}: {
  entity: BibleEntityGroup;
  chapterLabel: string;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  return (
    <OverlayCard titleId={`asof-entity-${entity.entity_ref}`} title={entity.entity_label} onClose={onClose}>
      <p className="quiet">{format(m.bible.asOfEntityLede, { chapter: label })}</p>
      <ul className="bible-card-facts">
        {entity.facts.map((row) => (
          <li key={row.id} className="bible-asof-fact">
            <span className="bible-history-predicate">{m.bible.predicates[row.predicate]}</span>
            <span className="bible-history-value">{row.value}</span>
          </li>
        ))}
      </ul>
    </OverlayCard>
  );
}

function ReviewOverlay({
  pending,
  against,
  onLock,
  onReject,
  onClose
}: {
  pending: NarrativeFact[];
  against: (id: string) => { value: string } | undefined;
  onLock: (id: string, value: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  return (
    <OverlayCard titleId="bible-review-title" title={m.bible.review} onClose={onClose}>
      <p className="quiet">{m.bible.reviewBody}</p>
      <ul className="bible-review-list">
        {pending.map((fact) => {
          const conflict = fact.conflict_with ? against(fact.conflict_with) : undefined;
          return (
            <PendingFact
              key={fact.id}
              fact={fact}
              {...(conflict ? { against: conflict } : {})}
              onLock={(value) => onLock(fact.id, value)}
              onReject={() => onReject(fact.id)}
            />
          );
        })}
      </ul>
    </OverlayCard>
  );
}

function EntityOverlay({
  entity,
  kind,
  hidden,
  profile,
  pictures,
  history,
  mentions,
  chapters,
  onJumpToChapter,
  onAdd,
  onSave,
  onToggleHidden,
  onToggleFactHidden,
  onCycleFactPositionOverride,
  onKind,
  onProfile,
  onAddPicture,
  onRemovePicture,
  onCommitName,
  onReplaceTexts,
  onInterview,
  onDelete,
  onClose
}: {
  entity: BibleEntityGroup;
  kind: BibleKind;
  hidden: boolean;
  profile: CharacterProfile;
  pictures: EntityPicture[];
  history: FactHistoryChain[];
  mentions: MentionHit[];
  chapters: Chapter[];
  onJumpToChapter: (chapterId: string) => void;
  onAdd: (predicate: CorePredicate, value: string, mode?: "replace" | "add") => void;
  onSave: (factId: string, value: string) => void;
  onToggleHidden: () => void;
  onToggleFactHidden: (factId: string, hidden: boolean) => void;
  onCycleFactPositionOverride: (factId: string, current: "include" | "exclude" | undefined) => void;
  onKind: (kind: BibleKind) => void;
  onProfile: (next: CharacterProfileInput) => void;
  onAddPicture: (file: File) => Promise<void>;
  onRemovePicture: (index: number) => void;
  onCommitName: (next: string) => { from: string; to: string; hits: number } | null;
  onReplaceTexts: (from: string, to: string) => void;
  onInterview?: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [predicate, setPredicate] = useState<CorePredicate>(entity.facts[0]?.predicate ?? "core.identity");
  const [value, setValue] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [nameOffer, setNameOffer] = useState<{ from: string; to: string; hits: number } | null>(null);
  const [addChoice, setAddChoice] = useState<{ predicate: CorePredicate; value: string; existingValue: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { messages: m } = useLocale();

  return (
    <>
    <OverlayCard
      titleId="bible-entity-title"
      title={entity.entity_label}
      onClose={() => {
        setNameOffer(null);
        onClose();
      }}
      onEscape={() => {
        if (nameOffer) setNameOffer(null);
        else onClose();
      }}
      onRename={(next) => {
        const offer = onCommitName(next);
        if (offer) setNameOffer(offer);
      }}
      className={kind === "characters" ? "is-character" : undefined}
      actions={
        <>
          {kind === "characters" && onInterview ? (
            <button type="button" className="text-button" onClick={onInterview}>
              {m.bible.interview}
            </button>
          ) : null}
          <button
            type="button"
            className={hidden ? "text-button bible-vis is-hidden" : "text-button bible-vis"}
            aria-pressed={hidden}
            onClick={onToggleHidden}
          >
            {hidden ? m.bible.showToDraft : m.bible.hideFromDraft}
          </button>
          <button type="button" className="text-button danger" onClick={onDelete}>
            {m.bible.deleteEntity}
          </button>
        </>
      }
    >
      {hidden ? <p className="quiet bible-hidden-note">{m.bible.hiddenNote}</p> : null}
      <label className="bible-field bible-field-row bible-kind-field">
        <span className="bible-field-label">{m.bible.thisIsA}</span>
        <select value={kind} onChange={(event) => onKind(event.target.value as BibleKind)} aria-label={m.bible.thisIsA}>
          {BIBLE_KINDS.map((item) => (
            <option key={item} value={item}>
              {m.bible.singular[item]}
            </option>
          ))}
        </select>
      </label>
      <section className="bible-pictures">
        <div className="bible-pictures-head">
          <h3 className="bible-field-label">
            {m.bible.pictures} <span className="bible-field-aside">{m.bible.picturesAside}</span>
          </h3>
        </div>
        <ul className="bible-picture-list">
          {pictures.map((picture, index) => (
            <li key={`${picture.thumbDataUrl.slice(0, 48)}-${index}`}>
              <img src={picture.thumbDataUrl} alt="" />
              <button
                type="button"
                className="bible-picture-remove"
                aria-label={format(m.bible.removePicture, { n: index + 1 })}
                onClick={() => onRemovePicture(index)}
              >
                ×
              </button>
            </li>
          ))}
          {pictures.length < MAX_ENTITY_PICTURES ? (
            <li>
              <button
                type="button"
                className="bible-picture-add"
                aria-label={imageBusy ? m.bible.addingImage : m.bible.addImage}
                disabled={imageBusy}
                onClick={() => fileRef.current?.click()}
              >
                {imageBusy ? "…" : "+"}
              </button>
            </li>
          ) : null}
        </ul>
        <input
          ref={fileRef}
          className="visually-hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setImageError(null);
            setImageBusy(true);
            void onAddPicture(file)
              .catch((err) => {
                setImageError(
                  err instanceof EntityImageError
                    ? err.code === "choose"
                      ? m.errors.imageChoose
                      : m.errors.imageRead
                    : m.errors.imageAdd
                );
              })
              .finally(() => setImageBusy(false));
          }}
        />
        {imageError ? <p className="conflict-note">{imageError}</p> : null}
      </section>
      {kind === "characters" ? <CharacterFields profile={profile} onChange={onProfile} /> : null}
      <ul className="bible-card-facts">
        {entity.facts.map((row) => (
          <LockedFact
            key={row.id}
            fact={row}
            onSave={(next) => onSave(row.id, next)}
            onToggleHidden={() => onToggleFactHidden(row.id, row.hidden_from_ai !== true)}
            onCyclePositionOverride={() => onCycleFactPositionOverride(row.id, row.position_override)}
          />
        ))}
      </ul>
      {history.length > 0 ? (
        <section className="bible-history">
          <h3 className="bible-field-label">{m.bible.history}</h3>
          <ul className="bible-history-list">
            {history.map((chain) => (
              <li key={`${chain.predicate}-${chain.entries[0]!.id}`} className="bible-history-chain">
                <span className="bible-history-predicate">{m.bible.predicates[chain.predicate]}</span>
                <ol>
                  {chain.entries.map((fact, index) => (
                    <li key={fact.id}>
                      <span className="bible-history-chapter">{chapterLabel(fact.chapter_id, chapters, m.editor.untitled)}</span>
                      <span className="bible-history-value">{fact.value}</span>
                      {index === chain.entries.length - 1 ? (
                        <span className="bible-history-current">{m.bible.historyCurrent}</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {mentions.length > 0 ? (
        <section className="bible-mentions">
          <h3 className="bible-field-label">
            {m.bible.mentions} <span className="bible-field-aside">{m.bible.mentionsAside}</span>
          </h3>
          <ul className="bible-mentions-list">
            {mentions.map((mention) => (
              <li key={mention.chapterId} className="bible-mention-chapter">
                <button type="button" className="bible-mention-jump" onClick={() => onJumpToChapter(mention.chapterId)}>
                  {chapterLabel(mention.chapterId, chapters, m.editor.untitled)}
                  <span className="bible-mention-count">{mention.count}</span>
                </button>
                {mention.snippets.map((snippet, index) => (
                  <p key={index} className="bible-mention-snippet">
                    {snippet}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <form
        className="add-fact bible-card-add"
        action="#"
        onSubmit={(event) => {
          event.preventDefault();
          const next = value.trim();
          if (!next) return;
          const existing = entity.facts.find(
            (fact) => fact.predicate === predicate && normalizeValue(fact.value) !== normalizeValue(next)
          );
          if (existing) {
            setAddChoice({ predicate, value: next, existingValue: existing.value });
            return;
          }
          onAdd(predicate, next);
          setValue("");
        }}
      >
        <h3>{m.bible.addFact}</h3>
        <select value={predicate} onChange={(event) => setPredicate(event.target.value as CorePredicate)}>
          {CORE_PREDICATES.map((item) => (
            <option key={item} value={item}>
              {m.bible.predicates[item]}
            </option>
          ))}
        </select>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder={m.bible.claimPlaceholder} rows={1} required />
        <button type="submit" className="primary" disabled={!value.trim()}>
          {m.bible.lockInto}
        </button>
      </form>
    </OverlayCard>
    {nameOffer ? (
      <div
        className="edit-overlay"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setNameOffer(null);
        }}
      >
        <div className="edit-card" role="dialog" aria-modal="true" aria-labelledby="rename-texts-title">
          <h2 id="rename-texts-title">{m.bible.replaceTitle}</h2>
          <p className="quiet">
            {format(m.bible.replaceBody, {
              from: nameOffer.from,
              to: nameOffer.to,
              places: count(nameOffer.hits, m.bible.places)
            })}
          </p>
          <div className="edit-actions">
            <button type="button" className="text-button" onClick={() => setNameOffer(null)}>
              {m.bible.keepTexts}
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => {
                onReplaceTexts(nameOffer.from, nameOffer.to);
                setNameOffer(null);
              }}
            >
              {m.bible.replace}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    {addChoice ? (
      <div
        className="edit-overlay"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAddChoice(null);
        }}
      >
        <div className="edit-card" role="dialog" aria-modal="true" aria-labelledby="add-choice-title">
          <h2 id="add-choice-title">{m.bible.addChoiceTitle}</h2>
          <p className="quiet">
            {format(m.bible.addChoiceBody, {
              predicate: m.bible.predicates[addChoice.predicate],
              existing: addChoice.existingValue
            })}
          </p>
          <div className="edit-actions">
            <button type="button" className="text-button" onClick={() => setAddChoice(null)}>
              {m.common.cancel}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                onAdd(addChoice.predicate, addChoice.value, "add");
                setAddChoice(null);
                setValue("");
              }}
            >
              {m.bible.addChoiceKeepBoth}
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => {
                onAdd(addChoice.predicate, addChoice.value, "replace");
                setAddChoice(null);
                setValue("");
              }}
            >
              {m.bible.addChoiceReplace}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}

function CharacterFields({
  profile,
  onChange
}: {
  profile: CharacterProfile;
  onChange: (next: CharacterProfileInput) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [tagsText, setTagsText] = useState(formatTagList(profile.tags));
  const draftRef = useRef(profile);
  const tagsRef = useRef(tagsText);
  const onChangeRef = useRef(onChange);
  const timerRef = useRef<number>(0);
  const dirtyRef = useRef(false);
  const { messages: m } = useLocale();

  onChangeRef.current = onChange;
  draftRef.current = draft;
  tagsRef.current = tagsText;

  function snapshot(nextDraft = draftRef.current, nextTags = tagsRef.current): CharacterProfileInput {
    return { ...nextDraft, tags: parseTagList(nextTags) };
  }

  function flush() {
    window.clearTimeout(timerRef.current);
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    onChangeRef.current(snapshot());
  }

  function commit(next: CharacterProfile) {
    dirtyRef.current = true;
    draftRef.current = next;
    setDraft(next);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      dirtyRef.current = false;
      onChangeRef.current(snapshot(next));
    }, 160);
  }

  useEffect(() => {
    setDraft(profile);
    setTagsText(formatTagList(profile.tags));
    draftRef.current = profile;
    tagsRef.current = formatTagList(profile.tags);
    return () => {
      window.clearTimeout(timerRef.current);
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      onChangeRef.current(snapshot());
    };
    // Re-bind only when the open card changes. Live book patches must not reset typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.entity_ref]);

  return (
    <div className="bible-card-fields">
      <div className="bible-pronoun-age">
        <div className="bible-field">
          <span className="bible-field-label" id="bible-pronoun-label">
            {m.bible.pronoun}
          </span>
          <div className="bible-pronouns" role="group" aria-labelledby="bible-pronoun-label">
            {CHARACTER_PRONOUNS.map((item) => {
              const on = draft.pronoun === item;
              return (
                <button
                  key={item}
                  type="button"
                  className={on ? "bible-pronoun is-on" : "bible-pronoun"}
                  aria-pressed={on}
                  onClick={() => commit({ ...draft, pronoun: on ? undefined : item })}
                >
                  {m.bible.pronouns[item]}
                </button>
              );
            })}
          </div>
        </div>
        <label className="bible-field bible-age-field">
          <span className="bible-field-label">{m.bible.age}</span>
          <input
            type="number"
            min={1}
            max={130}
            inputMode="numeric"
            value={draft.approximateAge ?? ""}
            placeholder="28"
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === "") {
                const { approximateAge: _dropped, ...rest } = draft;
                void _dropped;
                commit(rest);
                return;
              }
              const n = Number(raw);
              if (!Number.isInteger(n) || n < 1 || n > 130) return;
              commit({ ...draft, approximateAge: n });
            }}
          />
        </label>
      </div>
      <label className="bible-field">
        <span className="bible-field-label">{m.bible.looks}</span>
        <textarea
          className="bible-looks"
          value={draft.looks}
          onChange={(event) => commit({ ...draft, looks: event.target.value })}
          placeholder={m.bible.looksPlaceholder}
          rows={1}
        />
      </label>
      <label className="bible-field">
        <span className="bible-field-label">
          {m.bible.tags} <span className="bible-field-aside">{m.bible.tagsAside}</span>
        </span>
        <input
          value={tagsText}
          onChange={(event) => {
            dirtyRef.current = true;
            const nextTags = event.target.value;
            tagsRef.current = nextTags;
            setTagsText(nextTags);
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
              dirtyRef.current = false;
              onChangeRef.current(snapshot(draftRef.current, nextTags));
            }, 160);
          }}
          onBlur={flush}
          placeholder={m.bible.tagsPlaceholder}
        />
      </label>
      <label className="bible-field">
        <span className="bible-field-label">{m.bible.personality}</span>
        <textarea
          className="bible-personality"
          value={draft.personality}
          onChange={(event) => commit({ ...draft, personality: event.target.value })}
          placeholder={m.bible.personalityPlaceholder}
          rows={1}
        />
      </label>
    </div>
  );
}

function NewEntityOverlay({
  kind,
  onCreate,
  onClose
}: {
  kind: BibleKind;
  onCreate: (label: string, predicate: CorePredicate, value: string) => Promise<void>;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [predicate, setPredicate] = useState<CorePredicate>(BIBLE_KIND_DEFAULT_PREDICATE[kind]);
  const [value, setValue] = useState("");
  const { messages: m } = useLocale();

  return (
    <OverlayCard titleId="bible-new-title" title={m.bible.newLabel[kind]} onClose={onClose}>
      <form
        className="add-fact bible-card-add"
        action="#"
        onSubmit={(event) => {
          event.preventDefault();
          const nextLabel = label.trim();
          const nextValue = value.trim();
          if (!nextLabel || !nextValue) return;
          void onCreate(nextLabel, predicate, nextValue);
        }}
      >
        <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={m.bible.namePlaceholder} required autoFocus />
        <select value={predicate} onChange={(event) => setPredicate(event.target.value as CorePredicate)}>
          {CORE_PREDICATES.map((item) => (
            <option key={item} value={item}>
              {m.bible.predicates[item]}
            </option>
          ))}
        </select>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder={m.bible.claimPlaceholder} rows={1} required />
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            {m.common.cancel}
          </button>
          <button type="submit" className="primary" disabled={!label.trim() || !value.trim()}>
            {m.bible.lockInto}
          </button>
        </div>
      </form>
    </OverlayCard>
  );
}

function PendingFact({
  fact,
  against,
  onLock,
  onReject
}: {
  fact: {
    id: string;
    entity_label: string;
    predicate: CorePredicate;
    value: string;
    status: string;
    is_merge_suggestion?: boolean | undefined;
  };
  against?: { value: string };
  onLock: (value: string) => void;
  onReject: () => void;
}) {
  const [draft, setDraft] = useState(fact.value);
  const { messages: m } = useLocale();
  const isMergeSuggestion = fact.is_merge_suggestion === true;
  const rowClass =
    fact.status !== "flagged" ? "proposal" : isMergeSuggestion ? "proposal is-merge-suggestion" : "proposal is-flagged";
  return (
    <li className={rowClass}>
      <p>
        <strong>{fact.entity_label}</strong>
        <span className="quiet"> {m.bible.predicates[fact.predicate]}</span>
      </p>
      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} aria-label={m.bible.factText} />
      {against ? (
        <p className={isMergeSuggestion ? "merge-note" : "conflict-note"}>
          {format(isMergeSuggestion ? m.bible.similarTo : m.bible.conflictsWith, { value: against.value })}
        </p>
      ) : null}
      <div className="proposal-actions">
        <button type="button" className="primary" onClick={() => onLock(draft)} disabled={!draft.trim()}>
          {isMergeSuggestion ? m.bible.merge : m.bible.lock}
        </button>
        <button type="button" className="text-button" onClick={onReject}>
          {m.bible.reject}
        </button>
      </div>
    </li>
  );
}

function LockedFact({
  fact,
  onSave,
  onToggleHidden,
  onCyclePositionOverride
}: {
  fact: {
    id: string;
    predicate: CorePredicate;
    value: string;
    hidden_from_ai?: boolean | undefined;
    position_override?: "include" | "exclude" | undefined;
  };
  onSave: (value: string) => void;
  onToggleHidden: () => void;
  onCyclePositionOverride: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fact.value);
  const hidden = fact.hidden_from_ai === true;
  const { messages: m } = useLocale();
  const override = fact.position_override;
  const overrideLabel =
    override === "include" ? m.bible.positionOverrideInclude : override === "exclude" ? m.bible.positionOverrideExclude : m.bible.positionOverrideAuto;
  const overrideAriaLabel =
    override === "include"
      ? m.bible.positionOverrideToExclude
      : override === "exclude"
        ? m.bible.positionOverrideToAuto
        : m.bible.positionOverrideToInclude;

  function save() {
    if (!draft.trim()) return;
    onSave(draft);
    setEditing(false);
  }

  if (!editing) {
    return (
      <li className={hidden ? "locked-fact is-hidden-from-model" : "locked-fact"}>
        <span className="pred">{m.bible.predicates[fact.predicate]}</span>
        {fact.value}
        <div className="fact-actions">
          <button
            type="button"
            className={override ? "text-button bible-position is-set" : "text-button bible-position"}
            aria-label={overrideAriaLabel}
            title={overrideAriaLabel}
            onClick={onCyclePositionOverride}
          >
            {overrideLabel}
          </button>
          <button
            type="button"
            className={hidden ? "text-button bible-vis is-hidden" : "text-button bible-vis"}
            aria-pressed={hidden}
            aria-label={hidden ? m.bible.showClaim : m.bible.hideClaim}
            onClick={onToggleHidden}
          >
            {hidden ? m.bible.show : m.bible.hide}
          </button>
          <button type="button" className="text-button fact-edit-btn" onClick={() => setEditing(true)}>
            {m.bible.edit}
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="locked-fact is-editing">
      <span className="pred">{m.bible.predicates[fact.predicate]}</span>
      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} aria-label={m.bible.editFact} />
      <div className="proposal-actions">
        <button type="button" className="primary" onClick={save} disabled={!draft.trim()}>
          {m.bible.save}
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setDraft(fact.value);
            setEditing(false);
          }}
        >
          {m.common.cancel}
        </button>
      </div>
    </li>
  );
}
