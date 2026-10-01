import assert from "node:assert/strict";
import test from "node:test";
import { extractPlainText, getHeadings, inlineText, parseInline, parseMarkdown, sanitizeContentProps, splitContentSlots } from "../lib/markdown.ts";

test("CommonMark and GFM preserve task lists, references, breaks and strikethrough", () => {
  const blocks = parseMarkdown("Setext heading\n===\n\n- [x] finished\n- [ ] pending\n- ordinary\n\n~~old~~  \nnew [reference][target] https://example.com\n\n[target]: /posts/hello \"A title\"");
  assert.equal(blocks[0].type, "heading");
  const list = blocks.find((block) => block.type === "list");
  assert.deepEqual(list?.checked, [true, false, null]);
  const paragraph = blocks.find((block) => block.type === "paragraph");
  assert.ok(paragraph);
  assert.equal(paragraph.children[0].type, "delete");
  assert.ok(paragraph.children.some((node) => node.type === "break"));
  assert.deepEqual(paragraph.children.filter((node) => node.type === "link").map((node) => node.href), ["/posts/hello", "https://example.com"]);
});

test("MDC uses static JSON and YAML props with nested components and named slots", () => {
  const [tab] = parseMarkdown('::tab{:tabs=\'["One","Two"]\' active="2"}\n#tab1\n## First\n\n:::alert{type="warning"}\nRead **carefully**.\n:::\n#tab2\n## Second\n::');
  assert.equal(tab.type, "component");
  if (tab.type !== "component") return;
  assert.equal(tab.name, "tab");
  assert.deepEqual(tab.props.tabs, ["One", "Two"]);
  assert.equal(tab.props.active, "2");
  assert.deepEqual(Object.keys(tab.slots), ["tab1", "tab2"]);
  assert.equal(tab.slots.tab1[1].type, "component");
  const [card] = parseMarkdown("::link-card\n---\ntitle: An example\nlink: https://example.com\ndescription: |\n  Line one\n  Line two\n---\n::");
  assert.equal(card.type, "component");
  if (card.type !== "component") return;
  assert.equal(card.props.title, "An example");
  assert.equal(card.props.description, "Line one\nLine two\n");
});

test("MDC inline elements preserve formatted children and native element attributes", () => {
  const inline = parseInline('Use :badge[**Stable**]{link="/release" round} and :key{code="K" cmd}.');
  const badge = inline.find((node) => node.type === "component" && node.name === "badge");
  assert.ok(badge?.type === "component");
  assert.equal(badge.children[0].type, "strong");
  assert.equal(badge.props.round, true);
  const [image] = parseInline('![A photo](/photo.jpg){width="640" height="480"}');
  assert.ok(image.type === "image");
  assert.equal(image.width, 640);
  const [code] = parseInline('`answer`{language="js" copy}');
  assert.ok(code.type === "code");
  assert.equal(code.language, "js");
  assert.equal(code.copy, true);
  const [shortLanguage] = parseInline('`answer`{lang="js" copy}');
  assert.ok(shortLanguage.type === "code");
  assert.equal(shortLanguage.language, "js");
  assert.equal(shortLanguage.copy, true);
});

test("math, Mermaid and music ABC fences have explicit semantic nodes", () => {
  const blocks = parseMarkdown("Inline $x^2$ math.\n\n$$\n\\frac{1}{2}\n$$\n\n```mermaid\ngraph TD; A-->B\n```\n\n```music-abc\nX:1\nK:C\nCDEF\n```");
  assert.ok(blocks[0].type === "paragraph" && blocks[0].children.some((node) => node.type === "math"));
  assert.equal(blocks[1].type, "math");
  assert.deepEqual(blocks.slice(2).map((block) => block.type === "component" && [block.name, block.props]), [
    ["mermaid", { code: "graph TD; A-->B" }], ["music-score", { abc: "X:1\nK:C\nCDEF" }],
  ]);
});

