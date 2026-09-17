import React, { useState } from "react";
import { applyTheme, readTheme } from "./theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme);
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
      title={light ? "Use a dark page" : "Use a light page"}
    >
      {light ? "Dark" : "Light"}
    </button>
  );
}
