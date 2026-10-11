import assert from "node:assert/strict";
import test from "node:test";
import { parseMarkdown, type MarkdownBlock } from "../lib/markdown.ts";
import { scopeMarkdownIds } from "../lib/markdown-scope.ts";

test("the same heading and fragment link remain local to each diary entry", () => {
  const source = parseMarkdown("## A day\n\n[Back](#a-day)");
  const first = scopeMarkdownIds(source, "diary-first");
  const second = scopeMarkdownIds(source, "diary-second");
  for (const [blocks, scope] of [[first, "diary-first"], [second, "diary-second"]] as const) {
    assert.ok(blocks[0].type === "heading");
    assert.equal(blocks[0].id, `${scope}-a-day`);
    assert.ok(blocks[1].type === "paragraph" && blocks[1].children[0].type === "link");
    assert.equal(blocks[1].children[0].href, `#${scope}-a-day`);
  }
  assert.deepEqual(source, parseMarkdown("## A day\n\n[Back](#a-day)"));
});

test("footnote references, generated backlinks and explicit links share scoped IDs", () => {
  const source = parseMarkdown("First[^note], again[^note].\n\n[^note]: A note.");
  const note = source.find((block) => block.type === "footnote-definition");
  assert.ok(note);
  source.push(...parseMarkdown(`[Note](#fn-${note.id}) [First](#fnref-${note.id}-1) [Second](#fnref-${note.id}-2)`));
  const blocks = scopeMarkdownIds(source, "entry");
  const scopedNote = blocks.find((block) => block.type === "footnote-definition");
  assert.ok(scopedNote);
  assert.equal(scopedNote.id, `entry-${note.id}`);
  assert.equal(scopedNote.references, 2);
  assert.ok(blocks[0].type === "paragraph");
  const refs = blocks[0].children.filter((node) => node.type === "footnote-reference");
  assert.deepEqual(refs.map((node) => [node.id, node.reference]), [[scopedNote.id, 1], [scopedNote.id, 2]]);
  const links = blocks.at(-1);
  assert.ok(links?.type === "paragraph");
  assert.deepEqual(links.children.filter((node) => node.type === "link").map((node) => node.href), [
    `#fn-${scopedNote.id}`, `#fnref-${scopedNote.id}-1`, `#fnref-${scopedNote.id}-2`,
  ]);
});

test("custom IDs and links are scoped through lists, tables, nested inline nodes and MDC slots", () => {
  const source = parseMarkdown('::details{id="details"}\n- **[Paragraph](#paragraph)**\n\n| Heading |\n| --- |\n| [Details](#details) |\n\n#title\nA :badge[Title]{id="label"}\n::\n\nText\n\nA :badge[Label]{link="#label"}');
  assert.ok(source[1].type === "paragraph");
  source[1].attrs = { id: "paragraph" };
  const blocks = scopeMarkdownIds(source, "entry");
  const details = blocks[0];
  assert.ok(details.type === "component");
  assert.equal(details.props.id, "entry-details");
  const list = details.children[0];
  assert.ok(list.type === "list");
  const paragraph = list.items[0][0];
  assert.ok(paragraph.type === "paragraph");
  const strong = paragraph.children[0];
  assert.ok(strong.type === "strong" && strong.children[0].type === "link");
  assert.equal(strong.children[0].href, "#entry-paragraph");
  const table = details.children[1];
  assert.ok(table.type === "table" && table.rows[0][0][0].type === "link");
  assert.equal(table.rows[0][0][0].href, "#entry-details");
  const slot = details.slots.title[0];
  assert.ok(slot.type === "paragraph" && slot.children[1].type === "component");
  assert.equal(slot.children[1].props.id, "entry-label");
  const badge = blocks.at(-1);
  assert.ok(badge?.type === "paragraph" && badge.children[1].type === "component");
  assert.equal(badge.children[1].props.link, "#entry-label");
});

test("encoded known fragments resolve while external, unknown and malformed links stay unchanged", () => {
  const source: MarkdownBlock[] = [
    { type: "paragraph", attrs: { id: "夏の日" }, children: [] },
    ...parseMarkdown("[Encoded](#%E5%A4%8F%E3%81%AE%E6%97%A5) [Missing](#missing) [External](https://example.com/#%E5%A4%8F%E3%81%AE%E6%97%A5) [Other page](/posts/one#夏の日) [Malformed](#%ZZ)"),
  ];
  const blocks = scopeMarkdownIds(source, "entry");
  assert.ok(blocks[1].type === "paragraph");
  assert.deepEqual(blocks[1].children.filter((node) => node.type === "link").map((node) => node.href), [
    `#${encodeURIComponent("entry-夏の日")}`, "#missing", "https://example.com/#%E5%A4%8F%E3%81%AE%E6%97%A5", "/posts/one#夏の日", "#%ZZ",
  ]);
});

test("the effective heading ID wins over attrs.id and scoping never mutates the source tree", () => {
  const source: MarkdownBlock[] = [
    { type: "heading", id: "actual", attrs: { id: "ignored", class: "title" }, level: 2, text: "Title", children: [{ type: "text", value: "Title" }] },
    ...parseMarkdown("[Actual](#actual) [Ignored](#ignored)"),
  ];
  const before = structuredClone(source);
  const freeze = (value: unknown) => {
    if (value && typeof value === "object") {
      Object.freeze(value);
      Object.values(value).forEach(freeze);
    }
  };
  freeze(source);
  const scoped = scopeMarkdownIds(source, "entry");
  assert.deepEqual(source, before);
  assert.ok(scoped[0].type === "heading");
  assert.equal(scoped[0].id, "entry-actual");
  assert.deepEqual(scoped[0].attrs, { id: "entry-ignored", class: "title" });
  assert.ok(scoped[1].type === "paragraph");
  assert.deepEqual(scoped[1].children.filter((node) => node.type === "link").map((node) => node.href), ["#entry-actual", "#ignored"]);
});

test("feed entries scope their DOM IDs but video IDs retain their media identity", () => {
  const source: MarkdownBlock[] = [
    { type: "component", name: "feed-group", props: { entries: [{ id: 12, link: "#12" }] }, children: [], slots: {} },
    { type: "component", name: "video-embed", props: { id: "BV1example", type: "bilibili" }, children: [], slots: {} },
  ];
  const blocks = scopeMarkdownIds(source, "entry");
  assert.ok(blocks[0].type === "component" && blocks[1].type === "component");
  assert.deepEqual(blocks[0].props.entries, [{ id: "entry-12", link: "#entry-12" }]);
  assert.equal(blocks[1].props.id, "BV1example");
  assert.deepEqual(source[0], { type: "component", name: "feed-group", props: { entries: [{ id: 12, link: "#12" }] }, children: [], slots: {} });
});
