import assert from "node:assert/strict";
import test from "node:test";
import { getPosts, parsePost } from "../lib/posts.ts";

const source = (metadata: string, content = "正文 Hello") => `---\n${metadata}\n---\n\n${content}`;

test("YAML metadata accepts upstream arrays, nested SEO and folded descriptions", () => {
  const post = parsePost("original-url", source(`title: "文章: 示例"
date: 2024-09-21 23:18:18
updated: 2026-04-06 17:25:03
published: 2024-09-22T00:10:00+09:00
description: >-
  First paragraph
  continued here.
categories: [技术, 前端]
tags:
  - Markdown
  - "YAML, arrays"
  - Markdown
image: /images/cover.jpg
recommend: 3
seo:
  title: Search title
  description: Search description
permalink: /never-replace-existing-url`));
  assert.ok(post);
  assert.equal(post.slug, "original-url");
  assert.equal(post.title, "文章: 示例");
  assert.equal(post.description, "First paragraph continued here.");
  assert.equal(post.date, "2024-09-21");
  assert.equal(post.updated, "2026-04-06T17:25:03+08:00");
  assert.equal(post.published, "2024-09-22T00:10:00+09:00");
  assert.equal(post.category, "技术");
  assert.deepEqual(post.categories, ["技术", "前端"]);
  assert.deepEqual(post.tags, ["Markdown", "YAML, arrays"]);
  assert.ok(post.cover.endsWith("/images/cover.jpg"));
  assert.equal(post.recommend, 3);
  assert.equal(post.featured, true);
  assert.equal(post.seoTitle, "Search title");
  assert.equal(post.seoDescription, "Search description");
});

test("legacy fields, plain-text colon titles, and explicit false options retain precedence", () => {
  const post = parsePost("legacy", source(`title: 2025年总结: 我还在往前走
description: Notes: old format
date: 2024-02-29
category: 年终总结
tags: Next.js, 生活, Next.js
cover: false
image: /images/ignored.jpg
featured: false
recommend: true
license: 作者保留所有权利
type: story`));
  assert.ok(post);
  assert.equal(post.title, "2025年总结: 我还在往前走");
  assert.equal(post.description, "Notes: old format");
  assert.equal(post.category, "年终总结");
  assert.deepEqual(post.tags, ["Next.js", "生活"]);
  assert.equal(post.cover, "");
  assert.equal(post.featured, false);
  assert.equal(post.license, "作者保留所有权利");
  assert.equal(post.type, "story");
  assert.equal(post.authorship, undefined);
});

test("upstream SEO aliases override nested fields while display title and description stay intact", () => {
  const post = parsePost("seo", source(`date: 2024-01-01
title: Display title
description: Display description
seoTitle: Search title
seoDescription: Search description
seo: {title: Ignored, description: Ignored}`));
  assert.equal(post?.title, "Display title");
  assert.equal(post?.description, "Display description");
  assert.equal(post?.seoTitle, "Search title");
  assert.equal(post?.seoDescription, "Search description");
});

test("upstream header options accept top-level and nested metadata with explicit false precedence", () => {
  const post = parsePost("header", source(`date: 2024-01-01
hideInfo: true
coverDim: true
coverFilter: brightness(0.6) saturate(1.2)`));
  assert.equal(post?.hideInfo, true);
  assert.equal(post?.coverDim, true);
  assert.equal(post?.coverFilter, "brightness(0.6) saturate(1.2)");
  const nested = parsePost("nested", source(`date: 2024-01-01
meta:
  hideInfo: true
  coverDim: true
  coverFilter: grayscale(100%)`));
  assert.equal(nested?.hideInfo, true);
  assert.equal(nested?.coverDim, true);
  assert.equal(nested?.coverFilter, "grayscale(100%)");
  const override = parsePost("override", source(`date: 2024-01-01
hideInfo: false
coverDim: false
coverFilter: none
meta: {hideInfo: true, coverDim: true, coverFilter: blur(2px)}`));
  assert.equal(override?.hideInfo, false);
  assert.equal(override?.coverDim, false);
  assert.equal(override?.coverFilter, "none");
  const defaults = parsePost("defaults", source("date: 2024-01-01"));
  assert.equal(defaults?.hideInfo, undefined);
  assert.equal(defaults?.coverDim, undefined);
  assert.equal(defaults?.coverFilter, undefined);
});

test("cover filters accept CSS filter functions without URLs or declaration injection", () => {
  for (const filter of ["brightness(.75)", "blur(1px) contrast(110%)", "hue-rotate(45deg)", "drop-shadow(0 1px 2px #000)"]) {
    assert.equal(parsePost("filter", source(`date: 2024-01-01\ncoverFilter: '${filter}'`))?.coverFilter, filter);
  }
  for (const filter of ["url(https://example.com/filter.svg#x)", "URL(javascript:alert(1))", "brightness(.5); background:url(https://example.com)", "expression(alert(1))", "var(--external-filter)", "brightness(.5) !important", "brightness(.5)\\75rl(x)"]) {
    assert.equal(parsePost("filter", source(`date: 2024-01-01\ncoverFilter: '${filter}'`))?.coverFilter, undefined, filter);
  }
});

