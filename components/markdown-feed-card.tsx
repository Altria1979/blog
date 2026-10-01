"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { contentArchIcon, contentLinkIcon } from "../lib/content-icons";
import { safeMediaUrl } from "../lib/content-media";
import { Icon } from "./icon";
import { useLocale } from "./locale-provider";
import { ContentAssetImage, ContentIcon } from "./markdown-interactions";
import "./markdown-feed-card.css";

export interface FeedCardProps {
  author?: string;
  sitenick?: string;
  title?: string;
  desc?: string;
  description?: string;
  link?: string;
  feed?: string;
  icon?: string;
  avatar?: string;
  archs?: string[];
  date?: string;
  comment?: string;
  error?: string;
  className?: string;
  id?: string;
}

export function ContentFeedCard({ author, sitenick, title, desc, description, link, feed, icon, avatar, archs, date, comment, error, className = "", id }: FeedCardProps) {
  const locale = useLocale();
  const t = {
    zh: { details: "查看站点信息", unavailable: "站点暂不可用", invalid: "站点地址无效", feed: "订阅源", noFeed: "未提供订阅源", note: "备注", date: "收录日期", architecture: "技术架构" },
    en: { details: "View site details", unavailable: "Site unavailable", invalid: "Invalid site address", feed: "Feed", noFeed: "No feed provided", note: "Note", date: "Added", architecture: "Technology" },
    ja: { details: "サイト情報を表示", unavailable: "サイトを利用できません", invalid: "サイトURLが無効です", feed: "フィード", noFeed: "フィード未登録", note: "メモ", date: "登録日", architecture: "技術構成" },
  }[locale];
  const href = safeMediaUrl(link);
  const feedUrl = safeMediaUrl(feed);
  const avatarUrl = safeMediaUrl(avatar);
  const iconUrl = safeMediaUrl(icon);
  const name = author || sitenick || title || link || t.invalid;
  const heading = title || sitenick || author || link || t.details;
  const domain = href?.startsWith("/") ? href : href ? new URL(href).hostname : link;
  const domainIcon = href && contentLinkIcon(href);
  const problem = error || (!href ? t.invalid : undefined);
  const body = desc ?? description;
  const tooltipId = useId();
  const root = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }
  function show() { cancelClose(); setOpen(true); }
  function hideSoon() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!root.current?.contains(document.activeElement) && !tooltip.current?.contains(document.activeElement)) setOpen(false);
    }, 150);
  }

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  useLayoutEffect(() => {
    if (!open) return;
    const target = root.current;
    const floating = tooltip.current;
    if (!target || !floating) return;
    const position = () => {
      const bounds = target.getBoundingClientRect();
      const margin = 12;
      floating.style.width = `${Math.min(368, window.innerWidth - margin * 2)}px`;
      floating.style.maxHeight = `${window.innerHeight - margin * 2}px`;
      const height = floating.offsetHeight;
      const width = floating.offsetWidth;
      const left = Math.max(margin, Math.min(window.innerWidth - width - margin, bounds.left + (bounds.width - width) / 2));
      const top = bounds.top > height + 10 ? bounds.top - height - 10 : bounds.bottom + 10;
      floating.style.left = `${left}px`;
      floating.style.top = `${Math.max(margin, Math.min(window.innerHeight - height - margin, top))}px`;
      floating.style.visibility = "visible";
    };
    const closeOutside = (event: PointerEvent) => {
      if (!target.contains(event.target as Node) && !floating.contains(event.target as Node)) setOpen(false);
    };
    const closeWithEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(target);
    observer.observe(floating);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, { capture: true, passive: true });
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  const face = <>
    <span className="md-feed-avatar">
      <span className="md-feed-avatar-placeholder" aria-hidden="true">{Array.from(name)[0]}</span>
      {avatarUrl && <ContentAssetImage src={avatarUrl} alt="" width={48} height={48} className="md-feed-avatar-image" />}
      {!feedUrl && <span className="md-feed-no-feed" role="img" aria-label={t.noFeed}><Icon name="rss" width={13} height={13} /></span>}
    </span>
    <span className="md-feed-names"><span className="md-feed-author">{name}</span>{sitenick && sitenick !== name && <span className="md-feed-sitenick">{sitenick}</span>}</span>
  </>;
  const label = { className: "md-feed-card-link", "aria-describedby": open ? tooltipId : undefined };
  return <div ref={root} id={id} className={`md-feed-card-root${problem ? " is-unavailable" : ""} ${className}`.trim()} onPointerEnter={show} onPointerLeave={hideSoon} onFocusCapture={show} onBlurCapture={hideSoon}>
    {problem ? <button type="button" {...label} aria-disabled="true" onClick={show}>{face}</button>
      : <a {...label} href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{face}</a>}
    <button type="button" className="md-feed-details" aria-label={`${t.details}: ${heading}`} aria-describedby={open ? tooltipId : undefined} aria-expanded={open} aria-controls={open ? tooltipId : undefined} onClick={show}>ⓘ</button>
    {open && createPortal(<div ref={tooltip} id={tooltipId} role="tooltip" className="md-feed-tooltip" onPointerEnter={cancelClose} onPointerLeave={hideSoon}>
      <div className="md-feed-tooltip-header">
        {iconUrl && <ContentAssetImage src={iconUrl} alt="" width={32} height={32} className="md-feed-site-icon" />}
        <div className="md-feed-site-heading"><strong>{heading}</strong>{domain && <span className="md-feed-domain">{domainIcon && <ContentIcon name={domainIcon} />}{domain}</span>}</div>
      </div>
      {archs?.length ? <ul className="md-feed-architecture" aria-label={t.architecture}>{archs.map((arch, index) => {
        const name = contentArchIcon(arch);
        return <li key={`${arch}-${index}`}>{name && <ContentIcon name={name} />}<span>{arch}</span></li>;
      })}</ul> : null}
      <div className="md-feed-tooltip-body">
        {date && <p className="md-feed-date"><span>{t.date}</span> <time dateTime={/^\d{4}-\d{2}-\d{2}(?:$|T| )/.test(date) ? date.replace(" ", "T") : undefined}>{date}</time></p>}
        {problem && <p className="md-feed-problem"><strong>{t.unavailable}</strong> · {problem}</p>}
        {body && <p>{body}</p>}
        {comment && <p className="md-feed-comment"><span>{t.note}</span> · {comment}</p>}
        <p className="md-feed-subscription"><Icon name="rss" width={14} height={14} />{feed ? <><span>{t.feed}</span><span>{feedUrl || feed}</span></> : t.noFeed}</p>
      </div>
    </div>, document.body)}
  </div>;
}
