import { parseDocument } from "yaml";

const forbiddenKeys = new Set(["__proto__", "constructor", "prototype"]);

/** YAML is author data, never executable tags or prototype-bearing configuration. */
export function parseYamlMetadata(source: string): Record<string, unknown> | undefined {
  if (source.length > 128_000) return undefined;
  try {
    const document = parseDocument(source, { schema: "core", strict: true, uniqueKeys: true, stringKeys: true });
    if (document.errors.length || document.warnings.length) return undefined;
    const metadata: unknown = document.toJS({ maxAliasCount: 25 });
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;
    let count = 0;
    const ancestors = new Set<object>();
    function valid(value: unknown, depth: number): boolean {
      if (++count > 10_000 || depth > 32) return false;
      if (typeof value === "number") return Number.isFinite(value);
      if (!value || typeof value !== "object") return ["string", "boolean"].includes(typeof value) || value === null;
      if (ancestors.has(value)) return false;
      ancestors.add(value);
      const entries = Object.entries(value);
      const result = entries.every(([key, child]) => !forbiddenKeys.has(key) && valid(child, depth + 1));
      ancestors.delete(value);
      return result;
    }
    return valid(metadata, 0) ? metadata as Record<string, unknown> : undefined;
  } catch {
    return undefined;
  }
}

export function parseFrontmatter(source: string) {
  const normalized = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const match = normalized.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!match) return undefined;
  // The original reader accepted unquoted colons in these single-line fields.
  // Preserve existing article titles while parsing all new metadata as YAML.
  const yaml = match[1].replace(/^(title|description|seoTitle|seoDescription|license):[ \t]+([^\n]*)$/gm, (line, key: string, raw: string) => {
    const value = raw.trim();
    return /: /.test(value) && !/^["'\[{>|&*!]/.test(value)
      ? `${key}: ${JSON.stringify(value.replace(/\s+#.*$/, ""))}`
      : line;
  });
  const metadata = parseYamlMetadata(yaml);
  return metadata ? { metadata, content: normalized.slice(match[0].length).trim() } : undefined;
}
