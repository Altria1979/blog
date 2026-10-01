"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { blogConfig } from "@/blog.config";
import { Icon, type IconName } from "./icon";
import { SearchDialog, type SearchPost } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";
import { matchesArticlePath } from "@/lib/reading";
import { localePath, type TranslationManifest } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";


const navigation: { href: string; label: "posts" | "archives" | "about"; icon: IconName }[] = [
  { href: "/", label: "posts", icon: "posts" },
  { href: "/archives", label: "archives", icon: "archive" },
  { href: "/about", label: "about", icon: "user" },
];

function subscribeMobile(callback: () => void) {
  const media = matchMedia("(max-width: 768px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function Sidebar({ posts, translations }: { posts: SearchPost[]; translations: TranslationManifest }) {
  const locale = useLocale();
  const t = getMessages(locale);
  const path = usePathname();
  const isReadingPage = posts.some((post) => matchesArticlePath(path, localePath(`/posts/${post.slug}`, post.locale ?? locale)));
  const mobile = useSyncExternalStore(subscribeMobile, () => matchMedia("(max-width: 768px)").matches, () => false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef<string | null>(null);
  function closeMenu() {
    dialogRef.current?.close();
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  }
  useEffect(() => {
    dialogRef.current?.close();
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
    return () => {
      if (previousOverflow.current !== null) {
        document.body.style.overflow = previousOverflow.current;
        previousOverflow.current = null;
      }
    };
  }, [path, mobile]);
  const brand = (
    <Link className="brand" href={localePath("/", locale)} aria-label={t.siteHome(blogConfig.title)}>
        {blogConfig.brandEmojis.length > 0 && (
          <div className="brand-backdrop" aria-hidden="true">
            {blogConfig.brandEmojis.map((emoji, index) => (
              <div
                className="brand-emoji"
                key={index}
                style={{ animationDelay: `${index * 0.6 - 3}s` }}
              >
                {emoji}
              </div>
            ))}
          </div>
        )}
        <Image
          className="avatar"
          src={blogConfig.avatar}
          width={54}
          height={54}
          alt={t.avatar(blogConfig.author)}
          priority
        />
        <div>
          <strong>{blogConfig.title}</strong>
          <span>{blogConfig.tagline}</span>
        </div>
      </Link>
  );
  const content = (
    <aside className="sidebar" onClick={(event) => {
      if ((event.target as HTMLElement).closest('a[href^="/"]')) closeMenu();
    }}>
      {brand}
      <SearchDialog posts={posts} />
      <nav className="navigation" aria-label={t.mainNavigation}>
        {navigation.map((item) => {
          const href = localePath(item.href, locale);
          const active = path === href;
          return (
            <Link
              key={item.href}
              href={href}
              className={`nav-link${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{t[item.label]}</span>
              {active && <span className="nav-active-dot" />}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <p className="sidebar-note">
          {t.sidebarNote[0]}
          <br />
          {t.sidebarNote[1]}
        </p>
        <div className="reading-preferences">
          <LanguageToggle key={path} translations={translations} />
          <ThemeToggle />
        </div>
        <div className="social-links">
          {blogConfig.github && (
            <a
              href={blogConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <Icon name="github" width="17" height="17" />
            </a>
          )}
          {blogConfig.telegram && (
            <a
              href={blogConfig.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              title="Telegram"
            >
              <Icon name="telegram" width="17" height="17" />
            </a>
          )}
          {blogConfig.email && (
            <a href={`mailto:${blogConfig.email}`} aria-label={t.email} title={blogConfig.email}>
              <Icon name="mail" width="17" height="17" />
            </a>
          )}
          <a href={localePath("/rss.xml", locale)} aria-label={t.rss} title={t.rss}>
            <Icon name="rss" width="17" height="17" />
          </a>
          <Link href={localePath("/about", locale)} aria-label={t.aboutSite}>
            <Icon name="coffee" width="17" height="17" />
          </Link>
        </div>
      </div>
    </aside>
  );
  if (!mobile) return content;
  return (
    <>
      {!isReadingPage && <div className="mobile-brand">{brand}</div>}
      <button ref={triggerRef} type="button" className="reading-menu-toggle" aria-label={t.openNavigation} aria-haspopup="dialog" onClick={() => {
        previousOverflow.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.showModal();
      }}><Icon name="panelLeft" /></button>
      <dialog ref={dialogRef} className="reading-menu-dialog" aria-label={t.navigationMenu} onClose={() => { closeMenu(); triggerRef.current?.focus(); }} onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX > bounds.right || event.clientX < bounds.left) closeMenu();
        }
      }}>
        <button className="reading-menu-close" type="button" aria-label={t.closeNavigation} onClick={closeMenu}><Icon name="close" /></button>
        {content}
      </dialog>
    </>
  );
}
