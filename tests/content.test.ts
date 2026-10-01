import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getCategories, getPost, getPosts, parsePost } from "../lib/posts.ts";
import {
  getHeadings,
  parseInline,
  parseMarkdown,
  safeUrl,
} from "../lib/markdown.ts";

const postSource = (
  metadata: string,
  content = "记录代码，也记录生活。 Hello Next.js.",
) => `---\n${metadata}\n---\n\n${content}`;

test("posts sort by date with deterministic ties and exclude drafts or invalid dates", () => {
  const directory = mkdtempSync(join(tmpdir(), "altria-posts-"));
  try {
    writeFileSync(
      join(directory, "old.md"),
      postSource("title: Old\ndate: 2025-01-01\ncategory: 生活"),
    );
    writeFileSync(
      join(directory, "b.md"),
      postSource("title: B\ndate: 2026-09-30\ncategory: 技术"),
    );
    writeFileSync(
      join(directory, "a.md"),
      postSource("title: A\ndate: 2026-09-30\ncategory: 技术"),
    );
    writeFileSync(
      join(directory, "draft.md"),
      postSource("title: Draft\ndate: 2026-10-01\ndraft: true"),
    );
    writeFileSync(
      join(directory, "invalid.md"),
      postSource("title: Invalid\ndate: 2026-02-30"),
    );
    assert.deepEqual(
      getPosts(directory).map((post) => post.slug),
      ["a", "b", "old"],
    );
    assert.deepEqual(getCategories(directory), [
      { name: "技术", count: 2 },
      { name: "生活", count: 1 },
    ]);
    assert.equal(getPost("draft", directory), undefined);
    assert.equal(getPost("../old", directory), undefined);
    assert.equal(getPost("/etc/passwd", directory), undefined);
    assert.equal(getPost("a", directory)?.title, "A");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("frontmatter parses quoted values, tags, reading time, and real calendar dates", () => {
  const post = parsePost(
    "hello",
    postSource(
      'title: "你好，博客"\ndescription: 记录代码，也记录生活。\ndate: 2024-02-29\ntags: Next.js, 生活, Next.js\nfeatured: true\ncover: /images/hello.svg',
    ),
  );
  assert.ok(post);
  assert.equal(post.title, "你好，博客");
  assert.deepEqual(post.tags, ["Next.js", "生活"]);
  assert.equal(post.featured, true);
  assert.equal(post.category, "随笔");
  assert.ok(post.wordCount > 0);
  assert.equal(post.readingMinutes, 1);
  assert.equal(parsePost("bad", postSource("date: 2025-02-29")), undefined);
  assert.equal(parsePost("bad", postSource("date: 2026-9-30")), undefined);
  assert.equal(parsePost("bad", postSource("date: 2026-13-01")), undefined);
});

test("headings share stable unique IDs including collisions and formatted Chinese titles", () => {
  const content =
    "# Hello\n\n## Hello\n\n## Hello-2\n\n## Hello\n\n## **你好**，`世界`\n\n> ### Hello";
  const headings = getHeadings(content);
  assert.deepEqual(
    headings.map((heading) => heading.id),
    ["hello", "hello-2", "hello-2-2", "hello-3", "你好-世界", "hello-4"],
  );
  assert.equal(headings[4].text, "你好，世界");
  assert.deepEqual(getHeadings(content), headings);
  assert.deepEqual(
    parseMarkdown(content)
      .filter((block) => block.type === "heading")
      .map((block) => block.id),
    headings.slice(0, 5).map((heading) => heading.id),
  );
});

test("dangerous link and image protocols render as text, while safe URLs are allowed", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "vbscript:hello",
    "//evil.example",
    "/\\evil.example",
    "https://good.example\u0000evil",
    "java\nscript:alert(1)",
  ]) {
    assert.equal(safeUrl(value), undefined, value);
  }
  for (const value of [
    "https://example.com",
    "http://example.com/a",
    "mailto:hello@example.com",
    "/posts/hello",
    "#你好",
  ]) {
    assert.equal(safeUrl(value), value);
  }
  const nodes = parseInline(
    "[unsafe](javascript:alert(1)) ![image](data:image/svg+xml,hello) [safe](/posts/hello)",
  );
  assert.deepEqual(
    nodes.filter((node) => node.type === "link").map((node) => node.href),
    ["/posts/hello"],
  );
  assert.equal(
    nodes.some((node) => node.type === "image"),
    false,
  );
  assert.deepEqual(parseInline("<script>alert(1)</script>"), [
    { type: "text", value: "<script>alert(1)</script>" },
  ]);
});

test("Markdown supports code, quotes, ordered and unordered lists, images, tables, and rules", () => {
  const blocks = parseMarkdown(
    "# Title\n\nA **bold** paragraph with `code` and [link](https://example.com).\n\n> A quote\n\n- One\n- Two\n\n3. Three\n4. Four\n\n```tsx\n<script>alert('literal')</script>\n```\n\n![Photo](/images/photo.jpg)\n\n| Name | Value |\n| :--- | ---: |\n| `a` | **b** |\n\n---",
  );
  assert.deepEqual(
    blocks.map((block) => block.type),
    [
      "heading",
      "paragraph",
      "blockquote",
      "list",
      "list",
      "code",
      "paragraph",
      "table",
      "hr",
    ],
  );
  const code = blocks.find((block) => block.type === "code");
  assert.equal(code?.value, "<script>alert('literal')</script>");
  const ordered = blocks.find(
    (block) => block.type === "list" && block.ordered,
  );
  assert.ok(ordered?.type === "list");
  assert.equal(ordered.start, 3);
  const table = blocks.find((block) => block.type === "table");
  assert.ok(table?.type === "table");
  assert.deepEqual(table.align, ["left", "right"]);
});
