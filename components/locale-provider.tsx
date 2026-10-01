"use client";

import { createContext, useContext, useLayoutEffect } from "react";
import type { Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("zh");
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  useLayoutEffect(() => {
    // A client navigation between locale root params replaces HTML attributes.
    // Restore the saved appearance before painting the new language.
    let theme = "system";
    try { theme = localStorage.getItem("blog-theme") || "system"; } catch { /* Storage may be disabled. */ }
    const root = document.documentElement;
    root.dataset.preference = theme;
    root.dataset.theme = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    window.dispatchEvent(new Event("blog-theme-change"));
  }, [locale]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
export function useLocale() { return useContext(LocaleContext); }
