import React, { useRef, useState } from "react";
import { useBookStore } from "./useBookStore";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSelect } from "./LocaleSelect";
import { GuidePanel } from "./GuidePanel";
import { count, format, translateError, useLocale } from "./i18n";

export function Home() {
  const { summaries, newBook, openBook, deleteBook, importManuscript, error } = useBookStore();
  const { messages: m } = useLocale();
  const [title, setTitle] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function submitNew(event?: React.SyntheticEvent) {
    event?.preventDefault();
    void newBook(title).then(() => setTitle(""));
  }

  return (
    <div className="home">
      <header className="home-brand">
        <p className="eyebrow">StoryBook AI</p>
        <div className="home-chrome">
          <LocaleSelect />
          <ThemeToggle />
        </div>
        <h1>
          {m.home.headline}
          <br />
          {m.home.truth}
        </h1>
        <p className="lede">{m.home.lede}</p>
        <button type="button" className="text-button" onClick={() => setGuideOpen(true)}>
          {m.guide.openFromHome}
        </button>
      </header>

      {error ? (
        <p className="banner home-banner" role="status">
          {translateError(error, m)}
        </p>
      ) : null}

      <form className="new-book" action="#" onSubmit={submitNew}>
        <label className="field-label" htmlFor="new-title">
          {m.home.newManuscript}
        </label>
        <div className="new-book-row">
          <input
            id="new-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={m.home.titlePlaceholder}
            autoComplete="off"
          />
          <button type="button" onClick={() => submitNew()}>
            {m.home.open}
          </button>
        </div>
      </form>

      <p className="home-restore">
        <input
          ref={fileRef}
          className="setup-file"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void importManuscript(file);
          }}
        />
        <button type="button" className="text-button" onClick={() => fileRef.current?.click()}>
          {m.home.importBackup}
        </button>
      </p>

      <section className="book-shelf" aria-label={m.home.shelf}>
        {summaries.length === 0 ? (
          <p className="empty-shelf">{m.home.emptyShelf}</p>
        ) : (
          <ul>
            {summaries.map((item) => (
              <li key={item.id}>
                <button type="button" className="book-card" onClick={() => void openBook(item.id)}>
                  <strong>{item.title}</strong>
                  <span>
                    {count(item.chapterCount, m.home.chapters)}
                    <span className="dot">·</span>
                    {count(item.factCount, m.home.facts)}
                  </span>
                </button>
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() => {
                    if (window.confirm(format(m.home.deleteConfirm, { title: item.title }))) {
                      void deleteBook(item.id);
                    }
                  }}
                >
                  {m.home.delete}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {guideOpen ? (
        <div
          className="edit-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setGuideOpen(false);
          }}
        >
          <div className="edit-card guide-overlay-card">
            <div className="edit-actions guide-overlay-close">
              <button type="button" className="text-button" onClick={() => setGuideOpen(false)}>
                {m.guide.closeAction}
              </button>
            </div>
            <GuidePanel />
          </div>
        </div>
      ) : null}
    </div>
  );
}
