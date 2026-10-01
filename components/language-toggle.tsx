"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useLocale } from "./locale-provider";
import { Icon } from "./icon";
import { getLocaleAlternates, locales, type TranslationManifest, type Locale } from "@/lib/i18n";

const labels = { zh: "中", en: "En", ja: "あ" };
const names = { zh: "简体中文", en: "English", ja: "日本語" };
const unavailable = { zh: "暂无此语言译文", en: "Translation not available", ja: "この言語の翻訳はまだありません" };
const switchLabels = { zh: "切换语言", en: "Switch language", ja: "言語を切り替える" };
function rememberLocale(locale: Locale) {
  document.cookie = `blog_locale=${locale}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

export function LanguageToggle({ translations }: { translations: TranslationManifest }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  const optionsId = useId();
  const alternates = getLocaleAlternates(pathname, translations);

  useLayoutEffect(() => {
    if (expanded) {
      optionsRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({ preventScroll: true });
    } else if (restoreFocus.current) {
      triggerRef.current?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setExpanded(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded]);

  function close() {
    restoreFocus.current = true;
    setExpanded(false);
  }

  function switchLanguage(target: Locale) {
    const path = alternates[target];
    if (!path) return;
    close();
    rememberLocale(target);
    if (target === locale) return;
    // Select the correct static root layout and HTML language, preserving URL state.
    router.push(`${path}${window.location.search}${window.location.hash}`);
  }
  return (
    <div ref={rootRef} className={`language-toggle${expanded ? " expanded" : ""}`}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !expanded) return;
        event.preventDefault();
        event.stopPropagation();
        close();
      }}>
      <button ref={triggerRef} type="button" className="language-trigger"
        aria-label={`${switchLabels[locale]}: ${names[locale]}`}
        aria-expanded={expanded} aria-controls={optionsId}
        aria-hidden={expanded} inert={expanded} onClick={() => setExpanded(true)}>
        <span lang={locale}>{labels[locale]}</span>
        <Icon name="chevron" width="12" height="12" />
      </button>
      <div ref={optionsRef} id={optionsId} className="language-options" role="group"
        aria-label={switchLabels[locale]} aria-hidden={!expanded} inert={!expanded}>
        <span className="language-indicator" style={{ transform: `translateX(${locales.indexOf(locale) * 100}%)` }} aria-hidden="true" />
        {locales.map((target) => (
          <button key={target} type="button" lang={target} aria-label={names[target]}
            title={alternates[target] ? names[target] : `${names[target]} · ${unavailable[locale]}`}
            aria-pressed={target === locale} aria-disabled={!alternates[target]}
            onClick={() => switchLanguage(target)}>
            {labels[target]}
          </button>
        ))}
      </div>
    </div>
  );
}
