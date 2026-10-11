import type { ContentProps, InlineNode, MarkdownBlock } from "./markdown";

type MarkdownNode = MarkdownBlock | InlineNode;

function visit(nodes: MarkdownNode[], callback: (node: MarkdownNode) => void) {
  for (const node of nodes) {
    callback(node);
    if ("children" in node) visit(node.children, callback);
    if (node.type === "component" && "slots" in node) {
      for (const slot of Object.values(node.slots)) visit(slot, callback);
    }
    if (node.type === "list") {
      for (const item of node.items) visit(item, callback);
    }
    if (node.type === "table") {
      for (const cell of [...node.headers, ...node.rows.flat()]) visit(cell, callback);
    }
  }
}

function idValue(value: ContentProps[string]): string | undefined {
  return (typeof value === "string" || typeof value === "number") && String(value)
    ? String(value) : undefined;
}

function componentProps(node: Extract<MarkdownNode, { type: "component" }>): ContentProps[] {
  // Video IDs identify remote media; they are not element IDs.
  const name = node.name.toLowerCase().replace(/_/g, "-");
  if (name === "video-embed") return [];
  const entries = name === "feed-group" && Array.isArray(node.props.entries)
    ? node.props.entries.filter((entry): entry is ContentProps => !!entry && typeof entry === "object" && !Array.isArray(entry))
    : [];
  return [node.props, ...entries];
}

/** Isolate one entry's anchors without changing the parsed source or external links. */
export function scopeMarkdownIds(blocks: MarkdownBlock[], scope: string): MarkdownBlock[] {
  const result = structuredClone(blocks);
  const ids = new Map<string, string>();
  const scoped = (id: string) => `${scope}-${id}`;
  const collectProps = (props?: ContentProps) => {
    const id = props && idValue(props.id);
    if (id) ids.set(id, scoped(id));
  };

  visit(result, (node) => {
    if (node.type === "heading") {
      // The renderer's explicit block.id overrides the heading's attrs.id.
      ids.set(node.id, scoped(node.id));
    } else if (node.type === "footnote-definition") {
      ids.set(`fn-${node.id}`, `fn-${scoped(node.id)}`);
    } else if (node.type === "footnote-reference") {
      ids.set(`fnref-${node.id}-${node.reference}`, `fnref-${scoped(node.id)}-${node.reference}`);
    } else if ("attrs" in node) {
      collectProps(node.attrs);
    }
    if (node.type === "component") componentProps(node).forEach(collectProps);
  });

  const href = (value: string) => {
    if (!value.startsWith("#")) return value;
    let fragment: string;
    try { fragment = decodeURIComponent(value.slice(1)); } catch { return value; }
    const target = ids.get(fragment);
    return target ? `#${encodeURIComponent(target)}` : value;
  };
  const rewriteProps = (props?: ContentProps) => {
    if (!props) return;
    const id = idValue(props.id);
    if (id) props.id = scoped(id);
    for (const key of ["href", "link"]) {
      if (typeof props[key] === "string") props[key] = href(props[key]);
    }
  };

  visit(result, (node) => {
    if (node.type === "heading" || node.type === "footnote-definition" || node.type === "footnote-reference") {
      node.id = scoped(node.id);
    }
    if (node.type === "link") node.href = href(node.href);
    if ("attrs" in node) rewriteProps(node.attrs);
    if (node.type === "component") componentProps(node).forEach(rewriteProps);
  });

  return result;
}
