"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";


type Theme = "light" | "system" | "dark";
const eventName = "blog-theme-change";
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}
function currentTheme(): Theme {
  const theme = document.documentElement.dataset.preference;
  return theme === "light" || theme === "dark" ? theme : "system";
}

export function ThemeToggle() {
  const t = getMessages(useLocale());
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  useEffect(() => {
    function dismissTooltip(event: KeyboardEvent) {
      if (event.key === "Escape") setTooltipDismissed(true);
    }
    document.addEventListener("keydown", dismissTooltip);
    return () => document.removeEventListener("keydown", dismissTooltip);
  }, []);
  const theme = useSyncExternalStore(
    subscribe,
    currentTheme,
    () => "system" as Theme,
  );
  function setTheme(value: Theme) {
    const root = document.documentElement;
    root.setAttribute("data-preference", value);
    root.setAttribute(
      "data-theme",
      value === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value,
    );
    try {
      localStorage.setItem("blog-theme", value);
    } catch {
      /* Private browsing can disable storage. */
    }
    window.dispatchEvent(new Event(eventName));
  }
  return (
    <div
      className="theme-toggle"
      role="group"
      aria-label={t.appearance}
      data-tooltip-dismissed={tooltipDismissed || undefined}
    >
      {(
        [
          { value: "light", label: t.themeLight, icon: "sun" },
          { value: "system", label: t.themeSystem, icon: "monitor" },
          { value: "dark", label: t.themeDark, icon: "moon" },
        ] as const
      ).map((item) => (
        <button
          key={item.value}
          type="button"
          aria-label={item.label}
          aria-pressed={theme === item.value}
          onPointerEnter={() => setTooltipDismissed(false)}
          onFocus={() => setTooltipDismissed(false)}
          onClick={() => setTheme(item.value)}
        >
          <Icon name={item.icon} width="17" height="17" />
          <span className="theme-tooltip" aria-hidden="true">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
