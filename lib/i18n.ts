export const locales = ["zh", "en", "ja"] as const;
export type Locale = (typeof locales)[number];
export type LocaleAlternates = Partial<Record<Locale, string>>;
export type TranslationManifest = Record<string, LocaleAlternates>;

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

export function languageTag(locale: Locale): string {
  return { zh: "zh-CN", en: "en", ja: "ja" }[locale];
}

export function splitLocalePath(path: string): { locale: Locale; path: string } {
  const match = path.match(/^\/(en|ja)(?=\/|\?|#|$)/);
  if (!match) return { locale: "zh", path };
  const rest = path.slice(match[0].length);
  return { locale: match[1] as Locale, path: rest.startsWith("/") ? rest : `/${rest}` };
}

/** Keep query values and anchors intact; Chinese URLs remain unprefixed. */
export function localePath(path: string, locale: Locale): string {
  const base = splitLocalePath(path).path;
  if (locale === "zh") return base;
  return `/${locale}${base === "/" ? "" : base.startsWith("/?") || base.startsWith("/#") ? base.slice(1) : base}`;
}

export function getLocaleAlternates(pathname: string, manifest: TranslationManifest): LocaleAlternates {
  let path: string;
  try { path = decodeURI(pathname).replace(/\/$/, "") || "/"; } catch { return {}; }
  if (manifest[path]) return manifest[path];
  const base = splitLocalePath(path).path;
  if (!["/", "/archives", "/about"].includes(base)) return {};
  return Object.fromEntries(locales.map((locale) => [locale, localePath(base, locale)]));
}

const labels: Record<string, [string, string]> = {
  技术: ["Technology", "技術"], 日常: ["Daily life", "日常"],
  随笔: ["Essays", "随筆"], 笔记: ["Notes", "ノート"],
  博客: ["Blog", "ブログ"], 生活: ["Life", "暮らし"],
  年终总结: ["Year in review", "一年の振り返り"], 工作: ["Work", "仕事"],
  写作: ["Writing", "文章"], 音乐: ["Music", "音楽"],
  摄影: ["Photography", "写真"], 自然: ["Nature", "自然"],
  前端: ["Frontend", "フロントエンド"], 设计: ["Design", "デザイン"],
  学习: ["Learning", "学習"], 阅读: ["Reading", "読書"],
  前端开发: ["Frontend development", "フロントエンド開発"],
  "VRM 模型设计": ["VRM model design", "VRM モデルのデザイン"],
  全栈开发: ["Full-stack development", "フルスタック開発"],
  "Agent 开发": ["Agent development", "エージェント開発"],
  日语学习: ["Learning Japanese", "日本語学習"],
  开源: ["Open source", "オープンソース"], 慢慢生活: ["Slow living", "ゆっくり暮らす"],
};
export function categoryLabel(value: string, locale: Locale): string {
  return locale === "zh" ? value : labels[value]?.[locale === "en" ? 0 : 1] ?? value;
}
export const tagLabel = categoryLabel;
