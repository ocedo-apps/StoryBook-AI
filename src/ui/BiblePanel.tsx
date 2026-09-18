import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BIBLE_KIND_DEFAULT_PREDICATE,
  BIBLE_KIND_LABELS,
  BIBLE_KIND_NEW_LABEL,
  BIBLE_KIND_SINGULAR,
  BIBLE_KINDS,
  classifyEntity,
  entityMatchesQuery,
  groupBibleEntities,
  setEntityKind,
  type BibleEntityGroup,
  type BibleKind
} from "@core/bibleGroups";
import { activeFacts, type NarrativeFact } from "@core/NarrativeFact";
import { CORE_PREDICATES, PREDICATE_LABELS, type CorePredicate } from "@core/predicates";
import { slugify } from "@core/ids";
import {
  CHARACTER_PRONOUNS,
  PRONOUN_LABELS,
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
import { touch } from "@core/BookSchema";
import { manuscriptNameHits, renameEntityLabel, replaceNameInManuscript } from "@core/renameEntity";
import { entityIsHidden, setFactHidden, toggleHiddenEntity } from "@core/visibility";
import { picturesFromFile } from "./entityImage";
import { downloadJson } from "./downloadJson";
import { useBookStore } from "./useBookStore";
import { exportSandboxCards, sandboxCardCount, sandboxExportFilename } from "@core/sandboxExport";

type Overlay =
  | { type: "review" }
  | { type: "entity"; ref: string }
  | { type: "new"; kind: BibleKind };

export function BiblePanel() {
  const { book, approve, reject, addFact, reviseFact, patchBook } = useBookStore();
  const [kind, setKind] = useState<BibleKind>("characters");
  const [query, setQuery] = useState("");
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const pendingSeen = useRef(0);

  const sections = useMemo(() => (book ? groupBibleEntities(book.facts, book.entity_kinds) : []), [book]);
  const pending = book ? activeFacts(book.facts).filter((fact) => fact.status !== "locked") : [];
  const flagged = pending.some((fact) => fact.status === "flagged");
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
    const filtered = sections
      .map((section) => ({
        ...section,
        entities: section.entities.filter((entity) =>
          entityMatchesQuery(entity, query, profileFor(book?.profiles ?? [], entity.entity_ref))
        )
      }))
      .filter((section) => section.entities.length > 0);
    if (searching) return filtered;
    return filtered.filter((section) => section.kind === kind);
  }, [book?.profiles, kind, query, searching, sections]);
  const openSection =
    overlay?.type === "entity" ? sections.find((section) => section.entities.some((entity) => entity.entity_ref === overlay.ref)) : undefined;
  const openEntity = openSection?.entities.find((entity) => overlay?.type === "entity" && entity.entity_ref === overlay.ref);

  if (!book) return null;

  return (
    <aside className="rail rail-right">
      <div className="rail-head">
        <h2>Story Bible</h2>
        <div className="bible-head-tools">
          {pending.length > 0 ? (
            <button
              type="button"
              className={flagged ? "text-button bible-review-btn is-flagged" : "text-button bible-review-btn"}
              onClick={() => setOverlay({ type: "review" })}
            >
              Review · {pending.length}
            </button>
          ) : (
            <span className="quiet">
              {book.facts.filter((fact) => fact.status === "locked" && fact.superseded_by === undefined).length} locked
            </span>
          )}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              const payload = exportSandboxCards(book);
              if (sandboxCardCount(payload) === 0) return;
              downloadJson(sandboxExportFilename(book), payload);
            }}
            disabled={!canExportCards}
            title="Download characters, places, and objects for Sandbox"
          >
            Export cards
          </button>
        </div>
      </div>

      <label className="bible-search">
        <span className="visually-hidden">Search Story Bible</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a name or claim"
          aria-label="Search Story Bible"
        />
      </label>

      <div className="bible-tabs" role="tablist" aria-label="Story Bible shelves">
        {BIBLE_KINDS.map((item) => {
          const count = sections.find((section) => section.kind === item)?.entities.length ?? 0;
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
              {BIBLE_KIND_LABELS[item]}
              {count ? <span className="bible-tab-count">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <section className="bible-roster">
        {visibleSections.length === 0 ? (
          <p className="quiet">
            {searching ? "Nothing matches." : `No ${BIBLE_KIND_LABELS[kind].toLowerCase()} yet.`}
          </p>
        ) : searching ? (
          visibleSections.map((section) => (
            <div key={section.kind} className="bible-kind">
              <h3>{section.label}</h3>
              <RosterList
                entities={section.entities}
                thumbs={book.media}
                hiddenEntities={book.hidden_entities}
                onOpen={(ref) => setOverlay({ type: "entity", ref })}
              />
            </div>
          ))
        ) : (
          <RosterList
            entities={visibleSections[0]?.entities ?? []}
            thumbs={book.media}
            hiddenEntities={book.hidden_entities}
            onOpen={(ref) => setOverlay({ type: "entity", ref })}
          />
        )}
      </section>

      <button type="button" className="bible-new" onClick={() => setOverlay({ type: "new", kind })}>
        {BIBLE_KIND_NEW_LABEL[kind]}
      </button>

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
          onAdd={(predicate, value) => void addFact({ label: openEntity.entity_label, predicate, value })}
          onSave={(id, value) => void reviseFact(id, value)}
          onToggleHidden={() =>
            void patchBook((current) =>
              touch(current, { hidden_entities: toggleHiddenEntity(current.hidden_entities, openEntity.entity_ref) })
            )
          }
          onToggleFactHidden={(id, hidden) =>
            void patchBook((current) => touch(current, { facts: setFactHidden(current.facts, id, hidden) }))
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
              {hidden ? <span className="bible-hidden-mark">Hidden</span> : null}
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
              aria-label="Name"
            />
          ) : (
            <h2 id={titleId}>{title}</h2>
          )}
          <div className="bible-card-head-actions">
            {actions}
            <button type="button" className="text-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
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
  return (
    <OverlayCard titleId="bible-review-title" title="Review" onClose={onClose}>
      <p className="quiet">Proposed Story Bible rows. Thicken them, then lock — or reject.</p>
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
  onAdd,
  onSave,
  onToggleHidden,
  onToggleFactHidden,
  onKind,
  onProfile,
  onAddPicture,
  onRemovePicture,
  onCommitName,
  onReplaceTexts,
  onClose
}: {
  entity: BibleEntityGroup;
  kind: BibleKind;
  hidden: boolean;
  profile: CharacterProfile;
  pictures: EntityPicture[];
  onAdd: (predicate: CorePredicate, value: string) => void;
  onSave: (factId: string, value: string) => void;
  onToggleHidden: () => void;
  onToggleFactHidden: (factId: string, hidden: boolean) => void;
  onKind: (kind: BibleKind) => void;
  onProfile: (next: CharacterProfileInput) => void;
  onAddPicture: (file: File) => Promise<void>;
  onRemovePicture: (index: number) => void;
  onCommitName: (next: string) => { from: string; to: string; hits: number } | null;
  onReplaceTexts: (from: string, to: string) => void;
  onClose: () => void;
}) {
  const [predicate, setPredicate] = useState<CorePredicate>(entity.facts[0]?.predicate ?? "core.identity");
  const [value, setValue] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [nameOffer, setNameOffer] = useState<{ from: string; to: string; hits: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
        <button
          type="button"
          className={hidden ? "text-button bible-vis is-hidden" : "text-button bible-vis"}
          aria-pressed={hidden}
          onClick={onToggleHidden}
        >
          {hidden ? "Show to Draft" : "Hide from Draft"}
        </button>
      }
    >
      {hidden ? <p className="quiet bible-hidden-note">The model cannot see this card until you show it again.</p> : null}
      <label className="bible-field bible-field-row bible-kind-field">
        <span className="bible-field-label">This is a</span>
        <select value={kind} onChange={(event) => onKind(event.target.value as BibleKind)} aria-label="This is a">
          {BIBLE_KINDS.map((item) => (
            <option key={item} value={item}>
              {BIBLE_KIND_SINGULAR[item]}
            </option>
          ))}
        </select>
      </label>
      <section className="bible-pictures">
        <div className="bible-pictures-head">
          <h3 className="bible-field-label">
            Pictures <span className="bible-field-aside">(For later export. Draft never sees these.)</span>
          </h3>
        </div>
        <ul className="bible-picture-list">
          {pictures.map((picture, index) => (
            <li key={`${picture.thumbDataUrl.slice(0, 48)}-${index}`}>
              <img src={picture.thumbDataUrl} alt="" />
              <button
                type="button"
                className="bible-picture-remove"
                aria-label={`Remove picture ${index + 1}`}
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
                aria-label={imageBusy ? "Adding image" : "Add image"}
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
                setImageError(err instanceof Error ? err.message : "Could not add that image.");
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
          />
        ))}
      </ul>
      <form
        className="add-fact bible-card-add"
        action="#"
        onSubmit={(event) => {
          event.preventDefault();
          const next = value.trim();
          if (!next) return;
          onAdd(predicate, next);
          setValue("");
        }}
      >
        <h3>Add fact</h3>
        <select value={predicate} onChange={(event) => setPredicate(event.target.value as CorePredicate)}>
          {CORE_PREDICATES.map((item) => (
            <option key={item} value={item}>
              {PREDICATE_LABELS[item]}
            </option>
          ))}
        </select>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="The claim, in one line" rows={1} required />
        <button type="submit" className="primary" disabled={!value.trim()}>
          Lock into Story Bible
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
          <h2 id="rename-texts-title">Replace in manuscript?</h2>
          <p className="quiet">
            Replace “{nameOffer.from}” with “{nameOffer.to}” in {nameOffer.hits}{" "}
            {nameOffer.hits === 1 ? "place" : "places"}. Brainstorm is left alone.
          </p>
          <div className="edit-actions">
            <button type="button" className="text-button" onClick={() => setNameOffer(null)}>
              Keep texts
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => {
                onReplaceTexts(nameOffer.from, nameOffer.to);
                setNameOffer(null);
              }}
            >
              Replace
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
            Pronoun
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
                  {PRONOUN_LABELS[item]}
                </button>
              );
            })}
          </div>
        </div>
        <label className="bible-field bible-age-field">
          <span className="bible-field-label">Approximate age</span>
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
        <span className="bible-field-label">Looks</span>
        <textarea
          className="bible-looks"
          value={draft.looks}
          onChange={(event) => commit({ ...draft, looks: event.target.value })}
          placeholder="Body and face. Not clothes."
          rows={1}
        />
      </label>
      <label className="bible-field">
        <span className="bible-field-label">
          Tags <span className="bible-field-aside">(Shelf only. Draft never sees these.)</span>
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
          placeholder="middle-aged, double nature"
        />
      </label>
      <label className="bible-field">
        <span className="bible-field-label">Personality</span>
        <textarea
          className="bible-personality"
          value={draft.personality}
          onChange={(event) => commit({ ...draft, personality: event.target.value })}
          placeholder="How they tend to be"
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

  return (
    <OverlayCard titleId="bible-new-title" title={BIBLE_KIND_NEW_LABEL[kind]} onClose={onClose}>
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
        <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Name" required autoFocus />
        <select value={predicate} onChange={(event) => setPredicate(event.target.value as CorePredicate)}>
          {CORE_PREDICATES.map((item) => (
            <option key={item} value={item}>
              {PREDICATE_LABELS[item]}
            </option>
          ))}
        </select>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="The claim, in one line" rows={1} required />
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={!label.trim() || !value.trim()}>
            Lock into Story Bible
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
  fact: { id: string; entity_label: string; predicate: CorePredicate; value: string; status: string };
  against?: { value: string };
  onLock: (value: string) => void;
  onReject: () => void;
}) {
  const [draft, setDraft] = useState(fact.value);
  return (
    <li className={fact.status === "flagged" ? "proposal is-flagged" : "proposal"}>
      <p>
        <strong>{fact.entity_label}</strong>
        <span className="quiet"> {PREDICATE_LABELS[fact.predicate]}</span>
      </p>
      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} aria-label="Fact text" />
      {against ? <p className="conflict-note">Conflicts with: {against.value}</p> : null}
      <div className="proposal-actions">
        <button type="button" className="primary" onClick={() => onLock(draft)} disabled={!draft.trim()}>
          Lock
        </button>
        <button type="button" className="text-button" onClick={onReject}>
          Reject
        </button>
      </div>
    </li>
  );
}

