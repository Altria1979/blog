import assert from "node:assert/strict";
import test from "node:test";
import { formatBlogAge, formatBlogWordCount, formatBuildAge } from "../lib/blog-stats.ts";

const now = (value: string) => Date.parse(value);

test("blog age shows complete calendar years and remaining months in all languages", () => {
  const current = now("2026-10-01T12:00:00+08:00");
  assert.equal(formatBlogAge("2021-12-01", current), "4年10个月");
  assert.equal(formatBlogAge("2021-12-02", current), "4年9个月");
  assert.equal(formatBlogAge("2021-12-01", current, "en"), "4 years 10 months");
  assert.equal(formatBlogAge("2025-09-01", current, "en"), "1 year 1 month");
  assert.equal(formatBlogAge("2021-12-01", current, "ja"), "4年10か月");
  assert.equal(formatBlogAge("2025-10-01", current), "1年");
});

test("blog age clamps month-end and leap-day anniversaries to the last calendar day", () => {
  assert.equal(formatBlogAge("2026-01-31", now("2026-02-27T23:59:59+08:00")), "27天");
  assert.equal(formatBlogAge("2026-01-31", now("2026-02-28T00:00:00+08:00")), "1个月");
  assert.equal(formatBlogAge("2026-01-31", now("2026-03-30T00:00:00+08:00")), "1个月");
  assert.equal(formatBlogAge("2026-01-31", now("2026-03-31T00:00:00+08:00")), "2个月");
  assert.equal(formatBlogAge("2024-02-29", now("2025-02-27T12:00:00+08:00")), "11个月");
  assert.equal(formatBlogAge("2024-02-29", now("2025-02-28T12:00:00+08:00")), "1年");
});

test("blog age changes at Shanghai midnight regardless of the timestamp's source zone", () => {
  assert.equal(formatBlogAge("2026-09-01", now("2026-09-30T15:59:59Z")), "29天");
  assert.equal(formatBlogAge("2026-09-01", now("2026-09-30T16:00:00Z")), "1个月");
  assert.equal(formatBlogAge("2026-09-30", now("2026-09-30T09:00:00-07:00")), "1天");
  assert.equal(formatBlogAge("2026-09-30", now("2026-10-01T00:00:00+08:00"), "en"), "1 day");
  assert.equal(formatBlogAge("2026-09-29", now("2026-10-01T00:00:00+08:00"), "en"), "2 days");
  assert.equal(formatBlogAge("2026-09-30", now("2026-10-01T00:00:00+08:00"), "ja"), "1日");
});

test("same-day and future blog starts never produce negative values", () => {
  const current = now("2026-10-01T12:00:00+08:00");
  for (const established of ["2026-10-01", "2026-10-02", "2028-01-01"]) {
    assert.equal(formatBlogAge(established, current), "不足1天");
    assert.equal(formatBlogAge(established, current, "en"), "Less than 1 day");
    assert.equal(formatBlogAge(established, current, "ja"), "1日未満");
  }
});

test("build recency uses complete elapsed units instead of calendar date boundaries", () => {
  const builtAt = "2026-09-30T23:59:30+08:00";
  const built = now(builtAt);
  assert.equal(formatBuildAge(builtAt, built + 59_999), "刚刚");
  assert.equal(formatBuildAge(builtAt, built + 60_000), "1分钟前");
  assert.equal(formatBuildAge(builtAt, built + 3_599_999), "59分钟前");
  assert.equal(formatBuildAge(builtAt, built + 3_600_000), "1小时前");
  assert.equal(formatBuildAge(builtAt, built + 86_399_999), "23小时前");
  assert.equal(formatBuildAge(builtAt, built + 86_400_000), "1天前");
  assert.equal(formatBuildAge("2026-09-30T15:59:30Z", built + 600_000), "10分钟前");
  assert.equal(formatBuildAge(builtAt, built - 86_400_000), "刚刚");
});

test("build recency supports English plurals and Japanese units", () => {
  const builtAt = "2026-10-01T00:00:00Z";
  const built = now(builtAt);
  for (const [duration, unit, japanese] of [
    [60_000, "minute", "分"], [3_600_000, "hour", "時間"], [86_400_000, "day", "日"],
  ] as const) {
    assert.equal(formatBuildAge(builtAt, built + duration, "en"), `1 ${unit} ago`);
    assert.equal(formatBuildAge(builtAt, built + duration * 2, "en"), `2 ${unit}s ago`);
    assert.equal(formatBuildAge(builtAt, built + duration, "ja"), `1${japanese}前`);
  }
  assert.equal(formatBuildAge(builtAt, built - 1, "en"), "Just now");
  assert.equal(formatBuildAge(builtAt, built - 1, "ja"), "たった今");
});

test("invalid calendar dates and clock values display an unavailable placeholder", () => {
  const current = now("2026-10-01T00:00:00Z");
  for (const date of ["", "not-a-date", "2026-02-29", "2026-02-30", "2026-13-01", "2026-1-01"]) {
    assert.equal(formatBlogAge(date, current), "—", date);
    assert.equal(formatBuildAge(`${date}T00:00:00Z`, current), "—", date);
  }
  assert.equal(formatBuildAge("2026-10-01T99:00:00Z", current), "—");
  for (const invalid of [NaN, Infinity, 9e15]) {
    assert.equal(formatBlogAge("2026-10-01", invalid), "—");
    assert.equal(formatBuildAge("2026-10-01T00:00:00Z", invalid), "—");
  }
});

test("blog totals retain locale formatting and use two decimal places in ten-thousands", () => {
  for (const locale of ["zh", "ja"] as const) {
    assert.equal(formatBlogWordCount(2084, locale), "2,084");
    assert.equal(formatBlogWordCount(9999, locale), "9,999");
    assert.equal(formatBlogWordCount(10000, locale), "1.00万");
    assert.equal(formatBlogWordCount(91900, locale), "9.19万");
    assert.equal(formatBlogWordCount(133000, locale), "13.30万");
  }
  assert.equal(formatBlogWordCount(2084, "en"), "2,084");
  assert.equal(formatBlogWordCount(91900, "en"), "91.9K");
  assert.equal(formatBlogWordCount(-1), "0");
  assert.equal(formatBlogWordCount(NaN), "—");
});
