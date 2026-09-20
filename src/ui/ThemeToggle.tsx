import React, { useState } from "react";
import { applyTheme, readTheme } from "./theme";
import { useLocale } from "./i18n";

export function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme);
  const { messages } = useLocale();
  const light = theme === "light";

  return (
    <button
      type="button"
      className={light ? "text-button theme-toggle is-on" : "text-button theme-toggle"}
      onClick={() => {
        const next = light ? "dark" : "light";
        applyTheme(next);
        setTheme(next);
      }}
      aria-pressed={light}
      title={light ? messages.chrome.darkTitle : messages.chrome.lightTitle}
    >
      {light ? messages.chrome.dark : messages.chrome.light}
    </button>
  );
}
