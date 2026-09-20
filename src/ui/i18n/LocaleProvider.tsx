import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Messages } from "./en";
import { applyLocale, LOCALE_PACKS, packFor, readLocale, type LocalePack } from "./locale";

type LocaleContextValue = {
  locale: string;
  messages: Messages;
  packs: readonly LocalePack[];
  setLocale: (id: string) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(() => applyLocale(readLocale()));
  const pack = packFor(locale);

  const setLocale = useCallback((id: string) => {
    setLocaleState(applyLocale(id));
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale: pack.id,
      messages: pack.messages,
      packs: LOCALE_PACKS,
      setLocale
    }),
    [pack, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
