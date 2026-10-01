import { Suspense } from "react";
import { getCategories, getPosts } from "@/lib/posts";
import { ArticleFeed } from "@/components/article-feed";
import type { Locale } from "@/lib/i18n";
import { getPageMessages } from "@/lib/page-messages";

export default function HomePage({ locale = "zh" }: { locale?: Locale }) {
  const posts = getPosts(undefined, locale);
  const summaries = posts.map((post) => ({
    locale: post.locale,
    translationKey: post.translationKey,
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: post.category,
    categories: post.categories,
    tags: post.tags,
    cover: post.cover,
    type: post.type,
    featured: post.featured,
    recommend: post.recommend,
    readingMinutes: post.readingMinutes,
    wordCount: post.wordCount,
  }));
  return (
    <Suspense fallback={<div className="feed-loading">{getPageMessages(locale).home.loading}</div>}>
      <ArticleFeed posts={summaries} categories={getCategories(undefined, locale)} />
    </Suspense>
  );
}
