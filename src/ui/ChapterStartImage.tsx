import { useRef, useState } from "react";
import type { EntityPicture } from "@core/entityMedia";
import { EntityImageError, picturesFromFile } from "./entityImage";
import { useLocale } from "./i18n";

export function ChapterStartImageBanner({
  image,
  onSet,
  onRemove
}: {
  image: EntityPicture | undefined;
  onSet: (picture: EntityPicture) => void;
  onRemove: () => void;
}) {
  const { messages: m } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickFile() {
    fileRef.current?.click();
  }

  return (
    <div className="chapter-start-image">
      {image ? (
        <div className="chapter-start-image-frame">
          <img src={image.imageDataUrl} alt="" className="chapter-start-image-picture" />
          <div className="chapter-start-image-actions">
            <button type="button" className="text-button" disabled={busy} onClick={pickFile}>
              {busy ? "…" : m.editor.chapterImageReplace}
            </button>
            <button type="button" className="text-button danger" disabled={busy} onClick={onRemove}>
              {m.editor.chapterImageRemove}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="chapter-start-image-add" disabled={busy} onClick={pickFile}>
          {busy ? "…" : m.editor.chapterImageAdd}
        </button>
      )}
      <input
        ref={fileRef}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setError(null);
          setBusy(true);
          void picturesFromFile(file)
            .then((picture) => onSet(picture))
            .catch((err) => {
              setError(
                err instanceof EntityImageError
                  ? err.code === "choose"
                    ? m.errors.imageChoose
                    : m.errors.imageRead
                  : m.errors.imageAdd
              );
            })
            .finally(() => setBusy(false));
        }}
      />
      {error ? <p className="conflict-note">{error}</p> : null}
    </div>
  );
}
