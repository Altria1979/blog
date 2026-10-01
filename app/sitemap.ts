import type { MetadataRoute } from "next";
import { blogConfig } from "@/blog.config";
import { getPosts, getTranslationManifest } from "@/lib/posts";
import { locales, localePath, type LocaleAlternates } from "@/lib/i18n";
import { metadataAlternates } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const manifest = getTranslationManifest();
  const latestDate = getPosts()[0]?.date || blogConfig.established;
  const absolute = (paths: LocaleAlternates) => Object.fromEntries(Object.entries(paths).map(([lang, path]) => [lang, new URL(path, blogConfig.url).href]));
  return locales.flatMap((locale) => [
    ...["/", "/archives", "/about"].map((path) => ({
      url: new URL(localePath(path, locale), blogConfig.url).href,
      lastModified: latestDate,
      alternates: { languages: metadataAlternates(locale, absolute(Object.fromEntries(locales.map((item) => [item, localePath(path, item)])))).languages },
    })),
    ...getPosts(undefined, locale).map((post) => {
      const path = localePath(`/posts/${post.slug}`, locale);
      return {
        url: new URL(path, blogConfig.url).href, lastModified: post.date,
        alternates: { languages: metadataAlternates(locale, absolute(manifest[path])).languages },
      };
    }),
  ]);
}