test("publication timestamps preserve the original calendar date and support published-only posts", () => {
  const post = parsePost("late", source("date: 2024-01-01T00:10:00+14:00"));
  assert.equal(post?.date, "2024-01-01");
  assert.equal(post?.published, "2024-01-01T00:10:00+14:00");
  assert.equal(parsePost("published", source("published: 2024-02-29 21:30:00"))?.date, "2024-02-29");
  for (const date of ["2025-02-29 12:00:00", "2024-02-30T00:00:00Z", "2024-01-01 24:00:00", "2024-01-01T12:60:00Z", "2024-01-01T12:00:00+25:00", "2024-1-1"]) {
    assert.equal(parsePost("bad", source(`date: ${date}`)), undefined, date);
  }
});

test("references and license metadata retain safe links and reject active content URLs", () => {
  const post = parsePost("refs", source(`date: 2024-01-01
references:
  - title: Official docs
    link: https://example.com/docs
  - link: /posts/older
  - title: Offline reference
  - title: Unsafe
    link: javascript:alert(1)
license:
  name: CC BY 4.0
  url: https://creativecommons.org/licenses/by/4.0/`));
  assert.deepEqual(post?.references, [
    { title: "Official docs", link: "https://example.com/docs" },
    { link: "/posts/older" },
    { title: "Offline reference" },
  ]);
  assert.equal(post?.license, "CC BY 4.0");
  assert.equal(post?.licenseUrl, "https://creativecommons.org/licenses/by/4.0/");
  assert.equal(parsePost("bad", source("date: 2024-01-01\nlicense: {name: Plain, url: 'javascript:alert(1)'}"))?.licenseUrl, undefined);
});

test("authorship accepts the four upstream declarations without inventing one for old posts", () => {
  for (const authorship of ["human-only", "human-ai-polished", "ai-human-reviewed", "ai-only"]) {
    assert.equal(parsePost("declared", source(`date: 2024-01-01\nauthorship: ${authorship}`))?.authorship, authorship);
  }
  assert.equal(parsePost("unknown", source("date: 2024-01-01\nauthorship: unknown"))?.authorship, undefined);
});

test("YAML core schema preserves text and quoted escapes, and does not coerce dates into objects", () => {
  const post = parsePost("core", source(`title: No
date: 2024-01-01
tags: [on, off, yes, no]
description: "Line with \\"quotes\\" and \\u4e2d"
license: |-
  Line one
  Line two`));
  assert.equal(post?.title, "No");
  assert.deepEqual(post?.tags, ["on", "off", "yes", "no"]);
  assert.equal(post?.description, 'Line with "quotes" and 中');
  assert.equal(post?.license, "Line one\nLine two");
});

test("unsafe keys, malformed YAML, duplicate keys, recursive and excessive aliases are rejected", () => {
  const invalid = [
    "title: [unclosed",
    "title: One\ntitle: Two",
    "__proto__: {polluted: true}",
    "seo: {constructor: {prototype: {polluted: true}}}",
    "seo: {prototype: true}",
    "title: !custom value",
    "a: &a [*a]",
    `a: &a [one, two]\nreferences: [${Array(101).fill("*a").join(",")}]`,
  ];
  for (const metadata of invalid) assert.equal(parsePost("unsafe", source(`date: 2024-01-01\n${metadata}`)), undefined, metadata);
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
});

test("YAML drafts and localized publication still follow the existing visibility contract", () => {
  assert.equal(parsePost("draft", source("date: 2024-01-01\ndraft: true")), undefined);
  assert.equal(parsePost("draft", source('date: 2024-01-01\ndraft: "true"')), undefined);
  assert.equal(parsePost("wrong-locale", source("date: 2024-01-01\nlocale: en")), undefined);
  const translated = parsePost("translated", source("date: 2024-01-01\nlocale: en\ntranslationKey: original"), "en");
  assert.equal(translated?.translationKey, "original");
  assert.equal(translated?.locale, "en");
});

test("all existing published articles remain readable with the YAML parser", () => {
  const slugs = getPosts().map(post => post.slug);
  for (const slug of ["nextjs-blog", "2023-year-in-review", "2024-year-in-review", "2025-year-in-review"]) assert.ok(slugs.includes(slug), slug);
  for (const locale of ["en", "ja"] as const) assert.ok(getPosts(undefined, locale).some(post => post.slug === "nextjs-blog"));
});

test("MDC excerpts and word counts use readable content rather than component syntax", () => {
  const source = '---\ndate: 2026-10-01\n---\n::alert{type="warning"}\n实际正文\n::\n\n```ts\nconst excluded = 123;\n```';
  const post = parsePost("mdc", source);
  assert.equal(post?.description, "实际正文");
  assert.equal(post?.wordCount, 4);
});
