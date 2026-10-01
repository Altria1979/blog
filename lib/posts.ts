import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { locales, localePath, type Locale, type LocaleAlternates, type TranslationManifest } from "./i18n";
import { imageUrl } from "./image-assets";
import { parseFrontmatter } from "./frontmatter";
import { extractPlainText, parseMarkdown, safeUrl } from "./markdown";

export type Authorship = "human-only" | "human-ai-polished" | "ai-human-reviewed" | "ai-only";
export type PostReference = { title?: string; link?: string };

export type Post = {
  locale: Locale;
  translationKey: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categories?: string[];
  tags: string[];
  cover: string;
  coverPosition?: "top" | "center" | "bottom";
  coverDim?: boolean;
  coverFilter?: string;
  hideInfo?: boolean;
  type: "tech" | "story";
  license?: string;
  licenseUrl?: string;
  authorship?: Authorship;
  references?: PostReference[];
  seoTitle?: string;
  seoDescription?: string;
  published?: string;
  updated?: string;
  recommend?: number;
  aside?: string[];
  featured: boolean;
  readingMinutes: number;
  wordCount: number;
  content: string;
};

const postsDirectory = () => join(process.cwd(), "content", "posts");

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringList(value: unknown): string[] {
  return [...new Set((Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [])
    .map(text).filter((item): item is string => !!item))];
}

function bool(value: unknown): boolean {
  return value === true || (typeof value === "string" && value.toLowerCase() === "true");
}

/** Local CSS effects only: filter URLs must never load an author-supplied SVG. */
function imageFilter(value: unknown): string | undefined {
  const filter = text(value);
  if (!filter || filter.length > 500) return undefined;
  if (filter === "none") return filter;
  return /^(?:(?:blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|opacity|saturate|sepia)\([\w\s.,%#+-]*\)\s*)+$/i.test(filter)
    ? filter : undefined;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

/** Keep the author's calendar date for archives, and retain timezone information for feeds and SEO. */
function articleDate(value: unknown): { day: string; timestamp: string } | undefined {
  const raw = text(value);
  const match = raw?.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})?)?$/);
  if (!match || !isValidDate(match[1])) return undefined;
  if (match[2] === undefined) return { day: match[1], timestamp: match[1] };
  const [, day, hour, minute, second = "00", fraction = "", zone = "+08:00"] = match;
  if (+hour > 23 || +minute > 59 || +second > 59) return undefined;
  const offset = zone.match(/^[+-](\d{2}):?(\d{2})$/);
  if (offset && (+offset[1] > 23 || +offset[2] > 59)) return undefined;
  const timezone = offset ? `${zone[0]}${offset[1]}:${offset[2]}` : zone;
  const timestamp = `${day}T${hour}:${minute}:${second}${fraction}${timezone}`;
  return Number.isFinite(Date.parse(timestamp)) ? { day, timestamp } : undefined;
}

function referenceList(value: unknown): PostReference[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const references = value.slice(0, 100).flatMap((item): PostReference[] => {
    const entry = record(item);
    const title = text(entry.title);
    const rawLink = text(entry.link);
    const link = rawLink ? safeUrl(rawLink) : undefined;
    if ((rawLink && !link) || (!title && !link)) return [];
    return [{ ...(title ? { title } : {}), ...(link ? { link } : {}) }];
  });
  return references.length ? references : undefined;
}

function countWords(content: string, locale: Locale): number {
  const plain = extractPlainText(parseMarkdown(content));
  const characters = locale === "ja" ? /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]/gu : /\p{Script=Han}/gu;
  const chinese = plain.match(characters)?.length ?? 0;
  const words =
    plain.replace(characters, " ").match(/[\p{Letter}\p{Number}]+/gu)
      ?.length ?? 0;
  return chinese + words;
}

function inferDescription(content: string): string {
  return extractPlainText(parseMarkdown(content)).replace(/\s+/g, " ").trim().slice(0, 160);
}

