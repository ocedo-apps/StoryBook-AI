import React, { useEffect, useRef, useState } from "react";
import { parseTagList } from "@core/characterProfile";
import {
  newIllustrationStyle,
  searchIllustrationStyles,
  stylesByGenreTag,
  untaggedStyles,
  withExampleImage,
  withoutExampleImage,
  type IllustrationStyle
} from "@core/illustrationStyle";
import { format, useLocale } from "./i18n";

type Editing = { style: IllustrationStyle; isNew: boolean };
type SidebarGroup = { tag: string; styles: IllustrationStyle[] };

const UNTAGGED_KEY = "__untagged__";

function initialTagFor(style: IllustrationStyle | undefined, sidebarGroups: SidebarGroup[]): string | null {
  if (!style) return sidebarGroups[0]?.tag ?? null;
  if (style.genreTags.length === 0) {
    return sidebarGroups.find((group) => group.tag === UNTAGGED_KEY)?.tag ?? sidebarGroups[0]?.tag ?? null;
  }
  const wanted = new Set(style.genreTags.map((tag) => tag.toLowerCase()));
  return sidebarGroups.find((group) => wanted.has(group.tag.toLowerCase()))?.tag ?? sidebarGroups[0]?.tag ?? null;
}

export function IllustrationStyleLibraryCard({
  styles,
  currentStyleText,
  onSelect,
  onSave,
  onDelete,
  onClose
}: {
  styles: IllustrationStyle[];
  currentStyleText: string;
  onSelect: (style: IllustrationStyle) => void;
  onSave: (style: IllustrationStyle) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const { messages: m } = useLocale();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [zoomedStyle, setZoomedStyle] = useState<IllustrationStyle | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const currentStyleTextTrimmed = currentStyleText.trim();
  const selectedStyle = currentStyleTextTrimmed
    ? styles.find((style) => style.promptText.trim() === currentStyleTextTrimmed)
    : undefined;

  const groups = stylesByGenreTag(styles);
  const untagged = untaggedStyles(styles);
  const sidebarGroups = untagged.length > 0 ? [...groups, { tag: UNTAGGED_KEY, styles: untagged }] : groups;

  const [selectedTag, setSelectedTag] = useState<string | null>(() => initialTagFor(selectedStyle, sidebarGroups));

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (zoomedStyle) setZoomedStyle(null);
      else if (editing) setEditing(null);
      else onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, zoomedStyle, onClose]);

  useEffect(() => {
    if (!selectedStyle) return;
    const el = gridRef.current?.querySelector(`[data-style-id="${CSS.escape(selectedStyle.id)}"]`);
    el?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(style: IllustrationStyle) {
    await onSave(style);
    setEditing(null);
  }

  if (editing) {
    return (
      <IllustrationStyleEditForm
        style={editing.style}
        isNew={editing.isNew}
        onCancel={() => setEditing(null)}
        onSave={handleSave}
      />
    );
  }

  const searching = search.trim().length > 0;
  const searchResults = searching ? searchIllustrationStyles(styles, search) : [];
  const activeGroup = sidebarGroups.find((group) => group.tag === selectedTag);
  const visibleStyles = searching ? searchResults : (activeGroup?.styles ?? []);

  function selectTag(tag: string) {
    setSearch("");
    setSelectedTag(tag);
  }

  return (
    <>
      <div
        className="edit-overlay"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="edit-card illustration-library-card" role="dialog" aria-modal="true" aria-labelledby="illustration-library-title">
          <div className="stats-card-head">
            <p className="chapter-craft-label">{m.illustration.libraryTitle}</p>
            <button type="button" className="text-button" onClick={onClose}>
              {m.common.close}
            </button>
          </div>
          <div className="illustration-library-toolbar">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.illustration.searchPlaceholder}
              aria-label={m.illustration.searchPlaceholder}
              autoFocus
            />
            <button
              type="button"
              className="text-button"
              onClick={() => setEditing({ style: newIllustrationStyle("", currentStyleText, []), isNew: true })}
            >
              {m.illustration.saveCurrentAsNew}
            </button>
          </div>
          <div className="illustration-library-body">
            <nav className="illustration-genre-list" aria-label={m.illustration.libraryTitle}>
              {searching ? (
                <p className="illustration-genre-item is-active" aria-current="true">
                  <span>{m.illustration.searchResults}</span>
                  <span className="illustration-genre-count">{searchResults.length}</span>
                </p>
              ) : null}
              {sidebarGroups.map((group) => (
                <button
                  key={group.tag}
                  type="button"
                  className={`illustration-genre-item${!searching && selectedTag === group.tag ? " is-active" : ""}`}
                  aria-current={!searching && selectedTag === group.tag}
                  onClick={() => selectTag(group.tag)}
                >
                  <span>{group.tag === UNTAGGED_KEY ? m.illustration.untagged : group.tag}</span>
                  <span className="illustration-genre-count">{group.styles.length}</span>
                </button>
              ))}
            </nav>
            <div className="illustration-style-grid" ref={gridRef}>
              {visibleStyles.length === 0 ? (
                <p className="quiet">{m.illustration.noResults}</p>
              ) : (
                visibleStyles.map((style) => (
                  <IllustrationStyleCard
                    key={style.id}
                    style={style}
                    isSelected={style.id === selectedStyle?.id}
                    onSelect={onSelect}
                    onEdit={() => setEditing({ style, isNew: false })}
                    onDelete={onDelete}
                    onZoom={() => setZoomedStyle(style)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {zoomedStyle?.exampleImage ? (
        <IllustrationImageLightbox
          blob={zoomedStyle.exampleImage.blob}
          alt={zoomedStyle.name}
          onClose={() => setZoomedStyle(null)}
        />
      ) : null}
    </>
  );
}

function IllustrationStyleCard({
  style,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onZoom
}: {
  style: IllustrationStyle;
  isSelected: boolean;
  onSelect: (style: IllustrationStyle) => void;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  onZoom: () => void;
}) {
  const { messages: m } = useLocale();
  return (
    <div
      className={`illustration-style-card${isSelected ? " is-selected" : ""}`}
      data-style-id={style.id}
    >
      <button type="button" className="illustration-style-card-select" onClick={() => onSelect(style)}>
        {style.exampleImage ? (
          <BlobThumbnail blob={style.exampleImage.blob} alt={style.name} variant="cover" />
        ) : (
          <span className="illustration-style-card-image illustration-style-placeholder" aria-hidden="true" />
        )}
        <span className="illustration-style-card-name">{style.name}</span>
        <span className="illustration-style-card-prompt">{style.promptText}</span>
      </button>
      {style.exampleImage ? (
        <button
          type="button"
          className="icon-button illustration-style-card-zoom"
          aria-label={`${m.illustration.viewFullImage}: ${style.name}`}
          onClick={onZoom}
        >
          🔍
        </button>
      ) : null}
      <div className="illustration-style-card-actions">
        <button type="button" className="icon-button" aria-label={`${m.illustration.edit}: ${style.name}`} onClick={onEdit}>
          ✎
        </button>
        {style.origin === "custom" ? (
          <button
            type="button"
            className="icon-button"
            aria-label={`${m.illustration.delete}: ${style.name}`}
            onClick={() => {
              if (window.confirm(format(m.illustration.deleteConfirm, { name: style.name }))) void onDelete(style.id);
            }}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}

function IllustrationImageLightbox({ blob, alt, onClose }: { blob: Blob; alt: string; onClose: () => void }) {
  const { messages: m } = useLocale();
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return (
    <div
      className="edit-overlay illustration-lightbox-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="illustration-lightbox" role="dialog" aria-modal="true" aria-label={alt}>
        <button type="button" className="text-button illustration-lightbox-close" onClick={onClose}>
          {m.common.close}
        </button>
        {url ? <img src={url} alt={alt} className="illustration-lightbox-image" /> : null}
      </div>
    </div>
  );
}

function BlobThumbnail({ blob, alt, variant }: { blob: Blob; alt: string; variant: "cover" | "large" }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  const className = variant === "cover" ? "illustration-style-card-image" : "illustration-style-thumb-large";
  if (!url) return <span className={`${className} illustration-style-placeholder`} aria-hidden="true" />;
  return <img src={url} alt={alt} className={className} />;
}

function IllustrationStyleEditForm({
  style,
  isNew,
  onCancel,
  onSave
}: {
  style: IllustrationStyle;
  isNew: boolean;
  onCancel: () => void;
  onSave: (style: IllustrationStyle) => Promise<void>;
}) {
  const { messages: m } = useLocale();
  const [name, setName] = useState(style.name);
  const [promptText, setPromptText] = useState(style.promptText);
  const [tagsRaw, setTagsRaw] = useState(style.genreTags.join(", "));
  const [pendingImage, setPendingImage] = useState<Blob | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const previewBlob = pendingImage === null ? null : (pendingImage ?? style.exampleImage?.blob ?? null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    let next: IllustrationStyle = { ...style, name: name.trim(), promptText, genreTags: parseTagList(tagsRaw) };
    if (pendingImage === null) next = withoutExampleImage(next);
    else if (pendingImage) next = withExampleImage(next, pendingImage);
    try {
      await onSave(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="edit-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <form
        className="edit-card"
        action="#"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        aria-labelledby="illustration-style-edit-title"
      >
        <h2 id="illustration-style-edit-title">{isNew ? m.illustration.newStyleTitle : m.illustration.editStyleTitle}</h2>
        <label className="field-label" htmlFor="illustration-style-name">
          {m.illustration.nameLabel}
        </label>
        <input id="illustration-style-name" type="text" value={name} onChange={(event) => setName(event.target.value)} required autoFocus />
        <label className="field-label" htmlFor="illustration-style-prompt">
          {m.illustration.promptTextLabel}
        </label>
        <textarea
          id="illustration-style-prompt"
          value={promptText}
          onChange={(event) => setPromptText(event.target.value)}
          rows={5}
        />
        <label className="field-label" htmlFor="illustration-style-tags">
          {m.illustration.genreTagsLabel}
        </label>
        <input
          id="illustration-style-tags"
          type="text"
          value={tagsRaw}
          onChange={(event) => setTagsRaw(event.target.value)}
          placeholder={m.illustration.genreTagsPlaceholder}
        />
        <label className="field-label">{m.illustration.exampleImageLabel}</label>
        <div className="illustration-style-image-field">
          {previewBlob ? (
            <BlobThumbnail blob={previewBlob} alt={name} variant="large" />
          ) : (
            <span className="illustration-style-thumb-large illustration-style-placeholder" aria-hidden="true" />
          )}
          <div className="illustration-style-image-actions">
            <label className="text-button illustration-style-upload">
              {previewBlob ? m.illustration.replaceImage : m.illustration.uploadImage}
              <input
                type="file"
                accept="image/*"
                className="setup-file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setPendingImage(file);
                  event.target.value = "";
                }}
              />
            </label>
            {previewBlob ? (
              <button type="button" className="text-button" onClick={() => setPendingImage(null)}>
                {m.illustration.removeImage}
              </button>
            ) : null}
          </div>
        </div>
        <div className="edit-actions">
          <button type="button" className="text-button" onClick={onCancel}>
            {m.common.cancel}
          </button>
          <button type="submit" className="primary" disabled={!name.trim() || saving}>
            {m.common.save}
          </button>
        </div>
      </form>
    </div>
  );
}
