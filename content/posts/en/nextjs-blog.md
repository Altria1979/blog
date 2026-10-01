---
title: Build a Little World of Your Own with Next.js
description: A practical record of this Next.js blog, from Markdown and multilingual reading to page generation and image hosting with Alibaba Cloud OSS.
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

Altria currently keeps this building record and three annual reviews. This article follows the actual repository: how writing becomes a page, which features already work, and how Alibaba Cloud OSS stores images independently. **Give the content a stable home, then improve writing and reading one step at a time.**

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
description: A record of content, reading, and image hosting.
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

## 6. Bring the Juejin Records Home

The three annual reviews were migrated with their text, original publication dates, and source links. Images were organized by article. Their stable filenames are `2023-year-in-review`, `2024-year-in-review`, and `2025-year-in-review`. Later additions do not require resetting the original publication date.

HTML exported from another platform still needs review: image layouts, embedded styles, and special tags should be converted to supported Markdown or MDC components. The renderer now groups consecutive images into rows automatically, without a custom layout for each article. The priorities are preserving the text, keeping the image sequence intact, and retaining traceable sources. A completed migration needs a paragraph-by-paragraph reading check, beyond confirming that cards appear on the home page.

Those images noticeably increase local assets. Keeping large originals under `public` and in Git makes cloning, building, and backups heavier. Replacing pictures can also continue growing repository history. That is the practical reason for moving image storage to OSS.

## 7. Store Images in Alibaba Cloud OSS

This blog stores and serves images through Alibaba Cloud OSS's default HTTPS address. The bucket uses Standard storage with LRS redundancy in Hong Kong, `cn-hongkong`. The initial migration contains 81 images totaling 18,931,196 bytes, each verified for SHA-256 and `Content-Type`. Writing, code, and a small image manifest stay in the repository, while OSS provides the image files.

Articles retain logical paths such as `/images/posts/nextjs-blog/wallhaven-y8137x.jpg`, corresponding to the OSS object key `images/posts/nextjs-blog/wallhaven-y8137x.jpg`. The image URL helper joins those paths to the storage origin during rendering, so a later address change does not require rewriting every article. The project uses the following OSS origin by default, with `NEXT_PUBLIC_IMAGE_BASE_URL` available as an override. This setup uses the bucket's default domain and does not require a custom domain.

```dotenv
NEXT_PUBLIC_SITE_URL=https://blog.example.com
NEXT_PUBLIC_IMAGE_BASE_URL=https://altria-blog-images-5225758.oss-cn-hongkong.aliyuncs.com
```

Replace `NEXT_PUBLIC_SITE_URL` with the blog's production address. The image origin contains only the HTTPS scheme and hostname, without `/images`, an object path, query parameters, or credentials. The final cover URL combines this origin with `/images/posts/nextjs-blog/wallhaven-y8137x.jpg` from the Markdown.

`content/image-assets.json` retains each image's dimensions, byte count, SHA-256, and type. Body rendering reads dimensions from the manifest, allowing layout space to be reserved after images move off the local filesystem. For a new image, temporarily place it under its logical path in `public/images`, update the manifest, then upload and verify it. The manifest command updates metadata only; it does not upload or delete files:

```bash
npm run images:manifest
```

Uploads use the local Alibaba Cloud CLI with an existing OAuth login, without placing long-lived access keys in the project. The following preserves the initial batch migration's command structure. Replace `BUCKET` with your bucket name and make sure the local directory contains files to upload:

```bash
aliyun ossutil cp public/images/ oss://BUCKET/images/ --recursive --region cn-hongkong --cache-control 'public, max-age=86400'
aliyun ossutil stat oss://BUCKET/images/posts/nextjs-blog/wallhaven-y8137x.jpg --region cn-hongkong
```

`cp` preserves relative paths under `images/`, while `stat` shows metadata such as an object's size and type. Size alone does not prove identical content: read the cloud file, compare its SHA-256 with the manifest, and check that the page loads it. Anonymous access is limited to reading objects under `images/*`; listing, uploading, and deleting are not allowed anonymously.

OSS serves stored files; **uploading does not automatically shrink large images or create thumbnails**. With `images.unoptimized: true`, the browser loads covers, avatars, and body images directly from OSS, so copying an image address gives the original OSS URL. Next.js no longer compresses, resizes, or converts these images dynamically; prepare sensible dimensions and file sizes before uploading. Set `Content-Type` to match the format. A new filename for a replacement image avoids old cached content.

A public image address may reach the browser; the CLI's OAuth session and other upload credentials must not. Keep them locally or in controlled server or CI environments, with only the permissions they need. Never put access keys, secrets, or tokens in `NEXT_PUBLIC_` variables or Markdown.

For each image update, verify file content, page rendering, share covers, and an independent backup before removing the temporary local images. Keep the manifest so subsequent builds no longer depend on those image files. Ordinary deletion does not remove old binaries from Git history. Rewriting that history is a separate decision with collaboration and recovery implications.

## 8. Move from Local Preview to Publishing

For this existing repository, install from the lockfile and start the development server:

```bash
npm ci
npm run dev -- --port 3140
```

After editing, open `/posts/nextjs-blog` and check cover cropping, long code lines, section links, and mobile layout. Open the English and Japanese versions too. Restart development after changing environment variables, and rebuild production so old configuration is not retained.

Run the project's existing checks before publishing:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run start -- --port 3141
```

The final command starts the production server after a successful build. Beyond command results, inspect the home page, archives, article pages, search, themes, 404s, RSS, and sitemap. Also verify the files returned by OSS, browser image requests, and absolute share-image URLs. A successful build does not establish that deployment has happened; check these entry points again on the actual published site.

## 9. Leave Room to Grow

The current implementation can already hold technical notes and annual reflections. With images stored in OSS, more attention can go toward writing and maintaining the content. Section-based body search can follow when there are more articles. Comments, short updates, and entertainment collections remain outside the current plan.

For a personal blog, maintainability matters more than feature count: readable files, stable paths, backed-up assets, and a repeatable publishing check. Solve one real problem with each change, and this little world can keep growing.
