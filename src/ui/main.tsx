import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applyTheme, readTheme } from "./theme";
import { applyLocale, getMessages, readLocale } from "./i18n";
import "./styles.css";

applyTheme(readTheme());
applyLocale(readLocale());

const container = document.getElementById("root");
if (!container) throw new Error(getMessages().app.missingRoot);

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
