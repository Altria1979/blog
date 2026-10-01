"use client";

import { useSyncExternalStore } from "react";
import { formatBlogAge, formatBlogWordCount, formatBuildAge } from "@/lib/blog-stats";
import { languageTag, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

const minute = 60_000;
function subscribeClock(onChange: () => void) {
  const timer = window.setInterval(onChange, minute);
  return () => window.clearInterval(timer);
}
function currentMinute() {
  return Math.floor(Date.now() / minute);
}

export function BlogStats({
  locale,
  established,
  builtAt,
  totalWords,
}: {
  locale: Locale;
  established: string;
  builtAt: string;
  totalWords: number;
}) {
  const t = getMessages(locale);
  const buildTime = Date.parse(builtAt);
  const buildMinute = Number.isFinite(buildTime) ? Math.floor(buildTime / minute) : 0;
  // The server and hydration share the build snapshot, then use the visitor's clock.
  const now = useSyncExternalStore(subscribeClock, currentMinute, () => buildMinute) * minute;
  const buildLabel = Number.isFinite(buildTime)
    ? new Intl.DateTimeFormat(languageTag(locale), {
        timeZone: "Asia/Shanghai", dateStyle: "medium", timeStyle: "short",
      }).format(buildTime)
    : undefined;

  return (
    <section className="blog-stats" aria-labelledby="blog-stats-title">
      <h2 id="blog-stats-title" className="side-heading">{t.blogStats}</h2>
      <dl className="stats-panel">
        <div>
          <dt>{t.operatingTime}</dt>
          <dd><time dateTime={established} title={established}>{formatBlogAge(established, now, locale)}</time></dd>
        </div>
        <div>
          <dt>{t.lastBuild}</dt>
          <dd><time dateTime={builtAt || undefined} title={buildLabel}>{formatBuildAge(builtAt, now, locale)}</time></dd>
        </div>
        <div>
          <dt>{t.totalWords}</dt>
          <dd title={totalWords.toLocaleString(languageTag(locale))}>{formatBlogWordCount(totalWords, locale)}</dd>
        </div>
      </dl>
    </section>
  );
}
