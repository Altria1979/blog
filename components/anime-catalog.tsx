"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { groupAnimeByYear, parseAnimeRange, selectAnime, summarizeAnime, type Anime, type AnimeRange, type AnimeWatchlist } from "@/lib/anime-shared";
import { getAnimeMessages } from "@/lib/anime-messages";
import { languageTag, localePath, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  catalog: Anime[];
  watchlist: AnimeWatchlist;
  range: AnimeRange;
};

export function AnimeCatalog({ locale, catalog, watchlist, range }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const messages = getAnimeMessages(locale);
  const { watchedIds, recordedDates } = watchlist;
  const recordedDateFormat = new Intl.DateTimeFormat(languageTag(locale), {
    timeZone: "Asia/Shanghai", year: "numeric", month: "short", day: "numeric",
  });
  const entries = selectAnime(catalog, range);
  const groups = groupAnimeByYear(entries);
  const watched = new Set(watchedIds ?? []);
  const summary = summarizeAnime(entries, watchedIds);
  const years = catalog.map((entry) => entry.year);
  const path = localePath("/anime", locale);

  function changeRange(value: string) {
    const nextRange = parseAnimeRange(value);
    const params = new URLSearchParams(window.location.search);
    if (nextRange === "all") params.delete("range");
    else params.set("range", nextRange);
    const query = params.toString();
    startTransition(() => router.push(`${path}${query ? `?${query}` : ""}`, { scroll: false }));
  }

  return (
    <>
      <div className="anime-toolbar">
        <p className="anime-summary" role="status" aria-live="polite" aria-atomic="true">
          {summary.watched === null ? messages.total(summary.total) : messages.progress(summary.watched, summary.total)}
        </p>
        <form className="anime-filter" action={path} method="get">
          <label htmlFor="anime-range">{messages.range}</label>
          <select id="anime-range" name="range" value={range} disabled={isPending} onChange={(event) => changeRange(event.target.value)}>
            {(["all", "5", "10", "15"] as const).map((value) => (
              <option value={value} key={value}>{messages.ranges[value]}</option>
            ))}
          </select>
          <noscript><button type="submit">{messages.apply}</button></noscript>
        </form>
      </div>
      {watchedIds === null ? (
        <aside className="anime-pending">
          <p>{messages.pending}</p>
          <p>{messages.pendingDescription}</p>
        </aside>
      ) : (
        <div className="anime-legend">
          <span><Icon name="check" width="15" height="15" />{messages.watched}</span>
          <span><span className="anime-unwatched-dot" aria-hidden="true" />{messages.unwatched}</span>
        </div>
      )}
      <div className="anime-years" aria-busy={isPending}>
        {groups.length === 0 ? <p className="anime-empty">{messages.empty}</p> : groups.map(({ year, entries: titles }) => (
          <section className="anime-year" key={year} aria-labelledby={`anime-year-${year}`}>
            <header className="anime-year-heading">
              <h2 id={`anime-year-${year}`}>{messages.year(year)}</h2>
              <span>{messages.total(titles.length)}</span>
            </header>
            <ul className="anime-grid">
              {titles.map((entry) => {
                const isWatched = watched.has(entry.id);
                const recordedDate = isWatched ? recordedDates[entry.id] : undefined;
                return (
                  <li key={entry.id} className={`anime-tile${isWatched ? " anime-tile-watched" : ""}`} data-anime-id={entry.id}>
                    {isWatched && <Icon className="anime-watched-check" name="check" width="16" height="16" />}
                    <span className="anime-tile-title">{entry.titles[locale]}</span>
                    {recordedDate && (
                      <time className="anime-recorded-date" dateTime={recordedDate}>
                        {messages.recordedOn(recordedDateFormat.format(new Date(`${recordedDate}T00:00:00+08:00`)))}
                      </time>
                    )}
                    {watchedIds !== null && <span className="anime-sr-only"> — {isWatched ? messages.watched : messages.unwatched}</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <footer className="anime-source">
        {years.length > 0 && <p>{messages.coverage(Math.min(...years), Math.max(...years))}</p>}
        <p>{messages.source}</p>
        <p className="anime-source-links">
          <a href="https://anime-sedai.egoist.dev/" target="_blank" rel="noreferrer">{messages.sourceSite}</a>
          <a href="https://github.com/egoist/anime-sedai" target="_blank" rel="noreferrer">{messages.sourceCode}</a>
        </p>
      </footer>
    </>
  );
}
