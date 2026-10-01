import type { Metadata } from "next";
import { blogConfig } from "@/blog.config";
import { locales, localePath, languageTag, type Locale, type LocaleAlternates } from "./i18n";
import { getPageMessages } from "./page-messages";
import { imageUrl } from "./image-assets";

export const siteDescriptions: Record<Locale, string> = {
  zh: blogConfig.description,
  en: "Altria’s personal blog about frontend development, technology and the little things in life.",
  ja: "フロントエンド開発、技術の探求、日々の小さな出来事を綴る Altria の個人ブログ。",
};
export function metadataAlternates(locale: Locale, paths: LocaleAlternates) {
  return {
    canonical: paths[locale],
    languages: {
      ...Object.fromEntries(locales.filter((item) => paths[item]).map((item) => [languageTag(item), paths[item]!])),
      ...(paths.zh ? { "x-default": paths.zh } : {}),
    },
    types: { "application/rss+xml": localePath("/rss.xml", locale) },
  };
}
export const pageTitles = {
  zh: { home: blogConfig.title, archives: "文章归档", about: "关于" },
  en: { home: blogConfig.title, archives: "Archives", about: "About" },
  ja: { home: blogConfig.title, archives: "アーカイブ", about: "このブログについて" },
};
export function pageMetadata(page: keyof typeof pageTitles.zh, locale: Locale): Metadata {
  const path = page === "home" ? "/" : `/${page}`;
  const t = getPageMessages(locale);
  const description = page === "archives" ? t.archives.description : page === "about" ? t.about.description(blogConfig.author) : siteDescriptions[locale];
  return {
    title: page === "home" ? { absolute: blogConfig.title } : pageTitles[locale][page], description,
    alternates: metadataAlternates(locale, Object.fromEntries(locales.map((item) => [item, localePath(path, item)]))),
    openGraph: {
      type: "website", title: pageTitles[locale][page], description,
      siteName: blogConfig.title, url: localePath(path, locale),
      locale: { zh: "zh_CN", en: "en_US", ja: "ja_JP" }[locale],
      images: [{ url: imageUrl("/images/mountains.jpg"), width: 1000, height: 667, alt: blogConfig.title }],
    },
  };
}