test("footnotes collect at the end with stable first-reference order and repeated backlinks", () => {
  const source = "Second[^b], first[^a], second again[^b].\n\n[^a]: Alpha **note**.\n[^b]: Beta note.";
  const blocks = parseMarkdown(source);
  const notes = blocks.filter((block) => block.type === "footnote-definition");
  assert.deepEqual(notes.map((note) => [note.label, note.number, note.references]), [["b", 1, 2], ["a", 2, 1]]);
  assert.deepEqual(parseMarkdown(source), blocks);
  assert.ok(blocks[0].type === "paragraph");
  assert.deepEqual(blocks[0].children.filter((node) => node.type === "footnote-reference").map((node) => node.reference), [1, 1, 2]);
});

test("allowed HTML becomes safe structural components and all scripts stay literal", () => {
  const [details] = parseMarkdown('<details open onclick="bad()">\n<summary>Read **more**</summary>\n\n## Inside\n\nDetails with <kbd>Ctrl</kbd><br>next.\n\n</details>');
  assert.ok(details.type === "component");
  assert.equal(details.name, "details");
  assert.equal(details.props.open, true);
  assert.equal(details.props.onclick, undefined);
  assert.equal(extractPlainText(details.slots.title), "Read more");
  assert.equal(details.children[0].type, "heading");
  assert.deepEqual(parseInline("<script>alert(1)</script>"), [{ type: "text", value: "<script>alert(1)</script>" }]);
  assert.equal(parseInline("<img src='/a.webp'>")[0].type, "text");
});

test("MDC attributes reject expressions, executable properties and unsafe URLs", () => {
  const [component] = parseMarkdown('::alert{:title="globalThis.compromised = true" onclick="bad()" v-html="bad" style="color:red;position:fixed;background-image:url(javascript:bad)" link="javascript:bad"}\nReadable\n::');
  assert.ok(component.type === "component");
  assert.deepEqual(component.props, { style: "color: red" });
  assert.equal(extractPlainText([component]), "Readable");
  assert.equal(inlineText(parseInline("{{ globalThis.compromised = true }}")), "{{ globalThis.compromised = true }}");
  assert.deepEqual(sanitizeContentProps(JSON.parse('{"__proto__":{"polluted":true},":items":"[1,2]","src":"data:text/html,bad"}')), { items: [1, 2] });
});

test("malformed or recursive component YAML cannot crash parsing or erase the body and slots", () => {
  for (const yaml of ["x: &x [*x]", "x: [unfinished", "x: !executable payload", "__proto__: {polluted: true}"]) {
    const [component] = parseMarkdown(`::alert{type="warning"}\n---\n${yaml}\n---\nVisible body\n#title\nVisible title\n::`);
    assert.ok(component.type === "component");
    assert.deepEqual(component.props, { type: "warning" });
    assert.equal(extractPlainText(component.children), "Visible body");
    assert.equal(extractPlainText(component.slots.title), "Visible title");
  }
});

test("headings and excerpts traverse rich content while meta slots do not pollute the article", () => {
  const source = "::meta-summary\n## Metadata\nDescription\n::\n\n::folding{title=Details}\n## Visible\nBody\n::\n\n::tab{:tabs='[\"One\"]'}\n#tab1\n## Hidden until selected\nMore body\n::";
  assert.deepEqual(getHeadings(source).map((heading) => heading.text), ["Visible", "Hidden until selected"]);
  const text = extractPlainText(parseMarkdown(source));
  assert.ok(text.includes("Details\nVisible\nBody"));
  assert.ok(text.includes("More body"));
  assert.ok(!text.includes("Metadata"));
  assert.ok(!text.includes("meta-summary"));
  const { body, slots } = splitContentSlots(parseMarkdown(source));
  assert.equal(body.length, 2);
  assert.equal(slots.summary.name, "meta-summary");
  assert.equal(extractPlainText(slots.summary.children), "Metadata\nDescription");
});

test("nested HTML disclosures preserve the inner content and the outer remainder", () => {
  const [outer] = parseMarkdown("<details>\n<summary>Outer title</summary>\n\n<details>\n<summary>Inner title</summary>\n\nInner body\n\n</details>\n\nOuter remainder\n\n</details>");
  assert.ok(outer.type === "component");
  assert.equal(outer.children[0].type, "component");
  assert.equal(extractPlainText(outer.children), "Inner body\nInner title\nOuter remainder");
});

