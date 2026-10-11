import type { Locale } from "./i18n";

export type Anime = {
  id: string;
  year: number;
  titles: Record<Locale, string>;
  format?: "movie" | "theatrical";
  sourceUrl?: string;
};
export type AnimeRange = "all" | "5" | "10" | "15";
export type AnimeStatus = "all" | "watched";
export type AnimeFilters = { range: AnimeRange; status: AnimeStatus; query: string };
export type AnimeWatchlist = {
  watchedIds: string[] | null;
  recordedDates: Record<string, string>;
};

export function parseAnimeRange(value: string | string[] | undefined | null): AnimeRange {
  return value === "5" || value === "10" || value === "15" ? value : "all";
}

export function parseAnimeStatus(value?: string | string[] | null): AnimeStatus {
  return value === "watched" ? "watched" : "all";
}

export function parseAnimeQuery(value?: string | string[] | null): string {
  return typeof value === "string" ? value.slice(0, 120) : "";
}

/** Use catalog years, so a static catalog never goes empty as the calendar advances. */
export function selectAnime(catalog: Anime[], range: AnimeRange): Anime[] {
  if (range === "all") return catalog;
  const years = [...new Set(catalog.map((entry) => entry.year))].sort((a, b) => a - b);
  const selected = new Set(years.slice(-Number(range)));
  return catalog.filter((entry) => selected.has(entry.year));
}

/** Search every title translation, including years outside the current range. */
export function selectAnimeEntries(catalog: Anime[], watchedIds: string[] | null, filters: AnimeFilters): Anime[] {
  const query = parseAnimeQuery(filters.query).normalize("NFKC").trim().toLowerCase();
  const terms = query ? query.split(/\s+/) : [];
  const watched = new Set(watchedIds ?? []);
  const entries = terms.length ? catalog : selectAnime(catalog, filters.range);
  return entries.filter((entry) => {
    if (filters.status === "watched" && !watched.has(entry.id)) return false;
    const titles = Object.values(entry.titles).join(" ").normalize("NFKC").toLowerCase();
    return terms.every((term) => titles.includes(term));
  });
}

export function groupAnimeByYear(catalog: Anime[]): { year: number; entries: Anime[] }[] {
  const groups = new Map<number, Anime[]>();
  for (const entry of catalog) {
    const group = groups.get(entry.year);
    if (group) group.push(entry);
    else groups.set(entry.year, [entry]);
  }
  return [...groups].sort(([a], [b]) => b - a).map(([year, entries]) => ({ year, entries }));
}

export function summarizeAnime(catalog: Anime[], watchedIds: string[] | null) {
  const watched = watchedIds === null ? null : new Set(watchedIds);
  return { total: catalog.length, watched: watched === null ? null : catalog.filter((entry) => watched.has(entry.id)).length };
}
