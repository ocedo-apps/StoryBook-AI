import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applyTheme, readTheme } from "./theme";
import "./styles.css";

applyTheme(readTheme());

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
