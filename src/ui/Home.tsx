import React, { useState } from "react";
import { useBookStore } from "./BookStore";

export function Home() {
  const { summaries, newBook, openBook, deleteBook } = useBookStore();
  const [title, setTitle] = useState("");

  function submitNew(event?: React.SyntheticEvent) {
    event?.preventDefault();
    void newBook(title).then(() => setTitle(""));
  }

  return (
    <div className="home">
      <header className="home-brand">
        <p className="eyebrow">StoryBook AI</p>
        <h1>Write the prose. The Story Bible keeps the truth.</h1>
        <p className="lede">
          A local manuscript tool. Title the book, work the story in brainstorm, lift a synopsis, then write the
          chapters. The model drafts. You decide.
        </p>
      </header>

      <form className="new-book" action="#" onSubmit={submitNew}>
        <label className="field-label" htmlFor="new-title">
          New manuscript
        </label>
        <div className="new-book-row">
          <input
            id="new-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            autoComplete="off"
          />
          <button type="button" onClick={() => submitNew()}>
            Open
          </button>
        </div>
      </form>

      <section className="book-shelf" aria-label="Manuscripts">
        {summaries.length === 0 ? (
          <p className="empty-shelf">No manuscripts yet. A title is enough to start.</p>
        ) : (
          <ul>
            {summaries.map((item) => (
              <li key={item.id}>
                <button type="button" className="book-card" onClick={() => void openBook(item.id)}>
                  <strong>{item.title}</strong>
                  <span>
                    {item.chapterCount} {item.chapterCount === 1 ? "chapter" : "chapters"}
                    <span className="dot">·</span>
                    {item.factCount} locked {item.factCount === 1 ? "fact" : "facts"}
                  </span>
                </button>
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() => {
                    if (window.confirm(`Delete “${item.title}”? This cannot be undone.`)) {
                      void deleteBook(item.id);
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
