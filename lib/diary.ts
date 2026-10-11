import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter";
import { locales, type Locale } from "./i18n";
import { parseMarkdown, type InlineNode, type MarkdownBlock } from "./markdown";

export type DiaryEntry = {
  slug: string;
  locale: Locale;
  translationKey: string;
  date: string;
  timestamp: number;
  hasTime: boolean;
  title?: string;
  content: string;
  draft: boolean;
};

export type DiaryPage = {
  entries: DiaryEntry[];
  page: number;
  totalPages: number;
  totalCount: number;
};

const diaryDirectory = () => join(process.cwd(), "content", "diary");
const pageSize = 10;

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function diaryDate(value: unknown): Pick<DiaryEntry, "date" | "timestamp" | "hasTime"> | undefined {
  const date = text(value);
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2}))?$/);
  if (!date || !match) return undefined;
  const [, year, month, day, hour, minute, second = "00", , zone] = match;
  const leapYear = +year % 4 === 0 && (+year % 100 !== 0 || +year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (+year < 1 || +month < 1 || +month > 12 || +day < 1 || +day > daysInMonth[+month - 1]) return undefined;
  const hasTime = hour !== undefined;
  if (hasTime && (+hour > 23 || +minute > 59 || +second > 59)) return undefined;
  const offset = zone?.match(/^[+-](\d{2}):(\d{2})$/);
  if (offset && (+offset[1] > 23 || +offset[2] > 59)) return undefined;
  const timestamp = Date.parse(hasTime ? date : `${date}T00:00:00+08:00`);
  return Number.isFinite(timestamp) ? { date, timestamp, hasTime } : undefined;
}

function visibleText(value: string): boolean {
  return !!value.replace(/<!--[\s\S]*?(?:-->|$)/g, "").trim();
}

function visibleInline(nodes: InlineNode[]): boolean {
  return nodes.some((node) => {
    switch (node.type) {
      case "text": return visibleText(node.value);
      case "image": case "footnote-reference": return true;
      case "code": case "math": return !!node.value.trim();
      case "break": return false;
      default: return visibleInline(node.children);
    }
  });
}

/** Ignore empty Markdown and author comments while allowing images without alt text. */
function visibleBlocks(blocks: MarkdownBlock[]): boolean {
  return blocks.some((block) => {
    switch (block.type) {
      case "paragraph": case "heading": return visibleInline(block.children);
      case "blockquote": case "footnote-definition": return visibleBlocks(block.children);
      case "list": return block.items.some(visibleBlocks);
      case "table": return [block.headers, ...block.rows].some((row) => row.some(visibleInline));
      case "code": case "math": return !!block.value.trim();
      case "hr": return true;
      case "component": return !block.name.startsWith("meta-") && (
        visibleBlocks(block.children) || Object.values(block.slots).some(visibleBlocks) ||
        Object.values(block.props).some((value) => typeof value === "string" && visibleText(value))
      );
    }
  });
}

/** Only publishable entries leave this server-side reader. */
export function parseDiaryEntry(slug: string, source: string, locale: Locale = "zh"): DiaryEntry | undefined {
  const parsed = parseFrontmatter(source);
  if (!parsed) return undefined;
  const { metadata, content } = parsed;
  const draft = metadata.draft === true || (typeof metadata.draft === "string" && metadata.draft.toLowerCase() === "true");
  const date = diaryDate(metadata.date);
  if (draft || !date || (metadata.locale !== undefined && metadata.locale !== locale) || !visibleBlocks(parseMarkdown(content))) return undefined;
  return {
    slug,
    locale,
    translationKey: text(metadata.translationKey) ?? slug,
    ...date,
    title: text(metadata.title),
    content,
    draft,
  };
}

function readLocaleEntries(directory: string, locale: Locale): DiaryEntry[] {
  const localizedDirectory = locale === "zh" ? directory : join(directory, locale);
  let files;
  try {
    files = readdirSync(localizedDirectory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return files
    .filter((file) => file.isFile() && !file.name.startsWith(".") && file.name.endsWith(".md"))
    .flatMap((file) => {
      const entry = parseDiaryEntry(file.name.slice(0, -3), readFileSync(join(localizedDirectory, file.name), "utf8"), locale);
      return entry ? [entry] : [];
    });
}

/** Validate every published translation together, then expose only the requested language. */
export function getDiaryEntries(directory: string = diaryDirectory(), locale: Locale = "zh"): DiaryEntry[] {
  const entries = locales.flatMap((language) => readLocaleEntries(directory, language));
  const translations = new Map<string, Partial<Record<Locale, DiaryEntry>>>();
  for (const entry of entries) {
    const group = translations.get(entry.translationKey) ?? {};
    const duplicate = group[entry.locale];
    if (duplicate) throw new Error(`Duplicate ${entry.locale} diary translation: ${entry.translationKey} (${duplicate.slug}, ${entry.slug})`);
    const original = Object.values(group)[0];
    if (original && (original.timestamp !== entry.timestamp || original.hasTime !== entry.hasTime)) {
      throw new Error(`Mismatched diary translation dates: ${entry.translationKey} (${original.locale}/${original.slug}: ${original.date}, ${entry.locale}/${entry.slug}: ${entry.date})`);
    }
    group[entry.locale] = entry;
    translations.set(entry.translationKey, group);
  }
  return entries.filter((entry) => entry.locale === locale).sort((first, second) =>
    second.timestamp - first.timestamp || (first.slug < second.slug ? -1 : first.slug > second.slug ? 1 : 0),
  );
}

export function getDiaryPage(entries: DiaryEntry[], pageValue: string | string[] | undefined): DiaryPage | undefined {
  if (pageValue !== undefined && (typeof pageValue !== "string" || !/^[1-9]\d*$/.test(pageValue))) return undefined;
  const page = pageValue === undefined ? 1 : Number(pageValue);
  const totalCount = entries.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (!Number.isSafeInteger(page) || page > totalPages) return undefined;
  return { entries: entries.slice((page - 1) * pageSize, page * pageSize), page, totalPages, totalCount };
}
