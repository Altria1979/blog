import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getDiaryEntries, getDiaryPage, parseDiaryEntry } from "../lib/diary.ts";

const source = (metadata: string, content = "今天散步看到了晚霞。") => `---\n${metadata}\n---\n\n${content}`;

function fixture(run: (directory: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), "altria-diary-"));
  try { run(directory); } finally { rmSync(directory, { recursive: true, force: true }); }
}

test("diary supports optional titles, pure text, pure images, mixed and long Markdown", () => {
  for (const content of ["一句日记。", "![](/images/sunset.jpg)", "开头。\n\n![晚霞](/images/sunset.jpg)\n\n结尾。", "一段长日记。\n\n".repeat(500)]) {
    const entry = parseDiaryEntry("evening", source("date: 2026-10-11", content));
    assert.ok(entry);
    assert.equal(entry.content, content.trim());
    assert.equal(entry.title, undefined);
    assert.equal(entry.translationKey, "evening");
    assert.equal(entry.locale, "zh");
    assert.equal(entry.draft, false);
  }
  const entry = parseDiaryEntry("evening-en", source("date: 2026-10-11\ntitle: A quiet evening\ntranslationKey: evening\nlocale: en"), "en");
  assert.equal(entry?.title, "A quiet evening");
  assert.equal(entry?.translationKey, "evening");
  assert.equal(entry?.locale, "en");
});

test("date-only entries use Shanghai midnight and zoned times preserve their instant", () => {
  const day = parseDiaryEntry("day", source("date: 2024-02-29"));
  assert.equal(day?.timestamp, Date.parse("2024-02-28T16:00:00Z"));
  assert.equal(day?.date, "2024-02-29");
  assert.equal(day?.hasTime, false);
  for (const date of ["2026-10-11T08:30+08:00", "2026-10-11T00:30:00Z", "2026-10-10T20:30:00-04:00"]) {
    const entry = parseDiaryEntry("time", source(`date: ${date}`));
    assert.equal(entry?.timestamp, Date.parse("2026-10-11T00:30:00Z"));
    assert.equal(entry?.date, date);
    assert.equal(entry?.hasTime, true);
  }
  assert.equal(parseDiaryEntry("time", source("date: 2026-10-11T00:30:00.123Z"))?.timestamp, Date.parse("2026-10-11T00:30:00.123Z"));
});

test("invalid dates, missing timezone and invalid metadata never enter the public list", () => {
  for (const date of ["2025-02-29", "2026-02-30", "2026-04-31", "2026-00-01", "2026-13-01", "2026-01-00", "2026-1-01", "0000-01-01", "not-a-date", "2026-10-11T12:30", "2026-10-11 12:30:00+08:00", "2026-10-11T24:00:00Z", "2026-10-11T12:60:00Z", "2026-10-11T12:00:60Z", "2026-10-11T12:00:00+24:00", "2026-10-11T12:00:00+08:60"]) {
    assert.equal(parseDiaryEntry("invalid", source(`date: ${date}`)), undefined, date);
  }
  for (const metadata of ["title: Missing date", "date: true", "date: 2026-10-11\nlocale: en", "date: 2026-10-11\ndate: 2026-10-12"]) {
    assert.equal(parseDiaryEntry("invalid", source(metadata)), undefined, metadata);
  }
  assert.equal(parseDiaryEntry("invalid", "No frontmatter"), undefined);
});

test("drafts and empty rendered records are excluded while literal code stays valid", () => {
  for (const draft of ["true", '"TRUE"', '"true"']) {
    assert.equal(parseDiaryEntry("secret", source(`date: 2026-10-11\ndraft: ${draft}`)), undefined);
  }
  for (const content of ["", " \n\t", "<!-- private note -->", "<!-- note\nspanning lines -->\n\n<!-- second -->", "[unused]: https://example.com", "[^unused]: A note", "> <!-- note -->", "- <!-- note -->", "<span></span>", "##"]) {
    assert.equal(parseDiaryEntry("empty", source("date: 2026-10-11", content)), undefined, content);
  }
  assert.ok(parseDiaryEntry("code", source("date: 2026-10-11", "```html\n<!-- example -->\n```")));
  assert.ok(parseDiaryEntry("code", source("date: 2026-10-11", "`<!-- example -->`")));
});

test("loading sorts same-day entries and month boundaries deterministically, ignoring non-content files", () => fixture((directory) => {
  for (const [slug, date] of [["old", "2026-09-30T23:59:00+08:00"], ["b", "2026-10-01"], ["a", "2026-10-01"], ["evening", "2026-10-01T18:00:00+08:00"]]) {
    writeFileSync(join(directory, `${slug}.md`), source(`date: ${date}`));
  }
  writeFileSync(join(directory, "draft.md"), source("date: 2026-10-11\ndraft: true"));
  writeFileSync(join(directory, "invalid.md"), source("date: 2026-02-30"));
  writeFileSync(join(directory, "empty.md"), source("date: 2026-10-11", "<!-- not published -->"));
  writeFileSync(join(directory, ".hidden.md"), source("date: 2026-10-11"));
  writeFileSync(join(directory, "readme.txt"), source("date: 2026-10-11"));
  mkdirSync(join(directory, "folder.md"));
  assert.deepEqual(getDiaryEntries(directory).map((entry) => entry.slug), ["evening", "a", "b", "old"]);
}));

