import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownBlocks } from "@/components/markdown";
import { ContentAnchorNavigation } from "@/components/markdown-interactions";
import { getDiaryEntries, getDiaryPage, type DiaryEntry } from "@/lib/diary";
import { getDiaryMessages } from "@/lib/diary-messages";
import { languageTag, localePath, type Locale } from "@/lib/i18n";
import { parseMarkdown, splitContentSlots } from "@/lib/markdown";
import { scopeMarkdownIds } from "@/lib/markdown-scope";
import "@/components/diary.css";

const timeZone = "Asia/Shanghai";

function groupByMonth(entries: DiaryEntry[]) {
  const monthKey = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "2-digit" });
  const groups = new Map<string, DiaryEntry[]>();
  for (const entry of entries) {
    const parts = monthKey.formatToParts(entry.timestamp);
    const key = `${parts.find((part) => part.type === "year")!.value}-${parts.find((part) => part.type === "month")!.value}`;
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }
  return [...groups];
}

export default function DiaryPage({ locale = "zh", pageValue }: { locale?: Locale; pageValue?: string | string[] }) {
  const result = getDiaryPage(getDiaryEntries(undefined, locale), pageValue);
  if (!result) notFound();
  const messages = getDiaryMessages(locale);
  const tag = languageTag(locale);
  const month = new Intl.DateTimeFormat(tag, { timeZone, year: "numeric", month: "long" });
  const day = new Intl.DateTimeFormat(tag, { timeZone, day: "2-digit" });
  const weekday = new Intl.DateTimeFormat(tag, { timeZone, weekday: "short" });
  const time = new Intl.DateTimeFormat(tag, { timeZone, hour: "numeric", minute: "2-digit" });
  const fullDate = new Intl.DateTimeFormat(tag, { timeZone, dateStyle: "full" });
  const fullDateTime = new Intl.DateTimeFormat(tag, { timeZone, dateStyle: "full", timeStyle: "short" });
  const pageHref = (page: number) => localePath(`/diary${page === 1 ? "" : `?page=${page}`}`, locale);

  return (
    <div className="diary-page">
      <header className="diary-header">
        <h1 className="page-heading">{messages.title}</h1>
        <p className="page-description">{messages.subtitle}</p>
      </header>
      <ContentAnchorNavigation />
      {result.entries.length === 0 ? (
        <p className="diary-empty">{messages.empty}</p>
      ) : (
        <div className="diary-timeline">
          {groupByMonth(result.entries).map(([key, entries]) => (
            <section className="diary-month" key={key} aria-labelledby={`diary-month-${key}`}>
              <h2 className="diary-month-heading" id={`diary-month-${key}`}>
                {month.format(entries[0].timestamp)}
              </h2>
              <ol className="diary-entries">
                {entries.map((entry) => {
                  const id = `diary-entry-${Buffer.from(entry.slug).toString("hex")}`;
                  const dateLabel = (entry.hasTime ? fullDateTime : fullDate).format(entry.timestamp);
                  const blocks = scopeMarkdownIds(splitContentSlots(parseMarkdown(entry.content)).body, id);
                  return (
                    <li className="diary-entry" id={id} key={entry.slug}>
                      <time className="diary-date" dateTime={entry.date} aria-label={dateLabel}>
                        <span className="diary-day" aria-hidden="true">{day.format(entry.timestamp)}</span>
                        <span className="diary-weekday" aria-hidden="true">{weekday.format(entry.timestamp)}</span>
                        {entry.hasTime && <span className="diary-time" aria-hidden="true">{time.format(entry.timestamp)}</span>}
                      </time>
                      <article className="diary-content" aria-label={entry.title || messages.entryLabel(dateLabel)}>
                        {entry.title && <h3 className="diary-entry-title">{entry.title}</h3>}
                        <div className="article reading-prose diary-body">
                          <MarkdownBlocks blocks={blocks} />
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
      {result.totalPages > 1 && (
        <nav className="diary-pagination" aria-label={messages.pagination}>
          {result.page > 1 ? (
            <Link rel="prev" href={pageHref(result.page - 1)}>{messages.previous}</Link>
          ) : <span className="diary-pagination-disabled" aria-disabled="true">{messages.previous}</span>}
          <span className="diary-page-number">{messages.pageLabel(result.page, result.totalPages)}</span>
          {result.page < result.totalPages ? (
            <Link rel="next" href={pageHref(result.page + 1)}>{messages.next}</Link>
          ) : <span className="diary-pagination-disabled" aria-disabled="true">{messages.next}</span>}
        </nav>
      )}
    </div>
  );
}
