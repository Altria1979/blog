import assert from "node:assert/strict";
import test from "node:test";
import { loadAnimeCatalog, loadAnimeWatchlist, validateAnimeCatalog, validateAnimeWatchlist, validateWatchedIds } from "../lib/anime.ts";
import { groupAnimeByYear, parseAnimeRange, selectAnime, summarizeAnime, type Anime } from "../lib/anime-shared.ts";
import { getLocaleAlternates, locales, localePath, localeSwitchUrl } from "../lib/i18n.ts";
import { getAnimeMessages } from "../lib/anime-messages.ts";
import { getMessages } from "../lib/messages.ts";

const item = (year: number, suffix = "a"): Anime => ({ id: `anime-${year}-${suffix}`, year, titles: { zh: `动画 ${suffix}`, en: `Anime ${suffix}`, ja: `アニメ ${suffix}` } });

test("catalog rejects duplicate identity, invalid dates, missing translations and unsafe source links", () => {
  for (const entries of [
    {}, [item(2026), item(2026)], [{ ...item(2026), id: "动画" }],
    [item(2026.5)], [{ ...item(2026), titles: { zh: "动画", en: " ", ja: "アニメ" } }],
    [{ ...item(2026), sourceUrl: "javascript:alert(1)" }],
    [item(2026), { ...item(2026), id: "another-id" }],
  ]) assert.throws(() => validateAnimeCatalog(entries));
  assert.deepEqual(validateAnimeCatalog([item(2026), item(2006)]).map((entry) => entry.year), [2006, 2026]);
});

test("pending records differ from a deliberately empty list, and unknown or repeated IDs fail", () => {
  const catalog = [item(2025), item(2026)];
  assert.equal(validateWatchedIds({ watchedIds: null }, catalog), null);
  assert.deepEqual(validateWatchedIds({ watchedIds: [] }, catalog), []);
  for (const watchedIds of ["all", ["unknown"], [catalog[0].id, catalog[0].id]]) {
    assert.throws(() => validateWatchedIds({ watchedIds }, catalog));
  }
  assert.throws(() => validateWatchedIds({}, catalog));
  assert.deepEqual(summarizeAnime(catalog, null), { total: 2, watched: null });
  assert.deepEqual(summarizeAnime(catalog, []), { total: 2, watched: 0 });
  assert.deepEqual(summarizeAnime(catalog, [catalog[1].id]), { total: 2, watched: 1 });
});

test("ranges select the last distinct catalog years without clipping works or changing author records", () => {
  const catalog = Array.from({ length: 21 }, (_, index) => item(2006 + index));
  catalog.push(...Array.from({ length: 20 }, (_, index) => item(2026, `extra-${index}`)));
  const watched = [catalog[0].id, catalog[20].id];
  for (const range of ["5", "10", "15"] as const) {
    const selected = selectAnime(catalog, range);
    assert.equal(selected.length, Number(range) + 20);
    assert.deepEqual(groupAnimeByYear(selected).map((group) => group.year), Array.from({ length: Number(range) }, (_, index) => 2026 - index));
    assert.deepEqual(summarizeAnime(selected, watched), { total: Number(range) + 20, watched: 1 });
  }
  assert.equal(selectAnime(catalog, "all").length, 41);
  assert.equal(summarizeAnime(catalog, watched).watched, 2);
  assert.deepEqual(groupAnimeByYear([item(2006), item(2026)]).map((group) => group.year), [2026, 2006]);
  const sparse = [item(1980), item(2000), item(2020), item(2040), item(2060), item(2080)];
  assert.deepEqual(selectAnime(sparse, "5").map((entry) => entry.year), [2000, 2020, 2040, 2060, 2080]);
  assert.deepEqual(selectAnime([], "5"), []);
});

test("record dates are optional, calendar-valid, and belong only to watched entries", () => {
  const catalog = [item(2026)];
  const id = catalog[0].id;
  assert.deepEqual(validateAnimeWatchlist({ watchedIds: null }, catalog), { watchedIds: null, recordedDates: {} });
  assert.deepEqual(validateAnimeWatchlist({ watchedIds: [id] }, catalog), { watchedIds: [id], recordedDates: {} });
  for (const date of ["2026-10-11", "2024-02-29"]) {
    const records = { watchedIds: [id], recordedDates: { [id]: date } };
    assert.deepEqual(validateAnimeWatchlist(records, catalog), records);
  }
  for (const date of ["2026-02-29", "2026-04-31", "2026-00-10", "2026-13-01", "2026-10-00", "2026-10-32", "2026-1-1", "2026-10-11T00:00:00Z", 20261011, null]) {
    assert.throws(() => validateAnimeWatchlist({ watchedIds: [id], recordedDates: { [id]: date } }, catalog));
  }
  for (const recordedDates of [null, [], "2026-10-11", { unknown: "2026-10-11" }]) {
    assert.throws(() => validateAnimeWatchlist({ watchedIds: [id], recordedDates }, catalog));
  }
  for (const watchedIds of [null, []]) {
    assert.throws(() => validateAnimeWatchlist({ watchedIds, recordedDates: { [id]: "2026-10-11" } }, catalog));
  }
});

test("invalid ranges fall back to all, and language switches preserve the requested range", () => {
  for (const value of [undefined, null, "all", "", "0", "2026", "05", ["5", "10"]]) assert.equal(parseAnimeRange(value), "all");
  for (const range of ["5", "10", "15"] as const) assert.equal(parseAnimeRange(range), range);
  for (const locale of locales) {
    const path = localePath("/anime", locale);
    assert.deepEqual(getLocaleAlternates(path, {}), { zh: "/anime", en: "/en/anime", ja: "/ja/anime" });
    assert.equal(localeSwitchUrl(path, "?range=5", "#anime-year-2026"), `${path}?range=5#anime-year-2026`);
    const messages = getAnimeMessages(locale);
    assert.equal(messages.title, getMessages(locale).anime);
    assert.ok(messages.pending && messages.watched && messages.unwatched && messages.source);
    assert.ok(messages.total(1234).includes(new Intl.NumberFormat(locale).format(1234)));
  }
});

test("published catalog has complete translations, covers 2006–2026, and contains valid personal records", () => {
  const catalog = loadAnimeCatalog();
  assert.ok(catalog.length > 239);
  const years = new Set(catalog.map((entry) => entry.year));
  for (let year = 2006; year <= 2026; year++) assert.ok(years.has(year));
  for (const entry of catalog) for (const locale of locales) assert.ok(entry.titles[locale].trim(), `${entry.id}: ${locale}`);
  assert.doesNotThrow(() => loadAnimeWatchlist(catalog));
  assert.ok(catalog.filter((entry) => entry.year === 2026).every((entry) => entry.sourceUrl));
});
