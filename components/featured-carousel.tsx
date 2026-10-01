"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { formatDate } from "@/lib/format";
import { horizontalWheelDelta, loopedScrollPosition } from "@/lib/featured-carousel";
import type { PostSummary } from "./article-feed";
import { Icon } from "./icon";
import styles from "./featured-carousel.module.css";
import { localePath } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";


export function FeaturedCarousel({ posts }: { posts: PostSummary[] }) {
  const locale = useLocale();
  const t = getMessages(locale);
  const railRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<(direction: number) => void>(() => {});
  const canSlide = posts.length > 1;

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || !canSlide) return;
    const cards = Array.from(rail.querySelectorAll<HTMLAnchorElement>("[data-post-index]"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let groupWidth = 0;
    let step = 0;
    let frame = 0;
    let suppressClickUntil = 0;
    let pointer: { id: number; x: number; y: number; previousX: number; mouse: boolean; dragging: boolean } | null = null;

    function stopAnimation() {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    function normalize() {
      if (!groupWidth) return;
      const position = loopedScrollPosition(rail!.scrollLeft, groupWidth);
      if (Math.abs(position - rail!.scrollLeft) > 1) rail!.scrollLeft = position;
    }
    function scrollBy(distance: number) {
      // Normalize the destination before assigning, so a large wheel delta cannot hit an end.
      rail!.scrollLeft = loopedScrollPosition(rail!.scrollLeft + distance, groupWidth);
    }
    function measure() {
      stopAnimation();
      const previousStep = step;
      const offset = groupWidth ? (rail!.scrollLeft - groupWidth * 2) / previousStep : 0;
      const start = cards[0].getBoundingClientRect().left;
      step = cards[1].getBoundingClientRect().left - start;
      groupWidth = cards[posts.length].getBoundingClientRect().left - start;
      rail!.scrollLeft = loopedScrollPosition(groupWidth * 2 + offset * step, groupWidth);
    }
    function move(direction: number) {
      stopAnimation();
      const distance = direction * step;
      if (motion.matches) {
        scrollBy(distance);
        return;
      }
      const started = performance.now();
      const start = rail!.scrollLeft;
      function animate(now: number) {
        const progress = Math.min(1, (now - started) / 300);
        const travelled = distance * (1 - (1 - progress) ** 3);
        // Keep a precise virtual position: browser scrollLeft writes may round each frame.
        rail!.scrollLeft = loopedScrollPosition(start + travelled, groupWidth);
        if (progress < 1) frame = requestAnimationFrame(animate);
        else frame = 0;
      }
      frame = requestAnimationFrame(animate);
    }
    function onWheel(event: WheelEvent) {
      const delta = horizontalWheelDelta(event);
      if (!delta) return;
      event.preventDefault();
      stopAnimation();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail!.clientWidth : 1;
      scrollBy(delta * unit);
    }
    function onPointerDown(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0) return;
      stopAnimation();
      suppressClickUntil = 0;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, previousX: event.clientX, mouse: event.pointerType === "mouse", dragging: false };
    }
    function onPointerMove(event: PointerEvent) {
      if (!pointer || event.pointerId !== pointer.id) return;
      if (pointer.mouse && !(event.buttons & 1)) {
        onPointerEnd(event);
        return;
      }
      const horizontal = Math.abs(event.clientX - pointer.x);
      const vertical = Math.abs(event.clientY - pointer.y);
      if (!pointer.dragging && horizontal > 6 && horizontal > vertical) {
        pointer.dragging = true;
        if (pointer.mouse) {
          rail!.setPointerCapture(pointer.id);
          rail!.dataset.dragging = "true";
        }
      }
      if (!pointer.dragging) return;
      suppressClickUntil = performance.now() + 500;
      if (pointer.mouse) {
        event.preventDefault();
        scrollBy(pointer.previousX - event.clientX);
      }
      pointer.previousX = event.clientX;
    }
    function onPointerEnd(event: PointerEvent) {
      if (!pointer || event.pointerId !== pointer.id) return;
      if (pointer.dragging) suppressClickUntil = performance.now() + 500;
      if (rail!.hasPointerCapture(pointer.id)) rail!.releasePointerCapture(pointer.id);
      pointer = null;
      delete rail!.dataset.dragging;
    }
    function onClick(event: MouseEvent) {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    function onDragStart(event: DragEvent) {
      event.preventDefault();
    }
    function onMouseDown(event: MouseEvent) {
      // Clickable loop copies must never receive focus while hidden from assistive technology.
      if ((event.target as Element).closest('[data-copy="true"]')) event.preventDefault();
    }
    function onFocus(event: FocusEvent) {
      const card = (event.target as Element).closest<HTMLAnchorElement>("[data-post-index]");
      if (card?.dataset.copy === "true") {
        cards[posts.length * 2 + Number(card.dataset.postIndex)].focus({ preventScroll: true });
      }
    }
    function onMotionChange() {
      if (motion.matches) stopAnimation();
    }

    measure();
    moveRef.current = move;
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(rail);
    rail.addEventListener("scroll", normalize, { passive: true });
    rail.addEventListener("wheel", onWheel, { passive: false });
    rail.addEventListener("pointerdown", onPointerDown);
    rail.addEventListener("pointermove", onPointerMove);
    rail.addEventListener("pointerup", onPointerEnd);
    rail.addEventListener("pointercancel", onPointerEnd);
    rail.addEventListener("lostpointercapture", onPointerEnd);
    rail.addEventListener("click", onClick, true);
    rail.addEventListener("dragstart", onDragStart);
    rail.addEventListener("mousedown", onMouseDown);
    rail.addEventListener("focusin", onFocus);
    motion.addEventListener("change", onMotionChange);
    return () => {
      stopAnimation();
      moveRef.current = () => {};
      resizeObserver.disconnect();
      rail.removeEventListener("scroll", normalize);
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("pointerdown", onPointerDown);
      rail.removeEventListener("pointermove", onPointerMove);
      rail.removeEventListener("pointerup", onPointerEnd);
      rail.removeEventListener("pointercancel", onPointerEnd);
      rail.removeEventListener("lostpointercapture", onPointerEnd);
      rail.removeEventListener("click", onClick, true);
      rail.removeEventListener("dragstart", onDragStart);
      rail.removeEventListener("mousedown", onMouseDown);
      rail.removeEventListener("focusin", onFocus);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [canSlide, posts.length]);

  if (!posts.length) return null;
  const copies = canSlide ? [0, 1, 2, 3, 4] : [2];
  return (
    <section
      className={`featured-section ${styles.section}`}
      aria-labelledby="featured-title"
      aria-roledescription={t.carousel}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || !canSlide) return;
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        moveRef.current(event.key === "ArrowLeft" ? -1 : 1);
      }}
    >
      <div className={styles.heading}>
        <h1 id="featured-title">{t.featuredArticles}</h1>
      </div>
      <div className={styles.viewport}>
        <div
          ref={railRef}
          className={`featured-rail ${styles.rail}`}
          tabIndex={canSlide ? 0 : undefined}
          role="group"
          aria-label={canSlide ? t.carouselKeyboard : t.featuredArticles}
        >
          {copies.flatMap((copy) => posts.map((post, index) => (
            <Link
              className={`featured-card ${styles.card}${post.cover ? "" : ` ${styles.noCover}`}`}
              href={localePath(`/posts/${post.slug}`, post.locale ?? locale)}
              key={`${copy}-${post.slug}`}
              data-copy={copy !== 2 ? "true" : "false"}
              data-post-index={index}
              aria-hidden={copy !== 2 ? true : undefined}
              aria-label={`${post.title}, ${formatDate(post.date, false, locale)}`}
              tabIndex={copy !== 2 ? -1 : 0}
              draggable={false}
              prefetch={copy !== 2 ? false : undefined}
            >
              {post.cover && <Image
                className={styles.cover}
                src={post.cover}
                style={{ objectPosition: post.coverPosition }}
                alt=""
                fill
                sizes="(max-width: 768px) 60vw, 280px"
                priority={copy === 2 && index === 0}
                draggable={false}
              />}
              <h2 className={styles.title}>{post.title}</h2>
              <div className={styles.detail} aria-hidden="true">
                <span>{post.title}</span>
                <time dateTime={post.date}>{formatDate(post.date, false, locale)}</time>
              </div>
            </Link>
          )))}
        </div>
        {canSlide && <>
          <button className={`${styles.control} ${styles.previous}`} type="button" aria-label={t.previousFeatured} onClick={() => moveRef.current(-1)}>
            <Icon name="chevron" className="rotate-180" width="24" height="24" />
          </button>
          <button className={`${styles.control} ${styles.next}`} type="button" aria-label={t.nextFeatured} onClick={() => moveRef.current(1)}>
            <Icon name="chevron" width="24" height="24" />
          </button>
        </>}
      </div>
    </section>
  );
}
