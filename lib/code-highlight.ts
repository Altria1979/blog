import { createRequire } from "node:module";
import path from "node:path";
import type { Root } from "postcss";
import type { CodeToken } from "./code";
import type { Element, RootContent } from "hast";

// These parsers ship with the installed Next.js runtime. Keep them on the server;
// if a deployment omits either optional parser, the original text is still rendered.
const requireParser = createRequire(path.join(process.cwd(), "package.json"));
type Range = { start: number; end: number; kind: NonNullable<CodeToken["kind"]> };
type BabelToken = {
  start: number;
  end: number;
  type: string | { label: string; keyword?: string };
};
type BabelParser = {
  parse: (value: string, options: object) => { tokens: BabelToken[] };
};

function javascriptRanges(value: string, language: string): Range[] {
  const parser = requireParser("next/dist/compiled/babel/parser") as BabelParser;
  const plugins = [];
  if (["ts", "typescript", "tsx"].includes(language)) plugins.push("typescript");
  if (["jsx", "tsx"].includes(language)) plugins.push("jsx");
  const { tokens } = parser.parse(value, {
    sourceType: "unambiguous",
    plugins,
    tokens: true,
    errorRecovery: true,
    allowReturnOutsideFunction: true,
  });
  return tokens.flatMap((token, index): Range[] => {
    const label = typeof token.type === "string" ? token.type : token.type.label;
    const next = tokens[index + 1]?.type;
    const nextLabel = typeof next === "string" ? next : next?.label;
    let kind: CodeToken["kind"];
    if (label === "CommentLine" || label === "CommentBlock") kind = "comment";
    else if (typeof token.type !== "string" && token.type.keyword) kind = "keyword";
    else if (["string", "template", "regexp"].includes(label)) kind = "string";
    else if (["num", "bigint", "decimal"].includes(label)) kind = "number";
    else if (label === "jsxName") kind = "tag";
    else if (label === "name" && nextLabel === "(") kind = "function";
    else if (!["name", "jsxText", "eof"].includes(label)) kind = "punctuation";
    return kind && token.end > token.start ? [{ start: token.start, end: token.end, kind }] : [];
  });
}

function cssRanges(value: string): Range[] {
  const parser = requireParser("postcss") as { parse: (value: string) => Root };
  const ranges: Range[] = [];
  parser.parse(value).walk((node) => {
    const start = node.source?.start?.offset;
    const end = node.source?.end?.offset;
    if (start === undefined || end === undefined) return;
    if (node.type === "comment") ranges.push({ start, end, kind: "comment" });
    else if (node.type === "rule") ranges.push({ start, end: start + node.selector.length, kind: "selector" });
    else if (node.type === "atrule") ranges.push({ start, end: start + node.name.length + 1, kind: "keyword" });
    else if (node.type === "decl") {
      ranges.push({ start, end: start + node.prop.length, kind: "property" });
      const valueStart = start + node.prop.length + (node.raws.between?.length ?? 1);
      ranges.push({ start: valueStart, end: valueStart + node.value.length, kind: "value" });
    }
  });
  return ranges;
}

/** Real parser ranges become React text nodes, never generated HTML. */
export function highlightCode(value: string, language: string): CodeToken[] {
  const plain = [{ text: value }];
  // Highlighting is optional and bounded. Huge samples remain readable plain text.
  if (!value || value.length > 100_000) return plain;
  try {
    const name = language.toLowerCase();
    const ranges = name === "css"
      ? cssRanges(value)
      : ["js", "javascript", "mjs", "cjs", "ts", "typescript", "tsx", "jsx"].includes(name)
        ? javascriptRanges(value, name)
        : [];
    const tokens: CodeToken[] = [];
    let position = 0;
    for (const { start, end, kind } of ranges.sort((a, b) => a.start - b.start)) {
      if (start < position || end <= start || end > value.length) continue;
      if (start > position) tokens.push({ text: value.slice(position, start) });
      tokens.push({ text: value.slice(start, end), kind });
      position = end;
    }
    if (position < value.length) tokens.push({ text: value.slice(position) });
    return tokens.length ? tokens : plain;
  } catch {
    return plain;
  }
}