function LockedFact({
  fact,
  onSave,
  onToggleHidden
}: {
  fact: { id: string; predicate: CorePredicate; value: string; hidden_from_ai?: boolean | undefined };
  onSave: (value: string) => void;
  onToggleHidden: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fact.value);
  const hidden = fact.hidden_from_ai === true;

  function save() {
    if (!draft.trim()) return;
    onSave(draft);
    setEditing(false);
  }

  if (!editing) {
    return (
      <li className={hidden ? "locked-fact is-hidden-from-model" : "locked-fact"}>
        <span className="pred">{PREDICATE_LABELS[fact.predicate]}</span>
        {fact.value}
        <div className="fact-actions">
          <button
            type="button"
            className={hidden ? "text-button bible-vis is-hidden" : "text-button bible-vis"}
            aria-pressed={hidden}
            aria-label={hidden ? "Show this claim to Draft" : "Hide this claim from Draft"}
            onClick={onToggleHidden}
          >
            {hidden ? "Show" : "Hide"}
          </button>
          <button type="button" className="text-button fact-edit-btn" onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="locked-fact is-editing">
      <span className="pred">{PREDICATE_LABELS[fact.predicate]}</span>
      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} aria-label="Edit fact" />
      <div className="proposal-actions">
        <button type="button" className="primary" onClick={save} disabled={!draft.trim()}>
          Save
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setDraft(fact.value);
            setEditing(false);
          }}
        >
          Cancel
        </button>
      </div>
    </li>
  );
}
