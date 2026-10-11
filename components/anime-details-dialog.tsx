"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./icon";
import type { Anime, AnimeWatchlist } from "@/lib/anime-shared";
import { getAnimeMessages } from "@/lib/anime-messages";
import { languageTag, type Locale } from "@/lib/i18n";

export function AnimeDetailsDialog({ entry, locale, watchlist, onClose }: {
  entry: Anime;
  locale: Locale;
  watchlist: AnimeWatchlist;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const sourceLink = useRef<HTMLAnchorElement>(null);
  const messages = getAnimeMessages(locale);
  const watched = watchlist.watchedIds?.includes(entry.id);
  const recordedDate = watched ? watchlist.recordedDates[entry.id] : undefined;
  const dateFormat = new Intl.DateTimeFormat(languageTag(locale), {
    timeZone: "Asia/Shanghai", year: "numeric", month: "long", day: "numeric",
  });
  const sourceUrl = entry.sourceUrl?.startsWith("https://") ? entry.sourceUrl : undefined;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    closeButton.current?.focus();
    const closeOnHistoryChange = () => element.close();
    window.addEventListener("popstate", closeOnHistoryChange);
    return () => window.removeEventListener("popstate", closeOnHistoryChange);
  }, []);

  function close() { dialog.current?.close(); }

  return <dialog ref={dialog} className="anime-details-dialog" aria-labelledby="anime-details-title" onClose={onClose}
    onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const first = closeButton.current;
      const last = sourceLink.current ?? first;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }}
    onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="anime-details-inner">
      <header className="anime-details-heading">
        <div>
          <p className="anime-details-eyebrow">{messages.details}{entry.format ? ` · ${messages.formats[entry.format]}` : ""}</p>
          <h2 id="anime-details-title">{entry.titles[locale]}</h2>
        </div>
        <button ref={closeButton} type="button" className="anime-details-close icon-button" aria-label={messages.closeDetails} onClick={close}>
          <Icon name="close" />
        </button>
      </header>
      <div className="anime-details-body">
        <div className={`anime-details-status${watched ? " anime-details-status-watched" : ""}`}>
          {watched && <Icon name="check" width="17" height="17" />}
          {watchlist.watchedIds === null ? messages.pending : watched ? messages.watched : messages.unwatched}
        </div>
        <dl className="anime-details-facts">
          <div><dt>{messages.releaseYear}</dt><dd>{messages.year(entry.year)}</dd></div>
          {watched && <div><dt>{messages.recordDate}</dt><dd>{recordedDate ? <time dateTime={recordedDate}>
            {dateFormat.format(new Date(`${recordedDate}T00:00:00+08:00`))}
          </time> : messages.unknownRecordDate}</dd></div>}
        </dl>
        <section className="anime-details-titles" aria-labelledby="anime-details-titles-label">
          <h3 id="anime-details-titles-label">{messages.originalTitles}</h3>
          <dl>{([["zh", "中文"], ["en", "English"], ["ja", "日本語"]] as const).map(([language, label]) =>
            <div key={language}><dt lang={languageTag(language)}>{label}</dt><dd lang={languageTag(language)}>{entry.titles[language]}</dd></div>,
          )}</dl>
        </section>
        {sourceUrl && <div className="anime-details-source">
          <a ref={sourceLink} href={sourceUrl} target="_blank" rel="noreferrer">{messages.viewSource}<Icon name="arrow" width="16" height="16" /></a>
          <p>{messages.sourceNote}</p>
        </div>}
      </div>
    </div>
  </dialog>;
}
