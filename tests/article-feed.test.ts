import assert from "node:assert/strict";
import test from "node:test";
import { articlePage, paginationItems } from "../lib/article-feed.ts";

test("the feed fits ten articles before starting a second page", () => {
  for (const count of [0, 6, 10]) {
    assert.deepEqual(articlePage(count, null), {
      page: 1, pageCount: 1, start: 0, end: 10,
    });
  }
  const articles = Array.from({ length: 11 }, (_, index) => index);
  const first = articlePage(articles.length, "1");
  const second = articlePage(articles.length, "2");
  assert.equal(first.pageCount, 2);
  assert.deepEqual(articles.slice(first.start, first.end), articles.slice(0, 10));
  assert.deepEqual(articles.slice(second.start, second.end), [10]);
});

test("invalid page queries use the first page and excessive pages use the last", () => {
  for (const query of [null, "", "0", "-1", "1.5", "invalid", "Infinity"]) {
    assert.equal(articlePage(25, query).page, 1);
  }
  assert.deepEqual(articlePage(25, "99"), {
    page: 3, pageCount: 3, start: 20, end: 30,
  });
  assert.equal(articlePage(0, "99").page, 1);
});

test("long pagination keeps current and boundary pages without an unbounded button row", () => {
  assert.deepEqual(paginationItems(1, 1), [1]);
  assert.deepEqual(paginationItems(4, 7), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(paginationItems(1, 12), [1, 2, 3, 4, 5, "ellipsis", 12]);
  assert.deepEqual(paginationItems(7, 12), [1, "ellipsis", 5, 6, 7, 8, 9, "ellipsis", 12]);
  assert.deepEqual(paginationItems(12, 12), [1, "ellipsis", 8, 9, 10, 11, 12]);
});
