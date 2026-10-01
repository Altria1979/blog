"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Icon } from "./icon";
import { categoryLabel, tagLabel, localePath, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";


export type SearchPost = {
  locale?: Locale;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
};

export function SearchDialog({ posts }: { posts: SearchPost[] }) {
  const locale = useLocale();
  const t = getMessages(locale);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [opened, setOpened] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = posts.filter((post) =>
    `${post.title} ${post.description} ${categoryLabel(post.category, locale)} ${categoryLabel(post.category, locale)} ${post.tags.join(" ")} ${post.tags.map((tag) => tagLabel(tag, locale)).join(" ")}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
  function open() {
    setQuery("");
    setOpened(true);
  }
  function close() {
    dialog.current?.close();
  }
  useEffect(() => {
    if (!opened) return;
    dialog.current?.showModal();
    input.current?.focus();
  }, [opened]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuery("");
        setOpened(true);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <>
      <button type="button" className="search-trigger" onClick={open}>
        <Icon name="search" width="18" height="18" />
        <span>{t.searchArticles}</span>
        <kbd>⌘ K</kbd>
      </button>
      {opened && createPortal(<dialog
        ref={dialog}
        className="search-dialog"
        onClose={() => setOpened(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        aria-label={t.searchArticles}
      >
        <div className="search-dialog-inner">
          <div className="search-input-row">
            <Icon name="search" />
            <input
              ref={input}
              type="search"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={t.searchKeywords}
            />
            <button
              type="button"
              className="icon-button"
              onClick={close}
              aria-label={t.closeSearch}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="search-results" aria-live="polite">
            <p className="search-result-count">
              {normalizedQuery
                ? t.searchCount(results.length)
                : t.searchPrompt}
            </p>
            {results.length ? (
              results.map((post) => (
                <Link
                  className="search-result"
                  href={localePath(`/posts/${post.slug}`, post.locale ?? locale)}
                  key={post.slug}
                  onClick={close}
                >
                  <span className="search-result-category category-label" data-category={post.category}>
                    {categoryLabel(post.category, locale)}
                  </span>
                  <strong>{post.title}</strong>
                  <p>{post.description}</p>
                  <Icon name="arrow" width="17" height="17" />
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <Icon name="search" width="28" height="28" />
                <h3>{t.searchEmpty}</h3>
                <p>{t.searchRetry}</p>
              </div>
            )}
          </div>
          <div className="search-dialog-footer">
            <span>{t.searchFields}</span>
            <span>
              <kbd>esc</kbd> {t.close}
            </span>
          </div>
        </div>
      </dialog>, document.body)}
    </>
  );
}
