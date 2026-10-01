export type CodeMeta = {
  language: string;
  filename?: string;
  highlights: { start: number; end: number }[];
  diff: boolean;
  wrap?: boolean;
  expand?: boolean;
  indent?: number;
  icon?: string;
  words?: string[];
};

export type CodeToken = {
  text: string;
  kind?: "comment" | "keyword" | "string" | "number" | "function" | "tag" | "punctuation" | "selector" | "property" | "value";
  lightColor?: string;
  darkColor?: string;
  fontStyle?: number;
  darkFontStyle?: number;
  lineNumber?: number;
  lineClasses?: string[];
  highlighted?: boolean;
  indentGuide?: boolean;
};

export function codeTokenLines(tokens: CodeToken[]): CodeToken[][] {
  const lines: CodeToken[][] = [[]];
  for (const token of tokens) {
    token.text.split("\n").forEach((text, index) => {
      if (index) lines.push([]);
      if (text || (index === 0 && token.lineNumber !== undefined)) lines[lines.length - 1].push({ ...token, text });
    });
  }
  return lines;
}

/** Fence attributes are data only; never evaluate arbitrary Markdown attributes. */
export function parseCodeMeta(info: string): CodeMeta {
  const rawLanguage = info.trim().match(/^[\w+-]+/)?.[0] ?? "";
  const filename =
    info.match(/\bfilename=(?:"([^"\n]*)"|'([^'\n]*)')/)?.slice(1).find(Boolean) ??
    info.match(/\[([^\]\n]+)\]/)?.[1];
  const highlighted = info.match(/(?:highlight=)?\{([^}]*)\}/)?.[1] ?? "";
  const highlights: CodeMeta["highlights"] = [];
  const controls = info.replace(/\bfilename=(?:"[^"\n]*"|'[^'\n]*')|\[[^\]\n]*\]/g, "");
  const flags = controls.replace(/\/[^/\n]+\//g, "").replace(/\w+=(?:"[^"\n]*"|'[^'\n]*')/g, "");
  const flag = (name: string) => new RegExp(`(?:^|\\s)${name}(?:=true)?(?=\\s|$)`).test(flags);
  const rawIndent = controls.match(/(?:^|\s)indent=(\d+)(?=\s|$)/)?.[1];
  const indent = rawIndent ? Number(rawIndent) : 0;
  const rawIcon = controls.match(/(?:^|\s)icon=(?:"([^"\n]*)"|'([^'\n]*)'|(\S+))/)?.slice(1).find(Boolean);
  const icon = rawIcon && /^[a-z0-9-]+:[a-z0-9-]+$/.test(rawIcon) ? rawIcon : undefined;
  const words = [...controls.matchAll(/\/([^/\n]+)\//g)].map(match => match[1]).slice(0, 20);
  for (const part of highlighted.split(",").slice(0, 100)) {
    const range = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!range) continue;
    const start = Number(range[1]);
    const end = Number(range[2] ?? range[1]);
    if (start >= 1 && end >= start && end <= 1_000_000)
      highlights.push({ start, end });
  }
  return {
    language: rawLanguage.replace(/^diff-/, ""),
    filename: filename && filename.length <= 180 && !/[\u0000-\u001f\u007f]/.test(filename)
      ? filename
      : undefined,
    highlights,
    diff: rawLanguage === "diff" || rawLanguage.startsWith("diff-") || flag("diff"),
    ...(flag("wrap") ? { wrap: true } : {}),
    ...(flag("expand") ? { expand: true } : {}),
    ...(indent >= 1 && indent <= 16 ? { indent } : {}),
    ...(icon ? { icon } : {}),
    ...(words.length ? { words } : {}),
  };
}

export function codeLines(value: string): string[] {
  return (value.endsWith("\n") ? value.slice(0, -1) : value).split("\n");
}

export function codeStats(value: string) {
  const lines = codeLines(value).length;
  return {
    lines,
    characters: Array.from(value).length,
    bytes: new TextEncoder().encode(value).length,
    collapsible: lines > 32,
  };
}
