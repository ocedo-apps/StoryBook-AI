import React, { Component, Fragment, type ErrorInfo, type ReactNode } from "react";
import { BookStoreProvider } from "./BookStore";
import { useBookStore } from "./useBookStore";
import { Editor } from "./Editor";
import { Home } from "./Home";
import { LocaleProvider, getMessages } from "./i18n";

class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null; retry: number }> {
  override state: { message: string | null; retry: number } = { message: null, retry: 0 };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  override render() {
    if (this.state.message) {
      const copy = getMessages();
      return (
        <div className="crash">
          <p>{copy.app.crash}</p>
          <pre>{this.state.message}</pre>
          <button type="button" onClick={() => this.setState((s) => ({ message: null, retry: s.retry + 1 }))}>
            {copy.app.tryAgain}
          </button>
        </div>
      );
    }
    return <Fragment key={this.state.retry}>{this.props.children}</Fragment>;
  }
}

function Shell() {
  const { book } = useBookStore();
  return book ? <Editor /> : <Home />;
}

export default function App() {
  return (
    <LocaleProvider>
      <ErrorBoundary>
        <BookStoreProvider>
          <Shell />
        </BookStoreProvider>
      </ErrorBoundary>
    </LocaleProvider>
  );
}
