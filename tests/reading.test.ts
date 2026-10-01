import assert from "node:assert/strict";
import test from "node:test";
import { activeHeadingIds, articleProgress, currentHeadingId, matchesArticlePath } from "../lib/reading.ts";

test("reading routes recognize Unicode slugs and reject malformed or unknown paths", () => {
  assert.equal(matchesArticlePath("/posts/hello", "/posts/hello"), true);
  assert.equal(matchesArticlePath("/posts/%E4%BD%A0%E5%A5%BD", "/posts/你好"), true);
  assert.equal(matchesArticlePath("/posts/missing", "/posts/hello"), false);
  assert.equal(matchesArticlePath("/posts/%E4", "/posts/hello"), false);
});

test("active TOC includes enclosing sections but not earlier siblings", () => {
  const headings = [
    { id: "intro", text: "引子", level: 2 },
    { id: "first", text: "第一步", level: 3 },
    { id: "detail", text: "细节", level: 4 },
    { id: "second", text: "第二步", level: 3 },
    { id: "next", text: "下一节", level: 2 },
    { id: "skipped", text: "跨层级", level: 4 },
  ];
  assert.deepEqual(activeHeadingIds(headings, "detail"), ["intro", "first", "detail"]);
  assert.deepEqual(activeHeadingIds(headings, "second"), ["intro", "second"]);
  assert.deepEqual(activeHeadingIds(headings, "skipped"), ["next", "skipped"]);
  assert.deepEqual(activeHeadingIds(headings, null), []);
  assert.deepEqual(activeHeadingIds(headings, "missing"), []);
  assert.deepEqual(activeHeadingIds([], "missing"), []);
});

test("the final visible section activates when page-end clamps anchor scrolling", () => {
  const positions = [
    { id: "previous", top: 60 },
    { id: "last", top: 340 },
    { id: "below", top: 1000 },
  ];
  assert.equal(currentHeadingId(positions, 120, 900, false), "previous");
  assert.equal(currentHeadingId(positions, 120, 900, true), "last");
  assert.equal(currentHeadingId([{ id: "first", top: 340 }], 120, 900, false), null);
  assert.equal(currentHeadingId([], 120, 900, true), null);
});

test("reading progress uses only body entry and body bottom, including short articles", () => {
  assert.equal(articleProgress(1000, 2000, 900), 0);
  assert.equal(articleProgress(900, 2000, 900), 0);
  assert.equal(articleProgress(-100, 2000, 900), 0.5);
  assert.equal(articleProgress(-1100, 2000, 900), 1);
  assert.equal(articleProgress(-2000, 2000, 900), 1);
  assert.equal(articleProgress(700, 200, 900), 1);
  assert.equal(articleProgress(100, 0, 900), 0);
  assert.equal(articleProgress(100, 200, 0), 0);
});
