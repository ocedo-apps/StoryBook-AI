import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (editing) setEditing(null);
      else onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, onClose]);

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

  const filtered = searchIllustrationStyles(styles, search);
  const groups = stylesByGenreTag(filtered);
  const untagged = untaggedStyles(filtered);

  return (
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
        <div className="illustration-style-groups">
          {groups.map((group) => (
            <details key={group.tag} open={search.trim().length > 0}>
              <summary>{`${group.tag} (${group.styles.length})`}</summary>
              <ul className="illustration-style-list">
                {group.styles.map((style) => (
                  <IllustrationStyleRow
                    key={style.id}
                    style={style}
                    onSelect={onSelect}
                    onEdit={() => setEditing({ style, isNew: false })}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </details>
          ))}
          {untagged.length > 0 ? (
            <details open={search.trim().length > 0}>
              <summary>{`${m.illustration.untagged} (${untagged.length})`}</summary>
              <ul className="illustration-style-list">
                {untagged.map((style) => (
                  <IllustrationStyleRow
                    key={style.id}
                    style={style}
                    onSelect={onSelect}
                    onEdit={() => setEditing({ style, isNew: false })}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </details>
          ) : null}
          {filtered.length === 0 ? <p className="quiet">{m.illustration.noResults}</p> : null}
        </div>
      </div>
    </div>
  );
}

function IllustrationStyleRow({
  style,
  onSelect,
  onEdit,
  onDelete
}: {
  style: IllustrationStyle;
  onSelect: (style: IllustrationStyle) => void;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const { messages: m } = useLocale();
  return (
    <li className="illustration-style-row">
      <button type="button" className="illustration-style-select" onClick={() => onSelect(style)}>
        {style.exampleImage ? (
          <BlobThumbnail blob={style.exampleImage.blob} alt={style.name} />
        ) : (
          <span className="illustration-style-placeholder" aria-hidden="true" />
        )}
        <span className="illustration-style-name">{style.name}</span>
      </button>
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
    </li>
  );
}

function BlobThumbnail({ blob, alt, large = false }: { blob: Blob; alt: string; large?: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  if (!url) return <span className="illustration-style-placeholder" aria-hidden="true" />;
  return <img src={url} alt={alt} className={large ? "illustration-style-thumb is-large" : "illustration-style-thumb"} />;
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
            <BlobThumbnail blob={previewBlob} alt={name} large />
          ) : (
            <span className="illustration-style-placeholder is-large" aria-hidden="true" />
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
