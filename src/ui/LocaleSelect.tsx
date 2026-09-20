import React from "react";
import { useLocale } from "./i18n";

export function LocaleSelect() {
  const { locale, packs, setLocale, messages } = useLocale();

  return (
    <label className="locale-select">
      <span className="visually-hidden">{messages.chrome.language}</span>
      <select
        value={locale}
        aria-label={messages.chrome.language}
        onChange={(event) => setLocale(event.target.value)}
      >
        {packs.map((pack) => (
          <option key={pack.id} value={pack.id}>
            {pack.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
