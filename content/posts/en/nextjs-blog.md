---
title: Build a Little World of Your Own with Next.js
description: A practical record of this Next.js blog, from Markdown and multilingual reading to content structure, page generation, and the reading experience.
date: 2026-09-30
category: 技术
tags: Next.js, React, 博客
cover: /images/posts/nextjs-blog/wallhaven-y8137x.jpg
coverPosition: top
featured: true
locale: en
translationKey: nextjs-blog
---

There are plenty of places to publish online, but a blog of your own still means something special. Technical notes can be revised over time, annual reflections can be browsed by year, and the pages can take a shape you enjoy.

Altria currently keeps this building record and three annual reviews. This article follows the actual repository: how writing becomes a page and which reading features already work. **Give the content a stable home, then improve writing and reading one step at a time.**

## Design References and Thanks

This site's layout and visual style draw on the following websites and open-source project, recreated and adapted in Next.js / React:

- [Shinya's Blog](https://blog.shinya.click/), by [senshinya (Shinya)](https://github.com/senshinya).
- [Zhilu's Blog](https://blog.zhilu.site/) and its open-source project, [L33Z22L11/blog-v3](https://github.com/L33Z22L11/blog-v3) (Clarity).

Thanks to both authors for sharing their designs and implementations. Building on these references, Altria keeps its own site identity and articles, with pages, content loading, and interactions implemented for this Next.js project.

## 1. Keep the Content Structure Simple

The project uses Next.js 16.3.7, React 19.3.0, TypeScript, and the App Router. Articles live in Markdown files, with site settings in `blog.config.ts`. There is currently no database or content management dashboard. Git can track and restore both writing and code without requiring another system just to publish a few posts.

```text
app/(zh)/                 Chinese home, archives, and post routes
app/[locale]/             English and Japanese routes
app/_pages/               Shared page implementations
content/posts/            Chinese Markdown
content/posts/en/         English translations
content/posts/ja/         Japanese translations
lib/posts.ts              Content loading, validation, translations
lib/markdown.ts           Body parsing and heading anchors
components/               Reading, search, and theme components
blog.config.ts            Site name, author, domain, and settings
```

This separates two kinds of work. Writing mostly changes `content/posts`; improving the reading experience mostly changes components and styles. A new article does not need a copied page component, and replacing its cover does not change its address.

## 2. Start Writing in Markdown

Each file begins with metadata, followed by the body. This article's basic format looks like this:

```markdown
---
title: Build a Little World of Your Own with Next.js
description: A record of content structure, page generation, and the reading experience.
date: 2026-09-30
category: 技术
tags: Next.js, React, 博客
cover: /images/posts/nextjs-blog/wallhaven-y8137x.jpg
featured: true
locale: en
translationKey: nextjs-blog
---

## Start with Content

Write the body here, with **bold text** for emphasis.
```

Frontmatter now uses a YAML parser, supporting arrays, nested objects, multiline descriptions, and quoted escapes. Existing single-line fields and comma-separated tags remain valid. Dates accept a valid `YYYY-MM-DD`, `YYYY-MM-DD HH:mm:ss`, or ISO timestamp, while archives retain the original calendar date. `featured: true` makes an article eligible for the featured area, `cover: false` removes its cover, and `draft: true` excludes it from the public content list in both development and production.

The upstream fields `categories`, `image`, `recommend`, `published`, and `updated` are also supported. Use `seoTitle` and `seoDescription`, or a nested `seo` object, for search metadata; `references` supplies reference links, and `authorship` explicitly declares how a post was written. Licenses come from actual article or site declarations. Existing posts do not receive an invented license, and `permalink` does not replace their established URLs.

The filename supplies the slug: the Chinese original `nextjs-blog.md` resolves to `/posts/nextjs-blog`. Chinese files use the Chinese locale by default. Titles can change, but filenames should remain stable because bookmarks and shared links depend on them.

Beyond headings, paragraphs, lists, quotations, links, images, tables, and fenced code, the body supports task lists, strikethrough, footnotes, reference links, hard breaks, and mathematics. MDC syntax adds predefined alerts, folding sections, tabs, cards, poetry, chats, timelines, and other components. Mermaid and ABC fences render diagrams and musical scores. Copyable examples live in the repository's `docs/markdown-examples.md`; ordinary posts can still use plain Markdown.

HTML is limited to allowed formatting elements and safe attributes. Scripts, event handlers, template expressions, arbitrary iframes, and JSX do not execute. Videos use a dedicated component with supported sources. GitHub cards query only an explicitly named public repository, and Iconify loads explicitly requested icons; network failures leave links or explanatory text. Scores play only after a click, and their notation and source remain readable if external soundfonts cannot load.

## 3. Read Content on the Server, Handle Interaction in the Browser

`lib/posts.ts` reads files on the server and removes drafts, invalid dates, and records with a mismatched locale before creating the post list. Home, archives, article pages, and feeds share this content entry point, reducing the risk of an article disappearing from one view while remaining in another.

The Chinese article route uses `generateStaticParams` to list pages to generate at build time. Its essential page logic is:

```tsx
import Content from "@/app/_pages/post";
import { getPosts } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export default async function Page({ params }: Props) {
  return <Content slug={(await params).slug} locale="zh" />;
}
```

Route parameters in this Next.js version are a Promise, so they must be read first. The build prerenders known articles, while missing articles return 404 through `notFound()`. Prerendered posts do not mean the whole project is configured as a static export. Published content changes still require a new build and deployment.

Search, theme switching, category filters, the active table of contents, code copying, and image lightboxes need browser events or state, so they use Client Components. File access and body parsing stay on the server. `"use client"` defines a module boundary; applying it to specific interactive components makes the browser's code requirements easier to control. See the official [Server and Client Components guide](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [generateStaticParams reference](https://nextjs.org/docs/app/api-reference/functions/generate-static-params).

## 4. Make the Reading Details Work

The cover, description, and body have distinct places on the article page. Text width, line height, and spacing on phones decide whether a long article is comfortable to read. A good cover should still leave room for the title and the writing.

The table of contents comes from body headings and shares their anchors. It marks the current section during scrolling, appears in the desktop sidebar, and uses a drawer on narrow screens. Reading progress appears at the top. Changing a heading can change its anchor, so externally linked section titles deserve care too.

Code blocks load Shiki languages on demand with light and dark colors, copying, wrapping, indent guides, and folding. More than 32 lines collapse to 16 by default; fence options such as `wrap`, `expand`, and `indent=2` adjust the presentation. Shiki comment notations mark differences, highlights, focus, and errors. Copying returns the original code without displayed line numbers, while unknown languages or highlighting failures still display the source.

Body images load lazily and can be enlarged. Consecutive image-only paragraphs automatically form rows according to image orientation, with up to four pictures per row on desktop and two on phones, preserving order and aspect ratios. Text, headings, or a horizontal rule separate groups. Failed images retain their descriptions, so useful `alt` text still helps with slow connections, missing files, and assistive reading tools.

## 5. Be Precise About Search, Translations, and Feeds

Search currently checks titles, descriptions, categories, and tags. It ignores case and matches a continuous substring. Open it with `⌘ K` or `Ctrl K`. **It is not body-text search yet**: a sentence found only halfway through an article will not produce a match. There are no section-level results, fuzzy spelling corrections, or relevance ranking. A section index can come later as the collection grows.

Interface language and article translation are separate concerns. This post has maintained English and Japanese files, connected by `translationKey: nextjs-blog`. The Chinese URL stays unchanged; translations use `/en/posts/nextjs-blog` and `/ja/posts/nextjs-blog`. Articles without translations do not receive pretend translated pages or call a translation service at runtime.

Titles, descriptions, canonical URLs, Open Graph data, and structured data come from article metadata and site settings. Language alternatives contain only actual translations. `/sitemap.xml` helps discover pages; `/rss.xml` and localized feeds contain titles, summaries, and article links, rather than complete bodies. Set the real `NEXT_PUBLIC_SITE_URL` before publishing, or copied links and search metadata may still point to a local address. The [Next.js metadata guide](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) explains the underlying APIs.