test("standalone inline components retain formatting and first link definitions win", () => {
  const [badge] = parseMarkdown(":badge[**Strong** and _soft_]{round}");
  assert.ok(badge.type === "component");
  assert.ok(badge.children[0].type === "paragraph");
  assert.equal(badge.children[0].children[0].type, "strong");
  const [paragraph] = parseMarkdown("[first][id]\n\n[id]: /one\n[id]: /two");
  assert.ok(paragraph.type === "paragraph");
  assert.ok(paragraph.children[0].type === "link");
  assert.equal(paragraph.children[0].href, "/one");
});

test("shortcut link references coexist with MDC spans and normalize their labels", () => {
  const source = 'Read [manual], [A   B], [STRASSE], [A\\*B] and [**bold**].\n\n[manual]: /manual "Guide"\n[A B]: /spaces\n[Straße]: /unicode\n[A\\*B]: /escaped\n[**bold**]: /formatted\n[manual]: /ignored';
  const [paragraph] = parseMarkdown(source);
  assert.ok(paragraph.type === "paragraph");
  const links = paragraph.children.filter(node => node.type === "link");
  assert.deepEqual(links.map(node => node.href), ["/manual", "/spaces", "/unicode", "/escaped", "/formatted"]);
  assert.equal(links[0].title, "Guide");
  assert.equal(links[4].children[0].type, "strong");
  const spans = parseInline('Keep [manual]{.label} and :span[manual].\n\n[manual]: /manual');
  assert.equal(spans.filter(node => node.type === "component" && node.name === "span").length, 2);
  assert.equal(spans.some(node => node.type === "link"), false);
});

test("safe HTML containers retain local link definitions and footnote bodies", () => {
  const [container] = parseMarkdown('<div>\n[manual]: /manual "Guide"\nRead [the manual][manual].\n</div>');
  assert.ok(container.type === "component");
  const paragraph = container.children[0];
  assert.ok(paragraph.type === "paragraph");
  assert.deepEqual(paragraph.children.find(node => node.type === "link"), {
    type: "link", href: "/manual", title: "Guide", children: [{ type: "text", value: "the manual" }],
  });
  const blocks = parseMarkdown('<div>\n[^note]: The **note** links to [manual].\n\nRead[^note].\n\n[manual]: /manual\n</div>');
  assert.ok(blocks[0].type === "component");
  assert.ok(blocks[0].children[0].type === "paragraph");
  assert.equal(blocks[0].children[0].children[1].type, "footnote-reference");
  const note = blocks.find(block => block.type === "footnote-definition");
  assert.ok(note);
  assert.equal(extractPlainText(note.children), "The note links to manual.");
  assert.ok(note.children[0].type === "paragraph");
  assert.equal(note.children[0].children.find(node => node.type === "link")?.href, "/manual");
  const disclosure = parseMarkdown('[manual]: /manual\n\n<details>\n<summary>Read [the guide][manual] and this note[^n].</summary>\n[^n]: Keep this summary note.\n\nRead [manual][].\n\n</details>');
  assert.ok(disclosure[0].type === "component");
  assert.ok(disclosure[0].slots.title[0].type === "paragraph");
  const titleLink = disclosure[0].slots.title[0].children.find(node => node.type === "link");
  assert.equal(titleLink?.href, "/manual");
  assert.equal(titleLink && inlineText(titleLink.children), "the guide");
  assert.equal(extractPlainText(disclosure[0].slots.title), "Read the guide and this note.");
  assert.ok(disclosure[0].slots.title[0].children.some(node => node.type === "footnote-reference"));
  assert.ok(disclosure[0].children[0].type === "paragraph");
  assert.equal(disclosure[0].children[0].children.find(node => node.type === "link")?.href, "/manual");
  assert.equal(extractPlainText(disclosure.filter(block => block.type === "footnote-definition")), "Keep this summary note.");
});
