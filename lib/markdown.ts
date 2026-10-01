import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdc from "remark-mdc";
import { parseCodeMeta, type CodeMeta } from "./code";
import { parseYamlMetadata } from "./frontmatter";

export type ContentValue = string | number | boolean | null | ContentValue[] | { [key: string]: ContentValue };
export type ContentProps = Record<string, ContentValue>;
type Attributes = { attrs?: ContentProps };

export type InlineNode = Attributes & (
  | { type: "text"; value: string }
  | { type: "code"; value: string; language?: string; copy?: boolean }
  | { type: "strong" | "emphasis" | "delete"; children: InlineNode[] }
  | { type: "link"; href: string; children: InlineNode[]; title?: string }
  | { type: "image"; src: string; alt: string; width?: number; height?: number; title?: string }
  | { type: "break" }
  | { type: "math"; value: string }
  | { type: "footnote-reference"; id: string; label: string; number: number; reference: number }
  | { type: "component"; name: string; props: ContentProps; children: InlineNode[] }
);

export type MarkdownBlock =
  | (Attributes & { type: "heading"; level: number; id: string; text: string; children: InlineNode[] })
  | (Attributes & { type: "paragraph"; children: InlineNode[] })
  | { type: "blockquote"; children: MarkdownBlock[] }
  | { type: "list"; ordered: boolean; start: number; items: MarkdownBlock[][]; checked?: (boolean | null)[] }
  | ({ type: "code"; value: string } & CodeMeta)
  | { type: "hr" }
  | { type: "table"; headers: InlineNode[][]; rows: InlineNode[][][]; align: ("left" | "center" | "right" | undefined)[] }
  | { type: "math"; value: string }
  | { type: "component"; name: string; props: ContentProps; children: MarkdownBlock[]; slots: Record<string, MarkdownBlock[]> }
  | { type: "footnote-definition"; id: string; label: string; number: number; children: MarkdownBlock[]; references: number };

export type Heading = { id: string; text: string; level: number };

