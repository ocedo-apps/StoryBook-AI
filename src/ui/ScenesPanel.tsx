import { useState } from "react";
import type { Chapter } from "@core/BookSchema";
import {
  chapterScenes,
  mergeSceneWithNext,
  splitSceneAtParagraph,
  updateSceneMeta,
  type SceneMeta
} from "@core/bookScene";
import { splitFlowParagraphs } from "@core/proseFlow";
import { count, format, useLocale } from "./i18n";

const PREVIEW_LEN = 90;
const PARA_PREVIEW_LEN = 60;

export function ScenesPanel({
  chapter,
  onPatch,
  busy,
  onDraftScene,
  onRecastScene,
  onAnalyzeScene
}: {
  chapter: Chapter;
  onPatch: (scenes: SceneMeta[]) => void;
  busy: boolean;
  onDraftScene: (sceneId: string) => void;
  onRecastScene: (sceneId: string) => void;
  onAnalyzeScene: (sceneId: string) => void;
}) {
  const { messages: m } = useLocale();
  const scenes = chapterScenes(chapter);
  const [open, setOpen] = useState(scenes.length > 1);
  const [splitOpenId, setSplitOpenId] = useState<string | null>(null);

  return (
    <div className="scenes-panel">
      <button type="button" className="scenes-panel-toggle" aria-expanded={open} onClick={() => setOpen((on) => !on)}>
        <span className="chevron" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
        {count(scenes.length, m.scenes.toggleCount)}
      </button>
      {open ? (
        <ol className="scenes-list">
          {scenes.map((scene, index) => {
            const paragraphs = splitFlowParagraphs(scene.prose);
            const preview = scene.prose.trim().slice(0, PREVIEW_LEN);
            return (
              <li key={scene.id} className="scene-card">
                <div className="scene-card-head">
                  <span className="scene-index">{index + 1}</span>
                  <input
                    type="text"
                    value={scene.title ?? ""}
                    placeholder={m.scenes.titlePlaceholder}
                    aria-label={format(m.scenes.titleLabel, { index: index + 1 })}
                    onChange={(event) => onPatch(updateSceneMeta(chapter, scene.id, { title: event.target.value }))}
                  />
                  {index < scenes.length - 1 ? (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => onPatch(mergeSceneWithNext(chapter, scene.id))}
                    >
                      {m.scenes.mergeWithNext}
                    </button>
                  ) : null}
                </div>
                <textarea
                  className="scene-brief"
                  value={scene.brief ?? ""}
                  placeholder={m.scenes.briefPlaceholder}
                  aria-label={format(m.scenes.briefLabel, { index: index + 1 })}
                  rows={2}
                  onChange={(event) => onPatch(updateSceneMeta(chapter, scene.id, { brief: event.target.value }))}
                />
                {preview ? (
                  <p className="scene-preview quiet">
                    {preview}
                    {scene.prose.trim().length > PREVIEW_LEN ? "…" : ""}
                  </p>
                ) : null}
                {scenes.length > 1 ? (
                  <div className="scene-actions">
                    <button type="button" disabled={busy} onClick={() => onDraftScene(scene.id)}>
                      {m.scenes.draft}
                    </button>
                    <button
                      type="button"
                      disabled={busy || !scene.prose.trim()}
                      onClick={() => onRecastScene(scene.id)}
                    >
                      {m.scenes.recast}
                    </button>
                    <button
                      type="button"
                      disabled={busy || !scene.prose.trim()}
                      onClick={() => onAnalyzeScene(scene.id)}
                    >
                      {m.scenes.analyze}
                    </button>
                  </div>
                ) : null}
                {paragraphs.length > 1 ? (
                  <div className="scene-split">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setSplitOpenId((id) => (id === scene.id ? null : scene.id))}
                    >
                      {m.scenes.splitHere}
                    </button>
                    {splitOpenId === scene.id ? (
                      <>
                        <p className="quiet scene-split-hint">{m.scenes.splitHint}</p>
                        <ul className="scene-split-paragraphs">
                          {paragraphs.slice(1).map((paragraph, localIndex) => (
                            <li key={localIndex}>
                              <button
                                type="button"
                                onClick={() => {
                                  onPatch(splitSceneAtParagraph(chapter, scene.startParagraph + localIndex + 1));
                                  setSplitOpenId(null);
                                }}
                              >
                                {paragraph.slice(0, PARA_PREVIEW_LEN)}
                                {paragraph.length > PARA_PREVIEW_LEN ? "…" : ""}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
