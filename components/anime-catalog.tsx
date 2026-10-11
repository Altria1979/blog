"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "./icon";
import { AnimeDetailsDialog } from "./anime-details-dialog";
import {
  groupAnimeByYear, parseAnimeQuery, parseAnimeRange, parseAnimeStatus,
  selectAnimeEntries, summarizeAnime, type Anime, type AnimeWatchlist,
} from "@/lib/anime-shared";
import { getAnimeMessages } from "@/lib/anime-messages";
import { languageTag, localePath, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  catalog: Anime[];
  watchlist: AnimeWatchlist;
};

const previewCount = 12;

function subscribeToHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener("hashchange", listener);
    window.removeEventListener("popstate", listener);
  };
}

function AnimeYear({ year, entries, locale, watchlist, defaultOpen, showAllMatches, onSelect }: {
  year: number;
  entries: Anime[];
  locale: Locale;
  watchlist: AnimeWatchlist;
  defaultOpen: boolean;
  showAllMatches: boolean;
  onSelect: (entry: Anime, button: HTMLButtonElement) => void;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);
  const heading = useRef<HTMLButtonElement>(null);
  const messages = getAnimeMessages(locale);
  const watched = new Set(watchlist.watchedIds ?? []);
  const summary = summarizeAnime(entries, watchlist.watchedIds);
  const visibleEntries = showAllMatches || showAll ? entries : entries.slice(0, previewCount);
  const dateFormat = new Intl.DateTimeFormat(languageTag(locale), {
    timeZone: "Asia/Shanghai", year: "numeric", month: "short", day: "numeric",
  });

  function toggleAll() {
    setShowAll(!showAll);
    if (showAll) {
      requestAnimationFrame(() => {
        heading.current?.focus({ preventScroll: true });
        heading.current?.scrollIntoView({ block: "start" });
      });
    }
  }

  return (
    <section className="anime-year" aria-labelledby={`anime-year-${year}`}>
      <header className="anime-year-heading">
        <h2 id={`anime-year-${year}`}>
          <button ref={heading} type="button" className="anime-year-toggle" aria-expanded={expanded}
            aria-controls={`anime-year-content-${year}`} onClick={() => setExpanded(!expanded)}>
            <span className="anime-year-label">{messages.year(year)}</span>
            <span className="anime-year-summary">{messages.yearSummary(summary.watched, summary.total)}</span>
            <Icon className="anime-year-chevron" name="chevron" width="18" height="18" />
          </button>
        </h2>
      </header>
      <div className="anime-year-content" id={`anime-year-content-${year}`} hidden={!expanded}>
        {expanded && <>
          <ul className="anime-grid">
            {visibleEntries.map((entry) => {
              const isWatched = watched.has(entry.id);
              const recordedDate = isWatched ? watchlist.recordedDates[entry.id] : undefined;
              return (
                <li key={entry.id} className={`anime-tile${isWatched ? " anime-tile-watched" : ""}`} data-anime-id={entry.id}>
                  <button type="button" className="anime-tile-button" aria-label={messages.openDetails(entry.titles[locale])}
                    aria-haspopup="dialog" aria-describedby={`anime-meta-${entry.id}${recordedDate ? ` anime-date-${entry.id}` : ""}`}
                    onClick={(event) => onSelect(entry, event.currentTarget)}>
                    <span className="anime-tile-title">{entry.titles[locale]}</span>
                    <span className="anime-tile-meta" id={`anime-meta-${entry.id}`}>
                      {watchlist.watchedIds !== null && <span className="anime-tile-status">
                        {isWatched ? <Icon name="check" width="14" height="14" /> : <span className="anime-status-dot" aria-hidden="true" />}
                        {isWatched ? messages.watched : messages.unwatched}
                      </span>}
                      {entry.format && <span className="anime-tile-format">{messages.formats[entry.format]}</span>}
                    </span>
                    {recordedDate && <time className="anime-recorded-date" id={`anime-date-${entry.id}`} dateTime={recordedDate}>
                      {messages.recordedOn(dateFormat.format(new Date(`${recordedDate}T00:00:00+08:00`)))}
                    </time>}
                    <Icon className="anime-tile-arrow" name="arrow" width="16" height="16" />
                  </button>
                </li>
              );
            })}
          </ul>
          {!showAllMatches && entries.length > previewCount && <button type="button" className="anime-year-more" onClick={toggleAll}>
            {showAll ? messages.showLess : messages.showMore(entries.length - previewCount)}
            <Icon name="chevron" width="15" height="15" />
          </button>}
        </>}
      </div>
    </section>
  );
}

function AnimeYears({ entries, locale, watchlist, hash, showAllMatches, onSelect }: {
  entries: Anime[];
  locale: Locale;
  watchlist: AnimeWatchlist;
  hash: string;
  showAllMatches: boolean;
  onSelect: (entry: Anime, button: HTMLButtonElement) => void;
}) {
  const groups = groupAnimeByYear(entries);
  const requestedYear = /^#anime-year-(\d{4})$/.exec(hash)?.[1];
  const anchorYear = groups.some(({ year }) => String(year) === requestedYear) ? requestedYear : undefined;

  useEffect(() => {
    if (!anchorYear) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`anime-year-${anchorYear}`)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [anchorYear]);

  return <div className="anime-years">
    {groups.map(({ year, entries: titles }, index) => <AnimeYear key={year} year={year} entries={titles}
      locale={locale} watchlist={watchlist} defaultOpen={showAllMatches || String(year) === anchorYear || (!anchorYear && index === 0)}
      showAllMatches={showAllMatches} onSelect={onSelect} />)}
  </div>;
}

