import assert from "node:assert/strict";
import test from "node:test";
import { codeLines, codeStats, codeTokenLines, parseCodeMeta } from "../lib/code.ts";
import { highlightCode, highlightRichCode } from "../lib/code-highlight.ts";
import { parseMarkdown } from "../lib/markdown.ts";

test("code folding counts 32 and 33 lines without inventing a terminal blank line", () => {
  for (const count of [16, 32, 33]) {
    const source = Array.from({ length: count }, (_, index) => `line ${index + 1}`).join("\n");
    assert.equal(codeLines(source).length, count);
    assert.equal(codeLines(`${source}\n`).length, count);
    assert.equal(codeStats(`${source}\n`).collapsible, count > 32);
  }
  assert.deepEqual(codeLines("first\n\n"), ["first", ""]);
  assert.deepEqual(codeLines(""), [""]);
});

test("code statistics retain raw whitespace and distinguish characters from UTF-8 bytes", () => {
  assert.deepEqual(codeStats("你🙂\n"), {
    lines: 1,
    characters: 3,
    bytes: 8,
    collapsible: false,
  });
});

test("code metadata supports controlled filenames, highlights and diff without unbounded expansion", () => {
  assert.deepEqual(parseCodeMeta('tsx filename="src/page.tsx" highlight={1,3-5}'), {
    language: "tsx",
    filename: "src/page.tsx",
    highlights: [{ start: 1, end: 1 }, { start: 3, end: 5 }],
    diff: false,
  });
  assert.equal(parseCodeMeta("diff-ts [src/app.ts] {2} diff").language, "ts");
  assert.equal(parseCodeMeta("diff-ts [src/app.ts] {2}").diff, true);
  assert.equal(parseCodeMeta("js [a.js] diff").filename, "a.js");
  assert.deepEqual(parseCodeMeta("js {0,5-2,1-999999999999999,NaN,4}").highlights, [{ start: 4, end: 4 }]);
  assert.equal(parseCodeMeta('js filename="bad\u0000file"').filename, undefined);
});

test("fences retain literal code and attach metadata without changing heading parsing", () => {
  const blocks = parseMarkdown('```html filename="example.html" {1}\n<script>alert("literal")</script>\n```\n\n## Heading');
  const code = blocks[0];
  assert.equal(code.type, "code");
  if (code.type !== "code") return;
  assert.equal(code.value, '<script>alert("literal")</script>');
  assert.equal(code.filename, "example.html");
  assert.deepEqual(code.highlights, [{ start: 1, end: 1 }]);
  assert.equal(blocks[1].type, "heading");
});

test("server syntax coloring uses parser tokens and exactly reconstructs TSX source", () => {
  const source = 'export default function Page() {\n  // literal <script> stays text\n  const label = "你好🙂";\n  return <Article title={label}>Hello &amp; goodbye</Article>;\n}\n';
  const tokens = highlightCode(source, "tsx");
  assert.equal(tokens.map((token) => token.text).join(""), source);
  assert.ok(tokens.some((token) => token.kind === "keyword" && token.text === "export"));
  assert.ok(tokens.some((token) => token.kind === "tag" && token.text === "Article"));
  assert.ok(tokens.some((token) => token.kind === "comment" && token.text.includes("<script>")));
  assert.equal(codeTokenLines(tokens).map((line) => line.map((token) => token.text).join("")).join("\n"), source);
});

test("CSS coloring recognizes real declarations, selectors, at-rules and multiline comments", () => {
  const source = '/* comment\n   next line */\n@media (width: 768px) {\n  .card:hover {\n    color: red;\n    content: "<&>";\n  }\n}\n';
  const tokens = highlightCode(source, "css");
  assert.equal(tokens.map((token) => token.text).join(""), source);
  assert.ok(tokens.some((token) => token.kind === "comment" && token.text.startsWith("/*")));
  assert.ok(tokens.some((token) => token.kind === "keyword" && token.text === "@media"));
  assert.ok(tokens.some((token) => token.kind === "selector" && token.text === ".card:hover"));
  assert.ok(tokens.some((token) => token.kind === "property" && token.text === "content"));
  assert.ok(tokens.some((token) => token.kind === "value" && token.text === '"<&>"'));
});

test("unsupported languages, malformed snippets and oversized source remain exact plain text", () => {
  for (const [source, language] of [["# **Markdown**\n", "markdown"], ['const s = "unfinished', "ts"], ["a { content: \"unfinished", "css"], ["x".repeat(100_001), "js"]]) {
    assert.deepEqual(highlightCode(source, language), [{ text: source }]);
  }
});