/** Values remain data. Neither MDC expressions nor HTML are evaluated. */
export function safeUrl(value: string): string | undefined {
  const url = value.trim();
  if (!url || /[\u0000-\u0020\u007f\\]/.test(url) || url.startsWith("//")) return undefined;
  if (url.startsWith("#") || url.startsWith("/")) return url;
  if (!/^[a-z][a-z\d+.-]*:/i.test(url)) return url;
  if (!/^(?:https?:\/\/|mailto:)/i.test(url)) return undefined;
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(url).protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

const styleProperties = new Set([
  "color", "background-color", "font-size", "font-weight", "font-style", "font-family",
  "text-align", "text-decoration", "text-transform", "line-height", "letter-spacing",
  "white-space", "vertical-align", "width", "height", "max-width", "max-height",
  "min-width", "min-height", "margin", "margin-top", "margin-bottom", "margin-inline",
  "padding", "border-radius", "opacity", "display", "object-fit", "object-position", "filter",
]);

/** Allow typographic styles, excluding URLs, CSS execution and positioning overlays. */
export function safeStyle(value: string): string {
  return value.split(";").flatMap((declaration) => {
    const colon = declaration.indexOf(":");
    if (colon < 0) return [];
    const property = declaration.slice(0, colon).trim().toLowerCase();
    const setting = declaration.slice(colon + 1).trim();
    if (!styleProperties.has(property) || !setting || /url\s*\(|expression\s*\(|[\\<>@{}]|!\s*important/i.test(setting)) return [];
    return [`${property}: ${setting}`];
  }).join("; ");
}

const forbiddenKey = /^(?:__proto__|prototype|constructor|innerhtml|outerhtml|dangerouslysetinnerhtml|srcdoc|on[a-z].*|v-.*|@.*)$/i;
const urlKeys = /^(?:href|link|src|img|image|icon|avatar|banner|poster|feed)$/i;

function contentValue(value: unknown, depth = 0): ContentValue | undefined {
  if (depth > 12) return undefined;
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (Array.isArray(value)) return value.slice(0, 1000).flatMap((item) => {
    const clean = contentValue(item, depth + 1);
    return clean === undefined ? [] : [clean];
  });
  if (typeof value !== "object" || !value) return undefined;
  const result: ContentProps = {};
  for (const [key, item] of Object.entries(value).slice(0, 1000)) {
    if (forbiddenKey.test(key)) continue;
    const clean = contentValue(item, depth + 1);
    if (clean !== undefined) result[key] = clean;
  }
  return result;
}

export function sanitizeContentProps(attributes: Record<string, unknown> = {}): ContentProps {
  const props: ContentProps = {};
  for (const [rawKey, rawValue] of Object.entries(attributes)) {
    const key = rawKey.replace(/^:/, "");
    if (!/^[a-zA-Z][\w-]*$/.test(key) || forbiddenKey.test(key)) continue;
    let value = rawValue;
    if (rawKey.startsWith(":")) {
      if (typeof rawValue !== "string") continue;
      try { value = JSON.parse(rawValue); } catch { continue; }
    }
    const clean = contentValue(value);
    if (clean === undefined) continue;
    if (key === "style") {
      if (typeof clean !== "string") continue;
      const style = safeStyle(clean);
      if (style) props.style = style;
    } else if (urlKeys.test(key) && typeof clean === "string") {
      // Icon names such as tabler:note are identifiers, not URLs.
      if (key === "icon" && /^[a-z][\w-]*:[\w-]+$/i.test(clean) && !/^(?:javascript|data|vbscript):/i.test(clean)) props[key] = clean;
      else {
        const url = safeUrl(clean);
        if (url && (!/^(?:src|img|image|avatar|banner|poster)$/i.test(key) || !/^mailto:/i.test(url))) props[key] = url;
      }
    } else props[key] = clean;
  }
  return props;
}

// Only syntax extensions are installed: no component handlers, evaluation, or HTML compiler.
// GFM must follow MDC: otherwise MDC's span syntax consumes footnote references.
const processor = unified().use(remarkParse).use(remarkMdc).use(remarkGfm).use(remarkMath);

interface SourceNode {
  type: string;
  value?: string;
  name?: string;
  children?: SourceNode[];
  attributes?: Record<string, unknown>;
  rawData?: string;
  data?: { hProperties?: Record<string, unknown> };
  depth?: number;
  ordered?: boolean;
  start?: number | null;
  checked?: boolean | null;
  url?: string;
  title?: string | null;
  alt?: string | null;
  lang?: string | null;
  meta?: string | null;
  align?: ("left" | "center" | "right" | null)[];
  identifier?: string;
  label?: string;
  position?: { start: { offset?: number }; end: { offset?: number } };
}

type Footnote = { id: string; label: string; number: number; references: number; node: SourceNode; source: string };
type ParseState = { usedIds: Set<string>; definitions: Map<string, SourceNode>; definitionSources: WeakMap<SourceNode, string>; footnotes: Map<string, Footnote> };

function parseSource(source: string): SourceNode[] {
  // The MDC transformer flattens arbitrary YAML before our validation and can
  // overflow on recursive aliases. Its syntax AST already contains every slot;
  // decode component YAML through the same bounded reader as article metadata.
  return (processor.parse(source) as unknown as SourceNode).children ?? [];
}

function sourceText(node: SourceNode, source: string): string {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  return start !== undefined && end !== undefined ? source.slice(start, end) : node.value ?? "";
}

function propsOf(node: SourceNode): ContentProps {
  const yaml = node.rawData ? parseYamlMetadata(node.rawData.replace(/\s-+$/, "")) : undefined;
  return sanitizeContentProps({ ...node.attributes, ...yaml });
}

function attrsOf(node: SourceNode): Attributes {
  const attrs = propsOf(node);
  return Object.keys(attrs).length ? { attrs } : {};
}

function baseId(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/\p{Mark}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";
}

function headingId(text: string, state: ParseState): string {
  const base = baseId(text);
  let id = base;
  let suffix = 2;
  while (state.usedIds.has(id)) id = `${base}-${suffix++}`;
  state.usedIds.add(id);
  return id;
}

export function inlineText(nodes: InlineNode[]): string {
  return nodes.map((node) => {
    if (node.type === "text" || node.type === "code" || node.type === "math") return node.value;
    if (node.type === "image") return node.alt;
    if (node.type === "break") return "\n";
    if (node.type === "footnote-reference") return "";
    if (node.type === "component" && !node.children.length) return typeof node.props.text === "string" ? node.props.text : "";
    return inlineText(node.children);
  }).join("");
}

function collectDefinitions(nodes: SourceNode[], state: ParseState, source: string) {
  for (const node of nodes) {
    if ((node.type === "definition" || node.type === "footnoteDefinition") && node.identifier) {
      const key = `${node.type}:${node.identifier}`;
      if (!state.definitions.has(key)) {
        state.definitions.set(key, node);
        state.definitionSources.set(node, source);
      }
    }
    if (node.children) collectDefinitions(node.children, state, source);
  }
}

function footnoteFor(node: SourceNode, state: ParseState): Footnote | undefined {
  const identifier = node.identifier ?? "";
  const definition = state.definitions.get(`footnoteDefinition:${identifier}`);
  if (!definition) return undefined;
  let note = state.footnotes.get(identifier);
  if (!note) {
    const label = definition.label || identifier;
    // The ordinal avoids collisions between labels with identical normalized forms.
    const number = state.footnotes.size + 1;
    note = { id: `fn-${number}-${baseId(label)}`, label, number, references: 0, node: definition, source: state.definitionSources.get(definition) ?? "" };
    state.footnotes.set(identifier, note);
  }
  return note;
}

const inlineHtml = new Set(["span", "kbd", "mark", "sub", "sup", "abbr", "u", "ins", "s", "small", "b", "i", "strong", "em"]);
const blockHtml = new Set(["details", "summary", "div", "section", "center", "p", "figure", "figcaption"]);

function htmlOpening(value: string) {
  const match = value.match(/^<([a-z][\w-]*)\b([^<>]*?)>$/i);
  if (!match) return undefined;
  const attributes: Record<string, unknown> = {};
  for (const item of match[2].matchAll(/([^\s=/'"<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s'"=<>`]+)))?/g)) {
    attributes[item[1]] = item[2] ?? item[3] ?? item[4] ?? true;
  }
  return { name: match[1].toLowerCase(), props: sanitizeContentProps(attributes) };
}

function appendInline(output: InlineNode[], node: InlineNode) {
  const last = output[output.length - 1];
  if (node.type === "text" && last?.type === "text" && !node.attrs && !last.attrs) last.value += node.value;
  else output.push(node);
}

function convertInline(nodes: SourceNode[], state: ParseState, source: string, depth = 0): InlineNode[] {
  if (depth > 40) return [{ type: "text", value: nodes.map((node) => sourceText(node, source)).join("") }];
  const output: InlineNode[] = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const attrs = attrsOf(node);
    const children = () => convertInline(node.children ?? [], state, source, depth + 1);
    switch (node.type) {
      case "text": appendInline(output, { type: "text", value: node.value ?? "", ...attrs }); break;
      case "inlineCode": {
        const props = propsOf(node);
        const language = typeof props.language === "string" ? props.language : typeof props.lang === "string" ? props.lang : undefined;
        output.push({ type: "code", value: node.value ?? "", ...attrs,
          ...(language ? { language } : {}),
          ...(props.copy === true || props.copy === "true" ? { copy: true } : {}),
        });
        break;
      }
      case "strong": case "emphasis": case "delete": output.push({ type: node.type, children: children(), ...attrs }); break;
      case "break": output.push({ type: "break" }); break;
      case "inlineMath": output.push({ type: "math", value: node.value ?? "" }); break;
      case "link": case "linkReference": {
        const destination = node.type === "linkReference" ? state.definitions.get(`definition:${node.identifier}`) : node;
        const href = destination?.url && safeUrl(destination.url);
        const nested = children();
        if (href) output.push({ type: "link", href, children: nested, ...attrs, ...(destination?.title ? { title: destination.title } : {}) });
        else nested.forEach((child) => appendInline(output, child));
        break;
      }
      case "image": case "imageReference": {
        const destination = node.type === "imageReference" ? state.definitions.get(`definition:${node.identifier}`) : node;
        const src = destination?.url && safeUrl(destination.url);
        if (!src || /^mailto:/i.test(src)) { appendInline(output, { type: "text", value: node.alt ?? "" }); break; }
        const props = propsOf(node);
        const dimension = (name: "width" | "height") => {
          const value = Number(props[name]);
          return Number.isFinite(value) && value > 0 && value <= 100_000 ? { [name]: value } : {};
        };
        output.push({ type: "image", src, alt: node.alt ?? "", ...attrs, ...dimension("width"), ...dimension("height"), ...(destination?.title ? { title: destination.title } : {}) });
        break;
      }
      case "footnoteReference": {
        const note = footnoteFor(node, state);
        if (note) output.push({ type: "footnote-reference", id: note.id, label: note.label, number: note.number, reference: ++note.references });
        else appendInline(output, { type: "text", value: sourceText(node, source) });
        break;
      }
      case "textComponent": case "leafComponent": case "containerComponent": {
        if (node.name === "binding") { appendInline(output, { type: "text", value: `{{${sourceText(node, source)}}}` }); break; }
        // MDC claims bare [labels] before CommonMark can resolve shortcut links.
        // Explicit :span[...] and spans with attributes remain MDC components.
        const raw = sourceText(node, source);
        if (node.type === "textComponent" && node.name === "span" && !Object.keys(node.attributes ?? {}).length && raw.startsWith("[") && raw.endsWith("]")) {
          // Match mdast's whitespace normalization and Unicode case folding.
          const identifier = raw.slice(1, -1).replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase().toLowerCase();
          const destination = state.definitions.get(`definition:${identifier}`);
          if (destination) {
            const href = destination.url && safeUrl(destination.url);
            const nested = children();
            if (href) output.push({ type: "link", href, children: nested, ...(destination.title ? { title: destination.title } : {}) });
            else nested.forEach(child => appendInline(output, child));
            break;
          }
        }
        output.push({ type: "component", name: node.name ?? "span", props: propsOf(node), children: children() });
        break;
      }
      case "html": {
        const value = node.value ?? "";
        if (/^<br\s*\/?\s*>$/i.test(value)) { output.push({ type: "break" }); break; }
        const opening = htmlOpening(value);
        if (opening && inlineHtml.has(opening.name)) {
          let nesting = 1;
          let end = index + 1;
          for (; end < nodes.length; end += 1) {
            if (nodes[end].type !== "html") continue;
            if (htmlOpening(nodes[end].value ?? "")?.name === opening.name) nesting += 1;
            if (new RegExp(`^</${opening.name}\\s*>$`, "i").test(nodes[end].value ?? "")) nesting -= 1;
            if (!nesting) break;
          }
          if (!nesting) {
            output.push({ type: "component", ...opening, children: convertInline(nodes.slice(index + 1, end), state, source, depth + 1) });
            index = end;
            break;
          }
        }
        appendInline(output, { type: "text", value });
        break;
      }
      default:
        if (node.children) children().forEach((child) => appendInline(output, child));
        else if (node.value) appendInline(output, { type: "text", value: node.value });
    }
  }
  return output;
}

function convertComponent(node: SourceNode, state: ParseState, source: string, depth: number): Extract<MarkdownBlock, { type: "component" }> {
  const slots: Record<string, MarkdownBlock[]> = {};
  const regular: SourceNode[] = [];
  for (const child of node.children ?? []) {
    if (child.type === "componentContainerSection") {
      const name = child.name ?? "default";
      if (!forbiddenKey.test(name)) slots[name] = convertBlocks(child.children ?? [], state, source, depth + 1);
    } else regular.push(child);
  }
  const children: MarkdownBlock[] = node.type === "textComponent" && regular.length
    ? [{ type: "paragraph", children: convertInline(regular, state, source, depth + 1) }]
    : convertBlocks(regular, state, source, depth + 1);
  return { type: "component", name: node.name ?? "div", props: propsOf(node), children, slots };
}

function htmlNesting(raw: string, name: string): number {
  return [...raw.matchAll(new RegExp(`<(/?)${name}\\b[^<>]*>`, "gi"))]
    .reduce((depth, match) => depth + (match[1] ? -1 : 1), 0);
}

function parseFragment(source: string, state: ParseState): SourceNode[] {
  // The Markdown tokenizer must see surrounding definitions to recognize full,
  // collapsed and footnote references inside separately parsed HTML fragments.
  const definitions = [...state.definitions.values()].map(node => sourceText(node, state.definitionSources.get(node) ?? "")).join("\n\n");
  return parseSource(`${source}\n\n${definitions}`).filter(node => (node.position?.start.offset ?? source.length) < source.length);
}

function htmlBlock(raw: string, state: ParseState, depth: number): MarkdownBlock | undefined {
  const matched = raw.trim().match(/^<([a-z][\w-]*)\b([^<>]*)>([\s\S]*)<\/\1\s*>$/i);
  if (!matched || !blockHtml.has(matched[1].toLowerCase()) || htmlNesting(raw, matched[1]) !== 0) return undefined;
  const opening = htmlOpening(`<${matched[1]}${matched[2]}>`);
  if (!opening) return undefined;
  let body = matched[3];
  const slots: Record<string, MarkdownBlock[]> = {};
  let title: string | undefined;
  if (opening.name === "details") {
    const summary = body.match(/^\s*<summary(?:\s[^<>]*)?>([\s\S]*?)<\/summary>/i);
    if (summary) {
      title = summary[1];
      body = body.slice(summary[0].length);
    }
  }
  const bodyNodes = parseFragment(body, state);
  collectDefinitions(bodyNodes, state, body);
  if (title !== undefined) {
    const titleNodes = parseFragment(title, state);
    collectDefinitions(titleNodes, state, title);
    slots.title = convertBlocks(titleNodes, state, title, depth + 1);
  }
  return { type: "component", ...opening, children: convertBlocks(bodyNodes, state, body, depth + 1), slots };
}

function convertBlocks(nodes: SourceNode[], state: ParseState, source: string, depth = 0): MarkdownBlock[] {
  if (depth > 40) return [{ type: "paragraph", children: [{ type: "text", value: nodes.map((node) => sourceText(node, source)).join("\n") }] }];
  const output: MarkdownBlock[] = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const inline = () => convertInline(node.children ?? [], state, source, depth + 1);
    switch (node.type) {
      case "heading": {
        const children = inline();
        const text = inlineText(children);
        output.push({ type: "heading", level: node.depth ?? 1, id: headingId(text, state), text, children, ...attrsOf(node) });
        break;
      }
      case "paragraph": output.push({ type: "paragraph", children: inline(), ...attrsOf(node) }); break;
      case "blockquote": output.push({ type: "blockquote", children: convertBlocks(node.children ?? [], state, source, depth + 1) }); break;
      case "list": {
        const items = node.children ?? [];
        output.push({ type: "list", ordered: !!node.ordered, start: node.start ?? 1,
          items: items.map((item) => convertBlocks(item.children ?? [], state, source, depth + 1)),
          ...(items.some((item) => typeof item.checked === "boolean") ? { checked: items.map((item) => item.checked ?? null) } : {}),
        });
        break;
      }
      case "code": {
        const language = node.lang ?? "";
        if (language === "mermaid" || language === "music-abc") {
          output.push({ type: "component", name: language === "mermaid" ? "mermaid" : "music-score", props: { [language === "mermaid" ? "code" : "abc"]: node.value ?? "" }, children: [], slots: {} });
        } else output.push({ type: "code", ...parseCodeMeta([language, node.meta].filter(Boolean).join(" ")), value: node.value ?? "" });
        break;
      }
      case "math": output.push({ type: "math", value: node.value ?? "" }); break;
      case "thematicBreak": output.push({ type: "hr" }); break;
      case "table": {
        const rows = node.children ?? [];
        const cells = (row: SourceNode) => (row.children ?? []).map((cell) => convertInline(cell.children ?? [], state, source, depth + 1));
        output.push({ type: "table", headers: rows[0] ? cells(rows[0]) : [], rows: rows.slice(1).map(cells), align: (node.align ?? []).map((alignment) => alignment ?? undefined) });
        break;
      }
      case "containerComponent": case "leafComponent":
        output.push(convertComponent(node, state, source, depth));
        break;
      case "textComponent":
        if (node.name === "binding") output.push({ type: "paragraph", children: convertInline([node], state, source, depth + 1) });
        else output.push(convertComponent(node, state, source, depth));
        break;
      case "html": {
        const raw = node.value ?? "";
        const complete = htmlBlock(raw, state, depth);
        if (complete) { output.push(complete); break; }
        const name = raw.match(/^\s*<([a-z][\w-]*)\b[^<>]*>/i)?.[1].toLowerCase();
        if (name && blockHtml.has(name)) {
          let nesting = htmlNesting(raw, name);
          let end = index + 1;
          for (; end < nodes.length; end += 1) {
            if (nodes[end].type !== "html") continue;
            nesting += htmlNesting(nodes[end].value ?? "", name);
            if (nesting || !new RegExp(`</${name}\\s*>\\s*$`, "i").test(nodes[end].value ?? "")) continue;
            const startOffset = node.position?.start.offset;
            const endOffset = nodes[end].position?.end.offset;
            const joined = startOffset !== undefined && endOffset !== undefined ? source.slice(startOffset, endOffset) : "";
            const block = htmlBlock(joined, state, depth);
            if (block) { output.push(block); index = end; }
            break;
          }
          if (index === end) break;
        }
        output.push({ type: "paragraph", children: convertInline([node], state, source, depth + 1) });
        break;
      }
      case "definition": case "footnoteDefinition": break;
      default:
        if (node.children) output.push(...convertBlocks(node.children, state, source, depth + 1));
        else if (node.value) output.push({ type: "paragraph", children: [{ type: "text", value: node.value }] });
    }
  }
  return output;
}

function newState(): ParseState {
  return { usedIds: new Set(), definitions: new Map(), definitionSources: new WeakMap(), footnotes: new Map() };
}

export function parseInline(source: string, depth = 0): InlineNode[] {
  if (depth > 12) return [{ type: "text", value: source }];
  const nodes = parseSource(source);
  const state = newState();
  collectDefinitions(nodes, state, source);
  return convertInline(nodes.flatMap((node) => node.type === "paragraph" ? node.children ?? [] : [node]), state, source);
}

export function parseMarkdown(content: string): MarkdownBlock[] {
  const source = content.replace(/\r\n?/g, "\n");
  const nodes = parseSource(source);
  const state = newState();
  collectDefinitions(nodes, state, source);
  const blocks = convertBlocks(nodes, state, source);
  const definitions: Extract<MarkdownBlock, { type: "footnote-definition" }>[] = [];
  for (const note of state.footnotes.values()) {
    definitions.push({ type: "footnote-definition", id: note.id, label: note.label, number: note.number,
      children: convertBlocks(note.node.children ?? [], state, note.source), references: note.references });
  }
  // A note can reference another note; counts are finalized after all definitions are visited.
  for (const definition of definitions) definition.references = [...state.footnotes.values()].find((note) => note.id === definition.id)?.references ?? 1;
  return [...blocks, ...definitions];
}

export function getHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const visit = (blocks: MarkdownBlock[]) => {
    for (const block of blocks) {
      if (block.type === "heading") headings.push({ id: block.id, text: block.text, level: block.level });
      else if (block.type === "blockquote") visit(block.children);
      else if (block.type === "list") block.items.forEach(visit);
      else if (block.type === "component" && !block.name.startsWith("meta-")) {
        visit(block.children);
        Object.values(block.slots).forEach(visit);
      }
    }
  };
  visit(parseMarkdown(content));
  return headings;
}

/** Top-level meta-* components are named article layout slots, as in upstream MDC. */
export function splitContentSlots(blocks: MarkdownBlock[]): {
  body: MarkdownBlock[];
  slots: Record<string, Extract<MarkdownBlock, { type: "component" }>>;
} {
  const body: MarkdownBlock[] = [];
  const slots: Record<string, Extract<MarkdownBlock, { type: "component" }>> = {};
  for (const block of blocks) {
    if (block.type === "component" && block.name.startsWith("meta-") && block.name.length > 5) {
      const name = block.name.slice(5);
      if (!forbiddenKey.test(name)) slots[name] = block;
    } else body.push(block);
  }
  return { body, slots };
}

/** Shared semantic text for excerpts and search; component syntax and code are omitted. */
export function extractPlainText(blocks: MarkdownBlock[]): string {
  return blocks.map((block): string => {
    switch (block.type) {
      case "heading": case "paragraph": return inlineText(block.children);
      case "math": return block.value;
      case "blockquote": case "footnote-definition": return extractPlainText(block.children);
      case "list": return block.items.map(extractPlainText).join("\n");
      case "table": return [block.headers, ...block.rows].map((row) => row.map(inlineText).join(" ")).join("\n");
      case "component": {
        if (block.name.startsWith("meta-") || block.name === "mermaid" || block.name === "music-score") return "";
        const labels = ["title", "text", "description", "caption", "author", "footer"].flatMap((key) => typeof block.props[key] === "string" ? [block.props[key]] : []);
        return [...labels, extractPlainText(block.children), ...Object.values(block.slots).map(extractPlainText)].filter(Boolean).join("\n");
      }
      case "code": case "hr": return "";
    }
  }).filter(Boolean).join("\n");
}