type RichCodeOptions = { indent?: number; words?: string[] };
type TokenAppearance = Omit<CodeToken, "text">;

function classes(element: Element): string[] {
  const value = element.properties.className ?? element.properties.class;
  return Array.isArray(value) ? value.map(String) : String(value ?? "").split(/\s+/);
}

function tokenAppearance(element: Element, inherited: TokenAppearance): TokenAppearance {
  const result = { ...inherited };
  const style = String(element.properties.style ?? "");
  const properties = Object.fromEntries(style.split(";").map(declaration => {
    const index = declaration.indexOf(":");
    return [declaration.slice(0, index), declaration.slice(index + 1)];
  }));
  if (properties["--shiki-light"]) result.lightColor = properties["--shiki-light"];
  if (properties["--shiki-dark"]) result.darkColor = properties["--shiki-dark"];
  for (const [theme, field] of [["light", "fontStyle"], ["dark", "darkFontStyle"]] as const) {
    const italic = properties[`--shiki-${theme}-font-style`];
    const weight = properties[`--shiki-${theme}-font-weight`];
    const decoration = properties[`--shiki-${theme}-text-decoration`];
    if (italic || weight || decoration) result[field] = (italic === "italic" ? 1 : 0) | (weight === "bold" || Number(weight) >= 600 ? 2 : 0) | (decoration?.includes("underline") ? 4 : 0);
  }
  const classNames = classes(element);
  if (classNames.includes("line")) {
    result.lineNumber = Number(element.properties["data-line"]);
    result.lineClasses = classNames.filter(name => ["diff", "add", "remove", "highlighted", "error", "warning", "focused"].includes(name));
  }
  if (classNames.includes("highlighted-word")) result.highlighted = true;
  if (classNames.includes("indent")) result.indentGuide = true;
  return result;
}

/** Load bundled grammars on demand; only React-safe text and presentation data cross the server boundary. */
export async function highlightRichCode(value: string, language: string, options: RichCodeOptions = {}): Promise<CodeToken[]> {
  const plain = [{ text: value }];
  if (!value || value.length > 100_000) return plain;
  try {
    const [{ codeToHast, bundledLanguages }, transformers] = await Promise.all([import("shiki"), import("@shikijs/transformers")]);
    const name = language.toLowerCase();
    if (!Object.hasOwn(bundledLanguages, name) && name !== "ansi") return plain;
    const indent = options.indent && options.indent >= 1 && options.indent <= 16 ? options.indent : 2;
    const words = (options.words ?? []).filter(word => word.length && word.length <= 200 && !/[\n/]/.test(word)).slice(0, 20);
    const hast = await codeToHast(value, {
      lang: name,
      themes: { light: "catppuccin-latte", dark: "one-dark-pro" },
      defaultColor: false,
      meta: { __raw: words.map(word => `/${word}/`).join(" ") },
      transformers: [
        { name: "article-line-numbers", line(node, line) { node.properties["data-line"] = line; } },
        transformers.transformerNotationDiff(),
        transformers.transformerNotationHighlight(),
        transformers.transformerNotationWordHighlight(),
        transformers.transformerNotationFocus(),
        transformers.transformerNotationErrorLevel(),
        transformers.transformerMetaWordHighlight(),
        transformers.transformerRenderIndentGuides({ indent }),
        transformers.transformerRemoveNotationEscape(),
      ],
    });
    const tokens: CodeToken[] = [];
    const visit = (node: RootContent, inherited: TokenAppearance = {}) => {
      if (node.type === "text") tokens.push({ ...inherited, text: node.value });
      else if (node.type === "element") {
        const appearance = tokenAppearance(node, inherited);
        if (classes(node).includes("line")) tokens.push({ ...appearance, text: "" });
        node.children.forEach(child => visit(child, appearance));
      }
    };
    hast.children.forEach(node => visit(node));
    return tokens.length ? tokens : plain;
  } catch {
    return plain;
  }
}