export function parsePost(slug: string, source: string, locale: Locale = "zh"): Post | undefined {
  const parsed = parseFrontmatter(source);
  if (!parsed) return undefined;
  const { metadata, content } = parsed;
  const date = articleDate(metadata.date ?? metadata.published);
  const published = articleDate(metadata.published);
  const updated = articleDate(metadata.updated);
  if (
    bool(metadata.draft) ||
    (metadata.locale !== undefined && metadata.locale !== locale) ||
    !date ||
    (metadata.published !== undefined && !published) ||
    (metadata.updated !== undefined && !updated)
  ) {
    return undefined;
  }

  const wordCount = countWords(content, locale);
  const categoryPath = stringList(metadata.categories);
  const category = text(metadata.category) || categoryPath[0] || "随笔";
  const categories = [category, ...categoryPath.filter(item => item !== category)];
  const cover = metadata.cover ?? metadata.image;
  const recommend = typeof metadata.recommend === "number" && Number.isFinite(metadata.recommend)
    ? metadata.recommend : bool(metadata.recommend) ? 1 : undefined;
  const license = record(metadata.license);
  const seo = record(metadata.seo);
  const meta = record(metadata.meta);
  const hideInfo = metadata.hideInfo ?? meta.hideInfo;
  const coverDim = metadata.coverDim ?? meta.coverDim;
  const authorship = text(metadata.authorship);
  return {
    locale,
    translationKey: text(metadata.translationKey) || slug,
    slug,
    title: text(metadata.title) || slug,
    description: text(metadata.description) || inferDescription(content),
    date: date.day,
    published: published?.timestamp ?? (date.timestamp !== date.day ? date.timestamp : undefined),
    updated: updated?.timestamp,
    category,
    categories,
    tags: stringList(metadata.tags),
    cover: cover === false || cover === "false" ? "" : imageUrl(text(cover) || "/images/sea.jpg"),
    coverPosition: metadata.coverPosition === "top" || metadata.coverPosition === "center" || metadata.coverPosition === "bottom"
      ? metadata.coverPosition
      : undefined,
    coverDim: coverDim === undefined ? undefined : bool(coverDim),
    coverFilter: imageFilter(metadata.coverFilter ?? meta.coverFilter),
    hideInfo: hideInfo === undefined ? undefined : bool(hideInfo),
    type: metadata.type === "story" ? "story" : "tech",
    license: text(metadata.license) || text(license.name),
    licenseUrl: safeUrl(text(license.url) || ""),
    authorship: authorship && ["human-only", "human-ai-polished", "ai-human-reviewed", "ai-only"].includes(authorship)
      ? authorship as Authorship : undefined,
    references: referenceList(metadata.references),
    seoTitle: text(metadata.seoTitle) || text(seo.title),
    seoDescription: text(metadata.seoDescription) || text(seo.description),
    recommend,
    aside: Array.isArray(metadata.aside) ? stringList(metadata.aside).filter(name => name === "toc" || /^meta-aside-[\w-]+$/.test(name)) : undefined,
    featured: metadata.featured !== undefined ? bool(metadata.featured) : (recommend ?? 0) > 0,
    readingMinutes: Math.max(1, Math.ceil(wordCount / 300)),
    wordCount,
    content,
  };
}

/** The optional directory keeps content checks independent of the site's own posts. */
export function getPosts(directory: string = postsDirectory(), locale: Locale = "zh"): Post[] {
  const localizedDirectory = locale === "zh" ? directory : join(directory, locale);
  let files;
  try {
    files = readdirSync(localizedDirectory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  return files
    .filter(
      (file) =>
        file.isFile() &&
        !file.name.startsWith(".") &&
        file.name.endsWith(".md"),
    )
    .map((file) =>
      parsePost(
        file.name.slice(0, -3),
        readFileSync(join(localizedDirectory, file.name), "utf8"),
        locale,
      ),
    )
    .filter((post): post is Post => post !== undefined)
    .sort((first, second) => {
      if (first.date !== second.date) return first.date > second.date ? -1 : 1;
      return first.slug < second.slug ? -1 : first.slug > second.slug ? 1 : 0;
    });
}

export function getPost(
  slug: string,
  directory: string = postsDirectory(),
  locale: Locale = "zh",
): Post | undefined {
  // Resolve against known filenames; user input never becomes a filesystem path.
  return getPosts(directory, locale).find((post) => post.slug === slug);
}

export function getCategories(
  directory: string = postsDirectory(),
  locale: Locale = "zh",
): { name: string; count: number }[] {
  const categories = new Map<string, number>();
  for (const post of getPosts(directory, locale)) {
    categories.set(post.category, (categories.get(post.category) ?? 0) + 1);
  }
  return [...categories]
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => {
      if (first.count !== second.count) return second.count - first.count;
      return first.name < second.name ? -1 : first.name > second.name ? 1 : 0;
    });
}

/** The same publication list drives language switching, SEO and the sitemap. */
export function getTranslationManifest(directory: string = postsDirectory()): TranslationManifest {
  const groups = new Map<string, LocaleAlternates>();
  const posts = locales.flatMap((locale) => getPosts(directory, locale));
  for (const post of posts) {
    const group = groups.get(post.translationKey) ?? {};
    if (group[post.locale]) throw new Error(`Duplicate ${post.locale} translation: ${post.translationKey}`);
    group[post.locale] = localePath(`/posts/${post.slug}`, post.locale);
    groups.set(post.translationKey, group);
  }
  return Object.fromEntries(posts.map((post) => [
    localePath(`/posts/${post.slug}`, post.locale), groups.get(post.translationKey)!,
  ]));
}
