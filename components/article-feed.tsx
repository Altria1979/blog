"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Post } from "@/lib/posts";
import { articlePage, paginationItems } from "@/lib/article-feed";
import { formatDate } from "@/lib/format";
import { Icon } from "./icon";
import { FeaturedCarousel } from "./featured-carousel";
import { categoryLabel, tagLabel, localePath } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";

export type PostSummary = Omit<Post, "content">;

export function ArticleFeed({
  posts,
  categories,
}: {
  posts: PostSummary[];
  categories: { name: string; count: number }[];
}) {
  const locale = useLocale();
  const t = getMessages(locale);
  const params = useSearchParams();
  const router = useRouter();
  const categoryMenu = useRef<HTMLDetailsElement>(null);
  const categoryTrigger = useRef<HTMLElement>(null);
  const category = params.get("category") || "";
  const tag = params.get("tag") || "";
  const filtered = posts.filter(
    (post) =>
      (!category || post.category === category || post.categories?.includes(category)) &&
      (!tag || post.tags.includes(tag)),
  );
  const { page, pageCount, start, end } = articlePage(filtered.length, params.get("page"));

  useEffect(() => {
    function closeCategoryMenu(event: PointerEvent | KeyboardEvent) {
      const menu = categoryMenu.current;
      if (!menu?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== "Escape") return;
        event.preventDefault();
      } else if (menu.contains(event.target as Node)) {
        return;
      }
      menu.open = false;
      categoryTrigger.current?.focus();
    }
    document.addEventListener("pointerdown", closeCategoryMenu);
    document.addEventListener("keydown", closeCategoryMenu);
    return () => {
      document.removeEventListener("pointerdown", closeCategoryMenu);
      document.removeEventListener("keydown", closeCategoryMenu);
    };
  }, []);

  function selectCategory(value: string) {
    if (categoryMenu.current?.open) {
      categoryMenu.current.open = false;
      categoryTrigger.current?.focus();
    }
    const next = new URLSearchParams();
    if (value) next.set("category", value);
    router.push(localePath(next.size ? `/?${next}` : "/", locale), { scroll: false });
  }
  function selectPage(value: number) {
    const next = new URLSearchParams(params);
    if (value > 1) next.set("page", String(value));
    else next.delete("page");
    router.push(localePath(next.size ? `/?${next}` : "/", locale), { scroll: false });
    document
      .getElementById("articles")
      ?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
  }
  return (
    <>
      {!category && !tag && page === 1 && (
        <FeaturedCarousel posts={posts.filter((post) => post.featured).sort((first, second) => (second.recommend ?? 0) - (first.recommend ?? 0))} />
      )}
    <section id="articles" className="articles-section" aria-label={t.articleList}>
      <div className="filter-bar">
        <details
          className="category-filter"
          ref={categoryMenu}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              event.currentTarget.open = false;
            }
          }}
        >
          <summary ref={categoryTrigger} className={category ? "category-label" : undefined} data-category={category || undefined}>
            <Icon name="folder" />
            {category ? categoryLabel(category, locale) : t.allCategories}
          </summary>
          <div className="category-menu" role="group" aria-label={t.articleCategories}>
            <button
              type="button"
              aria-pressed={!category && !tag}
              className={!category && !tag ? "selected" : ""}
              onClick={() => selectCategory("")}
            >
              {t.allCategories}
            </button>
            {categories.map((item) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={category === item.name}
                className={`category-label${category === item.name ? " selected" : ""}`}
                data-category={item.name}
                onClick={() => selectCategory(item.name)}
              >
                {categoryLabel(item.name, locale)}
              </button>
            ))}
          </div>
        </details>
      </div>
      {tag && (
        <div className="active-filter">
          <Icon name="tag" width="14" height="14" /> {tagLabel(tag, locale)}
          <button
            type="button"
            onClick={() => selectCategory("")}
            aria-label={t.clearTag}
          >
            <Icon name="close" width="14" height="14" />
          </button>
        </div>
      )}
      <div className="article-list">
        {filtered.slice(start, end).map((post) => (
          <Link
            className={`post-card${post.cover ? "" : " no-cover"}`}
            href={localePath(`/posts/${post.slug}`, post.locale ?? locale)}
            key={post.slug}
          >
            {post.cover && <div className="post-cover">
              <Image
                src={post.cover}
                style={{ objectPosition: post.coverPosition }}
                alt=""
                fill
                sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 816px) calc(100vw - 288px), (max-width: 1080px) 340px, (max-width: 1152px) calc(100vw - 624px), 340px"
              />
            </div>}
            <div className="post-card-content">
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <div className="post-meta">
                <span>
                  <Icon name="pencil" width="14" height="14" />
                  <time dateTime={post.date}>{formatDate(post.date, false, locale)}</time>
                </span>
                <span className="post-category category-label" data-category={post.category}>
                  <Icon name="tag" width="14" height="14" />
                  {categoryLabel(post.category, locale)}
                </span>
                <span>
                  <Icon name="pilcrow" width="14" height="14" />
                  {t.wordCount(post.wordCount)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state surface">
          <Icon name="folder" width="30" height="30" />
          <h2>{t.noArticles}</h2>
          <p>{t.noArticlesHint}</p>
          <button
            className="text-button"
            type="button"
            onClick={() => selectCategory("")}
          >
            {t.browseArticles} <Icon name="arrow" width="16" height="16" />
          </button>
        </div>
      )}
      {pageCount > 1 && (
        <nav className="pagination" aria-label={t.pagination}>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => selectPage(page - 1)}
            aria-label={t.previousPage}
          >
            <Icon name="arrow" className="rotate-180" width="17" height="17" />
          </button>
          {paginationItems(page, pageCount).map((item, index) => item === "ellipsis" ? (
            <span className="pagination-ellipsis" aria-hidden="true" key={`ellipsis-${index}`}>…</span>
          ) : (
            <button
              type="button"
              key={item}
              aria-current={page === item ? "page" : undefined}
              onClick={() => selectPage(item)}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            disabled={page === pageCount}
            onClick={() => selectPage(page + 1)}
            aria-label={t.nextPage}
          >
            <Icon name="arrow" width="17" height="17" />
          </button>
        </nav>
      )}
      <p className="feed-footnote">
        {t.feedFootnote} <Icon name="coffee" width="14" height="14" />
      </p>
    </section>
    </>
  );
}
