import assert from "node:assert/strict";
import test from "node:test";
import { loadAnimeCatalog, loadAnimeWatchlist, validateAnimeCatalog, validateAnimeWatchlist, validateWatchedIds } from "../lib/anime.ts";
import { groupAnimeByYear, parseAnimeQuery, parseAnimeRange, parseAnimeStatus, selectAnime, selectAnimeEntries, summarizeAnime, type Anime } from "../lib/anime-shared.ts";
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

test("catalog preserves verified film formats while leaving legacy titles unclassified", () => {
  const original = item(2020);
  const movie = { ...item(2021), format: "movie" };
  const theatrical = { ...item(2022), format: "theatrical" };
  const catalog = validateAnimeCatalog([original, movie, theatrical]);
  assert.deepEqual(catalog, [original, movie, theatrical]);
  assert.ok(!Object.hasOwn(catalog[0], "format"));
  for (const format of [null, "", "tv", "Movie", [], 1]) {
    assert.throws(() => validateAnimeCatalog([{ ...original, format }]), /Invalid anime format/);
  }
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

test("title search normalizes width and case and requires every word across all translations", () => {
  const catalog: Anime[] = [
    { id: "movie-old", year: 2006, titles: { zh: "凉宫春日的忧郁", en: "The Melancholy of Haruhi Suzumiya", ja: "涼宮ハルヒの憂鬱" } },
    { id: "movie-current", year: 2026, titles: { zh: "超辉夜姬！", en: "Cosmic Princess Kaguya!", ja: "超かぐや姫！" } },
    { id: "movie-other", year: 2026, titles: { zh: "另一个故事", en: "Another Princess", ja: "別の物語" } },
  ];
  const before = structuredClone(catalog);
  for (const query of ["凉宫", "HARUHI", "涼宮ハルヒ", "ＨＡＲＵＨＩ　ＳＵＺＵＭＩＹＡ", " Suzumiya   melancholy ", "凉宫 HARUHI"]) {
    assert.deepEqual(selectAnimeEntries(catalog, null, { range: "all", status: "all", query }), [catalog[0]], query);
  }
  assert.deepEqual(selectAnimeEntries(catalog, null, { range: "all", status: "all", query: "princess COSMIC" }), [catalog[1]]);
  assert.deepEqual(selectAnimeEntries(catalog, null, { range: "all", status: "all", query: "haruhi princess" }), []);
  assert.deepEqual(selectAnimeEntries(catalog, null, { range: "all", status: "all", query: "unknown" }), []);
  assert.deepEqual(catalog, before);
});

test("search reaches older years and watched filters combine without changing catalog or records", () => {
  const catalog = Array.from({ length: 21 }, (_, index) => item(2006 + index, index === 0 ? "old" : `recent-${index}`));
  catalog.push(item(2026, "other"));
  const watched = [catalog[0].id, catalog[20].id, catalog[21].id];
  const originalCatalog = structuredClone(catalog);
  const originalWatched = [...watched];
  assert.deepEqual(selectAnimeEntries(catalog, watched, { range: "5", status: "all", query: "old" }), [catalog[0]]);
  assert.deepEqual(selectAnimeEntries(catalog, watched, { range: "5", status: "watched", query: "old" }), [catalog[0]]);
  assert.deepEqual(selectAnimeEntries(catalog, watched, { range: "5", status: "watched", query: "recent-19" }), []);
  assert.deepEqual(selectAnimeEntries(catalog, watched, { range: "5", status: "watched", query: "  　 " }), catalog.slice(20));
  assert.deepEqual(selectAnimeEntries(catalog, watched, { range: "5", status: "all", query: "" }), catalog.slice(16));
  for (const ids of [null, []]) {
    assert.deepEqual(selectAnimeEntries(catalog, ids, { range: "all", status: "watched", query: "" }), []);
    assert.deepEqual(selectAnimeEntries(catalog, ids, { range: "5", status: "watched", query: "old" }), []);
    assert.equal(selectAnimeEntries(catalog, ids, { range: "all", status: "all", query: "" }).length, catalog.length);
  }
  assert.deepEqual(catalog, originalCatalog);
  assert.deepEqual(watched, originalWatched);
});

test("query and status parameters reject duplicates and preserve editing spaces within a bounded query", () => {
  assert.equal(parseAnimeStatus("watched"), "watched");
  for (const value of [undefined, null, "all", "", "Watched", "unwatched", ["watched"], ["all", "watched"]]) {
    assert.equal(parseAnimeStatus(value), "all");
  }
  for (const value of [undefined, null, ["haruhi"], ["haruhi", "kaguya"]]) assert.equal(parseAnimeQuery(value), "");
  assert.equal(parseAnimeQuery(" ＨＡＲＵＨＩ "), " ＨＡＲＵＨＩ ");
  assert.equal(parseAnimeQuery("haruhi "), "haruhi ");
  assert.equal(parseAnimeQuery("a".repeat(121)), "a".repeat(120));
  assert.equal(parseAnimeQuery(""), "");
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
    const params = new URLSearchParams({ range: "5", status: "watched", q: "凉宫 Haruhi" });
    assert.equal(localeSwitchUrl(path, `?${params}`, "#anime-year-2006"), `${path}?${params}#anime-year-2006`);
    const messages = getAnimeMessages(locale);
    assert.equal(messages.title, getMessages(locale).anime);
    assert.ok(messages.pending && messages.watched && messages.unwatched && messages.source);
    assert.ok(messages.total(1234).includes(new Intl.NumberFormat(locale).format(1234)));
    for (const key of ["browseAll", "watchedOnly", "searchLabel", "searchPlaceholder", "searchAllYears", "clearSearch", "resetFilters", "noMatches", "noMatchesDescription", "noWatched", "showLess", "details", "closeDetails", "viewSource", "sourceNote", "originalTitles", "releaseYear", "recordDate", "unknownRecordDate"] as const) assert.ok(messages[key].trim(), `${locale}: ${key}`);
    assert.ok(messages.resultCount(1234).includes(new Intl.NumberFormat(locale).format(1234)));
    assert.ok(messages.yearSummary(null, 1234).includes(new Intl.NumberFormat(locale).format(1234)));
    assert.ok(messages.yearSummary(1, 2).includes("1"));
    assert.ok(messages.showMore(1234).includes(new Intl.NumberFormat(locale).format(1234)));
    assert.ok(messages.openDetails("Test title").includes("Test title"));
    assert.ok(messages.formats.movie && messages.formats.theatrical);
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

test("the 2026 film additions distinguish films from episodic theatrical releases", () => {
  const catalog = loadAnimeCatalog();
  const theatrical = new Set([39, 42, 44, 49]);
  for (let index = 36; index <= 49; index++) {
    const id = `anime-2026-${String(index).padStart(3, "0")}`;
    assert.equal(catalog.find((entry) => entry.id === id)?.format, theatrical.has(index) ? "theatrical" : "movie", id);
  }
  assert.equal(catalog.find((entry) => entry.id === "anime-2026-011")?.format, undefined);
});
