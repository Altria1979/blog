import { readFileSync } from "node:fs";
import path from "node:path";
import { locales } from "./i18n";
import type { Anime, AnimeWatchlist } from "./anime-shared";

export type { Anime, AnimeRange, AnimeWatchlist } from "./anime-shared";

const contentDirectory = path.join(process.cwd(), "content", "anime");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateAnimeCatalog(value: unknown): Anime[] {
  if (!Array.isArray(value)) throw new Error("Anime catalog must be an array");
  const ids = new Set<string>();
  const titles = new Set<string>();
  return value.map((entry, index): Anime => {
    if (!isRecord(entry) || typeof entry.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
      throw new Error(`Anime entry ${index} requires a stable ASCII id`);
    }
    if (ids.has(entry.id)) throw new Error(`Duplicate anime id: ${entry.id}`);
    ids.add(entry.id);
    if (typeof entry.year !== "number" || !Number.isInteger(entry.year) || entry.year < 1900 || entry.year > 2100) {
      throw new Error(`Invalid anime year: ${entry.id}`);
    }
    const names = entry.titles;
    if (!isRecord(names) || locales.some((locale) => typeof names[locale] !== "string" || !String(names[locale]).trim())) {
      throw new Error(`Missing anime translation: ${entry.id}`);
    }
    const titleKey = `${entry.year}:${String(names.ja).normalize("NFKC").trim()}`;
    if (titles.has(titleKey)) throw new Error(`Duplicate anime title in ${entry.year}: ${names.ja}`);
    titles.add(titleKey);
    if (entry.sourceUrl !== undefined) {
      if (typeof entry.sourceUrl !== "string" || !URL.canParse(entry.sourceUrl) || new URL(entry.sourceUrl).protocol !== "https:") {
        throw new Error(`Invalid anime source URL: ${entry.id}`);
      }
    }
    return {
      id: entry.id, year: entry.year,
      titles: { zh: String(names.zh).trim(), en: String(names.en).trim(), ja: String(names.ja).trim() },
      ...(typeof entry.sourceUrl === "string" ? { sourceUrl: entry.sourceUrl } : {}),
    };
  }).sort((a, b) => a.year - b.year);
}

export function validateWatchedIds(value: unknown, catalog: Anime[]): string[] | null {
  if (!isRecord(value) || !("watchedIds" in value)) throw new Error("Anime records require watchedIds (null or an array of IDs)");
  if (value.watchedIds === null) return null;
  if (!Array.isArray(value.watchedIds)) throw new Error("watchedIds must be null or an array");
  const available = new Set(catalog.map((entry) => entry.id));
  const seen = new Set<string>();
  return value.watchedIds.map((id) => {
    if (typeof id !== "string" || !available.has(id)) throw new Error(`Unknown watched anime id: ${String(id)}`);
    if (seen.has(id)) throw new Error(`Duplicate watched anime id: ${id}`);
    seen.add(id);
    return id;
  });
}

export function loadAnimeCatalog(directory = contentDirectory): Anime[] {
  return validateAnimeCatalog(JSON.parse(readFileSync(path.join(directory, "catalog.json"), "utf8")));
}

export function validateAnimeWatchlist(value: unknown, catalog: Anime[]): AnimeWatchlist {
  const watchedIds = validateWatchedIds(value, catalog);
  const dates = (value as Record<string, unknown>).recordedDates;
  if (dates === undefined) return { watchedIds, recordedDates: {} };
  if (!isRecord(dates)) throw new Error("recordedDates must map watched anime IDs to YYYY-MM-DD dates");
  const watched = new Set(watchedIds ?? []);
  const recordedDates = Object.fromEntries(Object.entries(dates).map(([id, date]) => {
    if (!watched.has(id)) throw new Error(`Record date requires a watched anime id: ${id}`);
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`Invalid anime record date: ${id}`);
    }
    const timestamp = Date.parse(`${date}T00:00:00Z`);
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
      throw new Error(`Invalid anime record date: ${id}`);
    }
    return [id, date];
  }));
  return { watchedIds, recordedDates };
}

export function loadAnimeWatchlist(catalog: Anime[], directory = contentDirectory): AnimeWatchlist {
  return validateAnimeWatchlist(JSON.parse(readFileSync(path.join(directory, "watched.json"), "utf8")), catalog);
}
