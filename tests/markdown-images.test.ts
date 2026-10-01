import assert from "node:assert/strict";
import test from "node:test";
import { parseInline, parseMarkdown } from "../lib/markdown.ts";
import { getImageRow, groupImageParagraphs, splitImageRows } from "../lib/article-images.ts";

test("image-only paragraphs form rows without losing order or descriptions", () => {
  const images = getImageRow(parseInline(" ![书本](/books.webp)\n\t![校园](/campus.webp) "));
  assert.deepEqual(images, [
    { type: "image", src: "/books.webp", alt: "书本" },
    { type: "image", src: "/campus.webp", alt: "校园" },
  ]);
});

test("consecutive image paragraphs group automatically regardless of blank lines", () => {
  const blocks = parseMarkdown("![](/a.webp)\n![](/b.webp)\n\n![](/c.webp)\n\n![](/d.webp)\n![](/e.webp)\n![](/f.webp)");
  const original = JSON.stringify(blocks);
  const grouped = groupImageParagraphs(blocks);
  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].type === "paragraph" && getImageRow(grouped[0].children)?.length, 6);
  assert.equal(JSON.stringify(blocks), original, "rendering must not mutate the parsed content");
});

test("prose, image links, formatting and literal HTML keep their inline semantics", () => {
  for (const source of [
    "A photo ![](/a.webp) ![](/b.webp)",
    "[![](/a.webp)](/destination) ![](/b.webp)",
    "**![](/a.webp)** ![](/b.webp)",
    "<img src='/a.webp'> ![](/b.webp)",
    "![](/a.webp)",
    " ",
  ]) assert.equal(getImageRow(parseInline(source)), undefined, source);
});

test("unsafe URLs cannot create gallery images", () => {
  const nodes = parseInline("![unsafe](javascript:alert(1)) ![](/safe.webp)");
  assert.equal(getImageRow(nodes), undefined);
  assert.deepEqual(nodes.filter(node => node.type === "image").map(node => node.src), ["/safe.webp"]);
});

test("image groups work in lists and quotes without changing fenced code", () => {
  const [list, quote, code] = parseMarkdown("- ![](/a.webp)\n  ![](/b.webp)\n\n> ![](/c.webp)\n> ![](/d.webp)\n\n```md\n![](/e.webp)\n![](/f.webp)\n```");
  assert.equal(list.type, "list");
  assert.equal(quote.type, "blockquote");
  if (list.type !== "list" || quote.type !== "blockquote") return;
  const item = list.items[0][0];
  const quoted = quote.children[0];
  assert.equal(item.type === "paragraph" && getImageRow(item.children)?.length, 2);
  assert.equal(quoted.type === "paragraph" && getImageRow(quoted.children)?.length, 2);
  assert.equal(code.type, "code");
});

test("text, captions, headings and other blocks separate automatic image groups", () => {
  const pair = "![](/a.webp)\n\n![](/b.webp)";
  for (const boundary of ["说明文字", "## 标题", "> 题注", "- 列表", "---", "```md\n代码\n```", "| A |\n| --- |\n| B |", "[![](/link.webp)](/destination)"]) {
    const blocks = groupImageParagraphs(parseMarkdown(`${pair}\n\n${boundary}\n\n${pair}`));
    const rows = blocks.filter(block => block.type === "paragraph" && getImageRow(block.children));
    assert.equal(rows.length, 2, boundary);
    assert.equal(blocks.length, 3, boundary);
  }
});

test("a single photo stays independent and empty content stays empty", () => {
  const single = parseMarkdown("![独立图片](/one.webp)");
  assert.deepEqual(groupImageParagraphs(single), single);
  assert.deepEqual(groupImageParagraphs([]), []);
});

const landscape = { width: 1600, height: 1200 };
const portrait = { width: 900, height: 1600 };

test("rows automatically separate four landscape photos from three portrait photos", () => {
  const images = [landscape, landscape, landscape, landscape, portrait, portrait, portrait].map((size, id) => ({ ...size, id }));
  const rows = splitImageRows(images);
  assert.deepEqual(rows.map(row => row.length), [4, 3]);
  assert.deepEqual(rows.flat(), images);
  assert.deepEqual(splitImageRows([portrait, portrait, landscape, landscape]).map(row => row.length), [2, 2]);
});

test("long image runs balance into rows without dropping, reordering or orphaning photos", () => {
  for (const [count, expected] of [[5, [3, 2]], [7, [4, 3]], [9, [3, 3, 3]]] as const) {
    const images = Array.from({ length: count }, (_, id) => ({ ...landscape, id }));
    const rows = splitImageRows(images);
    assert.deepEqual(rows.map(row => row.length), expected);
    assert.deepEqual(rows.flat(), images);
  }
});

test("small mixed groups and images without metadata still get a usable layout", () => {
  assert.deepEqual(splitImageRows([portrait, landscape, portrait]).map(row => row.length), [3]);
  assert.deepEqual(splitImageRows([{}, {}, {}, {}, {}]).map(row => row.length), [3, 2]);
  assert.deepEqual(splitImageRows([]), []);
  assert.deepEqual(splitImageRows([portrait]), [[portrait]]);
});

test("inline icons and styled images stay out of automatic galleries", () => {
  const blocks = parseMarkdown('![icon](/images/icon.png){.icon}\n\n![Photo](/images/photo.jpg)');
  assert.equal(groupImageParagraphs(blocks).length, 2);
  const first = blocks[0];
  assert.ok(first.type === "paragraph");
  assert.equal(getImageRow(first.children), undefined);
});
