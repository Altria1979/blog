"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Heading } from "@/lib/markdown";
import { activeHeadingIds, articleProgress, currentHeadingId, matchesArticlePath } from "@/lib/reading";
import { Icon } from "./icon";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";

import "./reading-navigation.css";

type ArticleContents = { path: string; headings: Heading[]; showContents?: boolean; beforeContents?: ReactNode; afterContents?: ReactNode };
type HeadingBranch = Heading & { children: HeadingBranch[] };

function headingTree(headings: Heading[]): HeadingBranch[] {
  const tree: HeadingBranch[] = [];
  const parents: HeadingBranch[] = [];
  for (const heading of headings) {
    while (parents.length && parents[parents.length - 1].level >= heading.level) {
      parents.pop();
    }
    const branch = { ...heading, children: [] };
    (parents.at(-1)?.children ?? tree).push(branch);
    parents.push(branch);
  }
  return tree;
}

function ContentsList({
  branches,
  activeIds,
  currentId,
  onNavigate,
}: {
  branches: HeadingBranch[];
  activeIds: string[];
  currentId: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ol className="reading-toc-list">
      {branches.map((heading) => (
        <li key={heading.id} className={heading.id === currentId ? "is-active is-current" : activeIds.includes(heading.id) ? "is-active" : undefined}>
          <a
            href={`#${encodeURIComponent(heading.id)}`}
            title={heading.text}
            aria-current={heading.id === currentId ? "location" : undefined}
            onClick={onNavigate}
          >
            {heading.text}
          </a>
          {heading.children.length > 0 && (
            <ContentsList
              branches={heading.children}
              activeIds={activeIds}
              currentId={currentId}
              onNavigate={onNavigate}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

function ReadingNavigation({ headings, showContents = true, beforeContents, afterContents }: Omit<ArticleContents, "path">) {
  const t = getMessages(useLocale());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktopContentsRef = useRef<HTMLElement>(null);
  const drawerContentsRef = useRef<HTMLElement>(null);
  const activeIds = activeHeadingIds(headings, currentId);
  const branches = headingTree(headings);
  const compact = useSyncExternalStore(subscribeToCompactAside, isCompactAside, () => false);

  useEffect(() => {
    let frame = 0;
    let trackHeight = 0;
    const articleBody = document.getElementById("article-body");
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      if (articleBody && track && track.getClientRects().length) {
        const height = Math.max(window.innerHeight, articleBody.getBoundingClientRect().bottom - track.getBoundingClientRect().top);
        if (height !== trackHeight) {
          track.style.height = `${height}px`;
          trackHeight = height;
        }
      }
      const readingLine = Math.min(120, window.innerHeight * 0.2);
      const positions = headings.flatMap((heading) => {
        const element = document.getElementById(heading.id);
        return element?.getClientRects().length ? [{ id: heading.id, top: element.getBoundingClientRect().top }] : [];
      });
      const atPageEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      setCurrentId(currentHeadingId(positions, readingLine, window.innerHeight, atPageEnd));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    if (articleBody) observer.observe(articleBody);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    for (const container of [desktopContentsRef.current, drawerContentsRef.current]) {
      const current = container?.querySelector<HTMLElement>('[aria-current="location"]');
      if (!container || !current || !container.clientHeight) continue;
      const bounds = container.getBoundingClientRect();
      const position = current.getBoundingClientRect();
      if (position.top < bounds.top || position.bottom > bounds.bottom) {
        container.scrollBy({ top: position.top - bounds.top - bounds.height / 2 + position.height / 2, behavior });
      }
    }
  }, [currentId, drawerOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1081px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialogRef.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [drawerOpen]);

  function closeDrawer() {
    dialogRef.current?.close();
  }

  function toTop() {
    closeDrawer();
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  const topButton = (
    <button className="reading-toc-action" type="button" aria-label={t.backToTop} title={t.backToTop} onClick={toTop}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 4h12M12 20V8m-4 4 4-4 4 4" />
      </svg>
    </button>
  );

  return (
    <>
      <div className="reading-aside-track" ref={trackRef}>
        <aside className="reading-aside" aria-labelledby={`${drawerId}-desktop-title`}>
          <div className="reading-toc-header">
            <h2 id={`${drawerId}-desktop-title`}>{t.tableOfContents}</h2>
            {topButton}
          </div>
          <nav className="reading-toc-scroll" aria-label={t.articleSections} ref={desktopContentsRef}>
            {!compact && beforeContents}
            {showContents && (headings.length ? <ContentsList branches={branches} activeIds={activeIds} currentId={currentId} /> : <p className="reading-toc-empty">{t.noSections}</p>)}
            {!compact && afterContents}
          </nav>
        </aside>
      </div>
      <button
        ref={triggerRef}
        type="button"
        className="reading-drawer-trigger"
        aria-label={t.openContents}
        aria-controls={drawerId}
        aria-expanded={drawerOpen}
        aria-haspopup="dialog"
        onClick={() => { dialogRef.current?.showModal(); setDrawerOpen(true); }}
      >
        <Icon name="panelRight" />
      </button>
      <dialog
        ref={dialogRef}
        id={drawerId}
        className="reading-drawer"
        aria-labelledby={`${drawerId}-title`}
        onClose={() => { setDrawerOpen(false); triggerRef.current?.focus({ preventScroll: true }); }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDrawer();
        }}
      >
        <div className="reading-toc-header">
          <h2 id={`${drawerId}-title`}>{t.tableOfContents}</h2>
          <div className="reading-toc-actions">
            {topButton}
            <button type="button" className="reading-toc-action" aria-label={t.closeContents} onClick={closeDrawer} autoFocus>
              <Icon name="close" width="18" height="18" />
            </button>
          </div>
        </div>
        <nav className="reading-toc-scroll" aria-label={t.articleSections} ref={drawerContentsRef}>
          {compact && beforeContents}
          {showContents && (headings.length ? <ContentsList branches={branches} activeIds={activeIds} currentId={currentId} onNavigate={closeDrawer} /> : <p className="reading-toc-empty">{t.noSections}</p>)}
          {compact && afterContents}
        </nav>
      </dialog>
    </>
  );
}

function subscribeToCompactAside(onChange: () => void) {
  const media = window.matchMedia("(max-width: 1080px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isCompactAside() {
  return window.matchMedia("(max-width: 1080px)").matches;
}

function InformationAside({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = getMessages(locale);
  const title = { zh: "博客信息", en: "Blog information", ja: "ブログ情報" }[locale];
  const compact = useSyncExternalStore(subscribeToCompactAside, isCompactAside, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!compact) dialogRef.current?.close();
  }, [compact]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [drawerOpen]);

  function closeDrawer() {
    dialogRef.current?.close();
  }

  return (
    <>
      {!compact && <div className="info-aside-track">{children}</div>}
      <button
        ref={triggerRef}
        type="button"
        className="reading-drawer-trigger"
        aria-label={title}
        aria-controls={drawerId}
        aria-expanded={drawerOpen}
        aria-haspopup="dialog"
        onClick={() => { dialogRef.current?.showModal(); setDrawerOpen(true); }}
      >
        <Icon name="panelRight" />
      </button>
      <dialog
        ref={dialogRef}
        id={drawerId}
        className="reading-drawer info-drawer"
        aria-labelledby={`${drawerId}-title`}
        onClose={() => {
          setDrawerOpen(false);
          if (triggerRef.current?.getClientRects().length) triggerRef.current.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDrawer();
        }}
      >
        <div className="reading-toc-header">
          <h2 id={`${drawerId}-title`}>{title}</h2>
          <button type="button" className="reading-toc-action" aria-label={t.close} onClick={closeDrawer} autoFocus>
            <Icon name="close" width="18" height="18" />
          </button>
        </div>
        {compact && children}
      </dialog>
    </>
  );
}

export function ReadingAside({ articles, children }: { articles: ArticleContents[]; children: ReactNode }) {
  const pathname = usePathname();
  const article = articles.find((entry) => matchesArticlePath(pathname, entry.path));
  return article ? <ReadingNavigation key={pathname} {...article} /> : <InformationAside key={pathname}>{children}</InformationAside>;
}

export function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const body = document.getElementById("article-body");
    const progress = progressRef.current;
    if (!body || !progress) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = body.getBoundingClientRect();
      progress.style.transform = `scaleX(${articleProgress(bounds.top, bounds.height, window.innerHeight)})`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return <div className="reading-progress" ref={progressRef} aria-hidden="true" />;
}
