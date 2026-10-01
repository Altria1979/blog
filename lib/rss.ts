import { blogConfig } from "@/blog.config";
import { getPosts } from "@/lib/posts";

import { localePath, languageTag, categoryLabel, type Locale } from "./i18n";
import { siteDescriptions } from "./metadata";

function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  );
}

function feedDate(value: string) {
  return new Date(value.includes("T") ? value : `${value}T00:00:00+08:00`).toUTCString();
}

export function rssResponse(locale: Locale) {
  const posts = getPosts(undefined, locale);
  const siteUrl = blogConfig.url;
  const items = posts
    .map((post) => {
      const url = new URL(localePath(`/posts/${post.slug}`, locale), siteUrl).href;
      return `<item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${feedDate(post.published || post.date)}</pubDate>
      ${(post.categories || [post.category]).map(category => `<category>${escapeXml(categoryLabel(category, locale))}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");
  const lastPublished = posts.map(post => post.updated || post.published || post.date)
    .sort((first, second) => Date.parse(feedDate(second)) - Date.parse(feedDate(first)))[0] || blogConfig.established;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blogConfig.title)}</title>
    <link>${escapeXml(new URL(localePath("/", locale), siteUrl).href)}</link>
    <description>${escapeXml(siteDescriptions[locale])}</description>
    <language>${languageTag(locale)}</language>
    <lastBuildDate>${feedDate(lastPublished)}</lastBuildDate>
    <atom:link href="${escapeXml(new URL(localePath("/rss.xml", locale), siteUrl).href)}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
