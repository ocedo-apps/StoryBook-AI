import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { BookStoreProvider, useBookStore } from "./BookStore";
import { Editor } from "./Editor";
import { Home } from "./Home";

class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  override state: { message: string | null } = { message: null };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  override render() {
    if (this.state.message) {
      return (
        <div className="crash">
          <p>The app hit an error.</p>
          <pre>{this.state.message}</pre>
          <button type="button" onClick={() => this.setState({ message: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Shell() {
  const { book } = useBookStore();
  return book ? <Editor /> : <Home />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BookStoreProvider>
        <Shell />
      </BookStoreProvider>
    </ErrorBoundary>
  );
}