test("locales publish only their own translations, without fallback or draft leakage", () => fixture((directory) => {
  mkdirSync(join(directory, "en"));
  mkdirSync(join(directory, "ja"));
  writeFileSync(join(directory, "walk.md"), source("date: 2026-10-11\ntranslationKey: walk"));
  writeFileSync(join(directory, "only-zh.md"), source("date: 2026-10-10"));
  writeFileSync(join(directory, "en", "a-walk.md"), source("date: 2026-10-11\ntranslationKey: walk", "An evening walk."));
  writeFileSync(join(directory, "ja", "sanpo.md"), source("date: 2026-10-11\ntranslationKey: walk", "夜の散歩。"));
  writeFileSync(join(directory, "en", "draft.md"), source("date: 2026-10-10\ntranslationKey: only-zh\ndraft: true", "Secret draft"));
  assert.deepEqual(getDiaryEntries(directory).map((entry) => entry.slug), ["walk", "only-zh"]);
  assert.deepEqual(getDiaryEntries(directory, "en").map((entry) => entry.slug), ["a-walk"]);
  assert.deepEqual(getDiaryEntries(directory, "ja").map((entry) => entry.slug), ["sanpo"]);
  assert.equal(JSON.stringify(getDiaryEntries(directory, "en")).includes("Secret draft"), false);
}));

test("missing content directories and missing language translations return an empty list", () => fixture((directory) => {
  writeFileSync(join(directory, "only-zh.md"), source("date: 2026-10-11"));
  assert.deepEqual(getDiaryEntries(directory, "en"), []);
  assert.deepEqual(getDiaryEntries(join(directory, "missing")), []);
}));

test("duplicate published translations fail clearly even when loading another language", () => fixture((directory) => {
  mkdirSync(join(directory, "en"));
  for (const slug of ["first", "second"]) writeFileSync(join(directory, "en", `${slug}.md`), source("date: 2026-10-11\ntranslationKey: walk"));
  assert.throws(() => getDiaryEntries(directory), /Duplicate en diary translation: walk \(first, second\)/);
}));

test("published translation dates must agree but equivalent zones and drafts do not conflict", () => fixture((directory) => {
  mkdirSync(join(directory, "en"));
  mkdirSync(join(directory, "ja"));
  writeFileSync(join(directory, "walk.md"), source("date: 2026-10-11T08:30:00+08:00"));
  writeFileSync(join(directory, "en", "walk.md"), source("date: 2026-10-11T00:30:00Z"));
  writeFileSync(join(directory, "ja", "walk.md"), source("date: 2026-10-12\ndraft: true"));
  assert.equal(getDiaryEntries(directory, "en").length, 1);
  writeFileSync(join(directory, "ja", "walk.md"), source("date: 2026-10-12"));
  assert.throws(() => getDiaryEntries(directory), /Mismatched diary translation dates: walk/);
  writeFileSync(join(directory, "walk.md"), source("date: 2026-10-11"));
  writeFileSync(join(directory, "en", "walk.md"), source("date: 2026-10-11T00:00:00+08:00"));
  assert.throws(() => getDiaryEntries(directory), /Mismatched diary translation dates: walk/);
}));

test("pagination is ten entries per page with stable counts and no input mutation", () => {
  const entries = Array.from({ length: 23 }, (_, index) => parseDiaryEntry(`entry-${index}`, source("date: 2026-10-11"))!);
  const original = [...entries];
  assert.deepEqual(getDiaryPage(entries, undefined), { entries: entries.slice(0, 10), page: 1, totalPages: 3, totalCount: 23 });
  assert.deepEqual(getDiaryPage(entries, "2"), { entries: entries.slice(10, 20), page: 2, totalPages: 3, totalCount: 23 });
  assert.deepEqual(getDiaryPage(entries, "3"), { entries: entries.slice(20), page: 3, totalPages: 3, totalCount: 23 });
  assert.deepEqual(entries, original);
  assert.equal(getDiaryPage(entries.slice(0, 10), "2"), undefined);
  assert.deepEqual(getDiaryPage([], undefined), { entries: [], page: 1, totalPages: 1, totalCount: 0 });
  assert.deepEqual(getDiaryPage([], "1"), getDiaryPage([], undefined));
  assert.equal(getDiaryPage([], "2"), undefined);
});

test("pagination rejects duplicate, malformed, unsafe and out-of-range page values", () => {
  const entries = [parseDiaryEntry("one", source("date: 2026-10-11"))!];
  for (const value of ["", "0", "-1", "+1", "01", "1.0", "1.5", "1e0", " 1", "1 ", "NaN", "Infinity", "9007199254740992", "2", [], ["1"], ["1", "2"]]) {
    assert.equal(getDiaryPage(entries, value), undefined, JSON.stringify(value));
  }
});
