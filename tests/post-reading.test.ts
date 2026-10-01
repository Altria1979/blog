import assert from "node:assert/strict";
import test from "node:test";
import { imageUrl } from "../lib/image-assets.ts";
import { parsePost } from "../lib/posts.ts";

test("reading options preserve old posts and allow an explicit coverless story", () => {
  const old = parsePost("old", "---\ndate: 2026-09-30\n---\nHello");
  assert.equal(old?.type, "tech");
  assert.equal(old?.cover, imageUrl("/images/sea.jpg"));
  assert.equal(old?.license, undefined);
  const story = parsePost("story", "---\ndate: 2026-09-30\ntype: story\ncover: false\nlicense: 作者保留所有权利\n---\n正文");
  assert.equal(story?.cover, "");
  assert.equal(story?.type, "story");
  assert.equal(story?.license, "作者保留所有权利");
  assert.equal(parsePost("other", "---\ndate: 2026-09-30\ntype: unexpected\n---\n正文")?.type, "tech");
});