export function AnimeCatalog({ locale, catalog, watchlist }: Props) {
  const params = useSearchParams();
  function parameter(name: string) {
    const values = params.getAll(name);
    return values.length === 1 ? values[0] : values;
  }
  const range = parseAnimeRange(parameter("range"));
  const status = parseAnimeStatus(parameter("status"));
  const query = parseAnimeQuery(parameter("q"));
  const hasQuery = query.trim().length > 0;
  const showAllMatches = hasQuery || status === "watched";
  const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => "");
  const [compositionDraft, setCompositionDraft] = useState<string | null>(null);
  const [selected, setSelected] = useState<Anime | null>(null);
  const composing = useRef(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const selectedButton = useRef<HTMLButtonElement>(null);
  const messages = getAnimeMessages(locale);
  const entries = selectAnimeEntries(catalog, watchlist.watchedIds, { range, status, query });
  const summary = summarizeAnime(entries, watchlist.watchedIds);
  const years = catalog.map((entry) => entry.year);
  const path = localePath("/anime", locale);

  function updateFilters(changes: Record<string, string | null>, replace = false) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const search = next.toString();
    window.history[replace ? "replaceState" : "pushState"](null, "", `${path}${search ? `?${search}` : ""}`);
    // Native history updates search params in Next.js; hashchange needs explicit notification.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  function changeQuery(value: string) {
    updateFilters({ q: parseAnimeQuery(value) || null }, true);
  }

  function resetFilters() {
    composing.current = false;
    setCompositionDraft(null);
    updateFilters({ q: null, status: null, range: null });
    searchInput.current?.focus();
  }

  function selectEntry(entry: Anime, button: HTMLButtonElement) {
    selectedButton.current = button;
    setSelected(entry);
  }

  return (
    <>
      <div className="anime-toolbar">
        <p className="anime-summary" role="status" aria-live="polite" aria-atomic="true">
          {hasQuery ? messages.resultCount(summary.total) : summary.watched === null ? messages.total(summary.total) : messages.progress(summary.watched, summary.total)}
        </p>
        <div className="anime-controls">
          <form className="anime-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <Icon name="search" width="18" height="18" />
            <label className="anime-sr-only" htmlFor="anime-search">{messages.searchLabel}</label>
            <input ref={searchInput} id="anime-search" name="q" type="search" autoComplete="off" maxLength={120}
              placeholder={messages.searchPlaceholder} value={compositionDraft ?? query}
              onCompositionStart={(event) => { composing.current = true; setCompositionDraft(event.currentTarget.value); }}
              onCompositionEnd={(event) => { composing.current = false; setCompositionDraft(null); changeQuery(event.currentTarget.value); }}
              onChange={(event) => {
                if (composing.current) setCompositionDraft(event.target.value);
                else changeQuery(event.target.value);
              }} />
            {(compositionDraft ?? query).length > 0 && <button type="button" className="anime-search-clear" aria-label={messages.clearSearch}
              onClick={() => { setCompositionDraft(null); composing.current = false; changeQuery(""); searchInput.current?.focus(); }}>
              <Icon name="close" width="17" height="17" />
            </button>}
          </form>
          <div className="anime-status-tabs" role="group" aria-label={messages.browseAll}>
            <button type="button" aria-pressed={status === "all"} onClick={() => updateFilters({ status: null })}>{messages.browseAll}</button>
            <button type="button" aria-pressed={status === "watched"} onClick={() => updateFilters({ status: "watched" })}>{messages.watchedOnly}</button>
          </div>
          <div className="anime-filter">
            <label htmlFor="anime-range">{messages.range}</label>
            <select id="anime-range" name="range" value={range} disabled={hasQuery}
              aria-describedby={hasQuery ? "anime-search-hint" : undefined}
              onChange={(event) => updateFilters({ range: event.target.value === "all" ? null : event.target.value })}>
              {(["all", "5", "10", "15"] as const).map((value) => <option value={value} key={value}>{messages.ranges[value]}</option>)}
            </select>
          </div>
        </div>
        {hasQuery && <p className="anime-search-hint" id="anime-search-hint">{messages.searchAllYears}</p>}
      </div>
      {watchlist.watchedIds === null && <aside className="anime-pending">
        <p>{messages.pending}</p><p>{messages.pendingDescription}</p>
      </aside>}
      {entries.length ? <AnimeYears key={`${range}:${status}:${query}:${hash}`} entries={entries} locale={locale} watchlist={watchlist}
        hash={hash} showAllMatches={showAllMatches} onSelect={selectEntry} /> : <div className="anime-empty">
        <Icon name="search" width="28" height="28" />
        <h2>{hasQuery ? messages.noMatches : status === "watched" ? messages.noWatched : messages.empty}</h2>
        {(hasQuery || status === "watched") && <p>{messages.noMatchesDescription}</p>}
        <button type="button" onClick={resetFilters}>{messages.resetFilters}</button>
      </div>}
      <footer className="anime-source">
        {years.length > 0 && <p>{messages.coverage(Math.min(...years), Math.max(...years))}</p>}
        <p>{messages.source}</p>
        <p className="anime-source-links">
          <a href="https://anime-sedai.egoist.dev/" target="_blank" rel="noreferrer">{messages.sourceSite}</a>
          <a href="https://github.com/egoist/anime-sedai" target="_blank" rel="noreferrer">{messages.sourceCode}</a>
        </p>
      </footer>
      {selected && <AnimeDetailsDialog entry={selected} locale={locale} watchlist={watchlist} onClose={() => {
        const trigger = selectedButton.current;
        setSelected(null);
        requestAnimationFrame(() => {
          const target = trigger?.isConnected ? trigger : searchInput.current;
          target?.focus({ preventScroll: true });
        });
      }} />}
    </>
  );
}