test("fence controls support upstream wrap, expand, indent, icons and word highlights", () => {
  const meta = parseCodeMeta('ts [src/example.ts] wrap expand indent=4 icon=tabler:files /hello world/');
  assert.equal(meta.wrap, true);
  assert.equal(meta.expand, true);
  assert.equal(meta.indent, 4);
  assert.equal(meta.icon, "tabler:files");
  assert.deepEqual(meta.words, ["hello world"]);
  assert.deepEqual(parseCodeMeta('js filename="a wrap expand.js" indent=999 icon="javascript:alert(1)"').words, undefined);
  assert.equal(parseCodeMeta('js filename="a wrap expand.js"').wrap, undefined);
  assert.equal(parseCodeMeta("js indent=0").indent, undefined);
  assert.equal(parseCodeMeta("js indent=999").indent, undefined);
  assert.equal(parseCodeMeta("js wrap=false expand=false").wrap, undefined);
  assert.equal(parseCodeMeta("js wrap=false expand=false").expand, undefined);
  assert.equal(parseCodeMeta("js icon=javascript:alert(1)").icon, undefined);
  assert.equal(parseCodeMeta("js /hello wrap expand world/").wrap, undefined);
  assert.equal(parseCodeMeta("js /hello wrap expand world/").expand, undefined);
});

test("Shiki loads languages on demand and preserves literal source with both theme colors", async () => {
  const samples = [
    ["python", 'def greet(name):\n    return f"Hello {name}"\n'],
    ["yaml", "title: Article\ntags:\n  - YAML\n"],
    ["rust", 'fn main() { println!("hello"); }\n'],
    ["sql", "SELECT * FROM posts WHERE published = true;\n"],
    ["vue", '<template><p>{{ title }}</p></template>\n'],
    ["sh", 'echo "<script>alert(1)</script>"\n'],
  ];
  for (const [language, source] of samples) {
    const tokens = await highlightRichCode(source, language);
    assert.equal(tokens.map(token => token.text).join(""), source, language);
    assert.ok(tokens.some(token => token.lightColor && token.darkColor && token.lightColor !== token.darkColor), language);
    assert.equal(codeTokenLines(tokens).map(line => line.map(token => token.text).join("")).join("\n"), source, language);
  }
});

test("Shiki comment notations retain original line numbers and drive all line states", async () => {
  const source = [
    "const added = 1 // [!code ++]",
    "const removed = 2 // [!code --]",
    "const highlighted = 3 // [!code highlight]",
    "const focused = 4 // [!code focus]",
    "const error = 5 // [!code error]",
    "const warning = 6 // [!code warning]",
  ].join("\n");
  const lines = codeTokenLines(await highlightRichCode(source, "ts"));
  for (const [index, expected] of ["add", "remove", "highlighted", "focused", "error", "warning"].entries()) {
    assert.ok(lines[index].some(token => token.lineClasses?.includes(expected)), expected);
    assert.equal(lines[index][0].lineNumber, index + 1);
    assert.ok(!lines[index].map(token => token.text).join("").includes("[!code"));
  }
  assert.ok(source.includes("// [!code ++]"), "copy source must remain untouched");
});

test("word notation, fence word highlights and indent guides remain text tokens", async () => {
  const source = '// [!code word:hello]\nfunction greet() {\n  return "hello";\n}\n';
  const tokens = await highlightRichCode(source, "js", { indent: 2 });
  assert.ok(tokens.some(token => token.highlighted && token.text === "hello"));
  assert.ok(tokens.some(token => token.indentGuide && token.text === "  "));
  assert.equal(tokens[0].lineNumber, 2, "removed directive lines must not shift source line numbering");
  const metaTokens = await highlightRichCode('const label = "hello world";', "js", { words: ["hello world"] });
  assert.ok(metaTokens.some(token => token.highlighted && token.text === "hello world"));
});

test("notations inside strings remain literal and rich highlighting has a safe plain fallback", async () => {
  const literal = 'const notation = "// [!code ++]";';
  const tokens = await highlightRichCode(literal, "js");
  assert.equal(tokens.map(token => token.text).join(""), literal);
  assert.ok(!tokens.some(token => token.lineClasses?.includes("add")));
  for (const [source, language] of [["unknown <&>\n", "not-a-language"], ["literal\n", "text"], ["x".repeat(100_001), "js"]]) {
    assert.deepEqual(await highlightRichCode(source, language), [{ text: source }]);
  }
});

test("notation ranges and terminal newlines preserve line counts and ANSI carries font styles", async () => {
  const source = "const before = 0;\n// [!code highlight:2]\nconst one = 1;\nconst two = 2;\nconst after = 3;\n";
  const lines = codeTokenLines(await highlightRichCode(source, "ts"));
  assert.deepEqual(lines.slice(0, -1).map(line => line[0].lineNumber), [1, 3, 4, 5]);
  assert.deepEqual(lines.slice(0, -1).map(line => line.some(token => token.lineClasses?.includes("highlighted"))), [false, true, true, false]);
  for (const count of [32, 33]) {
    const raw = Array.from({ length: count }, (_, index) => `const line${index} = ${index};`).join("\n");
    for (const value of [raw, `${raw}\n`]) {
      const display = (await highlightRichCode(value, "ts")).map(token => token.text).join("");
      assert.equal(codeLines(display).length, count);
      assert.equal(codeStats(value).collapsible, count === 33);
    }
  }
  const ansi = await highlightRichCode("\u001b[1;31mred bold\u001b[0m", "ansi");
  assert.ok(ansi.some(token => token.text === "red bold" && token.fontStyle === 2 && token.darkFontStyle === 2));
});
