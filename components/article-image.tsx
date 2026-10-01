"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Icon } from "./icon";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";


type ArticleImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  linked?: boolean;
  variant?: "inline" | "cover";
  objectPosition?: string;
  title?: string;
  caption?: string | false;
  lightboxCaption?: string;
  attributes?: HTMLAttributes<HTMLSpanElement>;
  imageStyle?: CSSProperties;
};

export function ArticleImage({ src, alt, width, height, linked = false, variant = "inline", objectPosition, title, caption: captionProp, lightboxCaption, attributes, imageStyle }: ArticleImageProps) {
  const t = getMessages(useLocale());
  const isCover = variant === "cover";
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const captionId = useId();
  // Imported filenames remain available as alt text, but are not useful captions.
  const caption = captionProp === false ? "" : captionProp ?? (/^[^\s/\\]+\.(?:avif|gif|heic|jpe?g|png|svg|webp)$/i.test(alt) ? "" : alt);
  const dialogCaption = lightboxCaption ?? caption;

  useEffect(() => {
    if (!open || !dialog.current) return;
    dialog.current.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  const thumbnail = isCover ? (
    <Image
      className="reading-cover"
      src={src}
      alt=""
      style={{ objectPosition }}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1080px) 75vw, 768px"
      preload
      onError={() => setFailed(true)}
    />
  ) : (
    // Remote Markdown images are allowed without a predefined optimization host list.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      title={title}
      style={imageStyle}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );

  return (
    <span {...attributes} className={`${isCover ? "reading-cover-preview" : "article-image"}${failed ? " is-unavailable" : ""} ${attributes?.className ?? ""}`.trim()}>
      {failed ? (
        <span className="article-image-fallback">{alt || t.image} · {t.imageUnavailable}</span>
      ) : linked ? thumbnail : (
        <button
          ref={trigger}
          className={isCover ? "reading-cover-trigger" : "article-image-trigger"}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.enlargeImage(alt || t.articleImage)}
          aria-haspopup="dialog"
        >
          {thumbnail}
          {isCover && <span className="reading-cover-hint" aria-hidden="true"><Icon name="search" width="16" height="16" />{t.viewImage}</span>}
        </button>
      )}
      {!isCover && caption && <span className="article-image-caption">{caption}</span>}
      {open && createPortal(
        <dialog
          ref={dialog}
          className="article-lightbox"
          aria-label={t.viewImage}
          aria-describedby={dialogCaption ? captionId : undefined}
          onClose={close}
          onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        >
          <button className="article-lightbox-close" type="button" autoFocus aria-label={t.closeImage} onClick={() => dialog.current?.close()}>
            <Icon name="close" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} width={width} height={height} onError={() => { setFailed(true); dialog.current?.close(); }} />
          {dialogCaption && <span className="article-lightbox-caption" id={captionId}>{dialogCaption}</span>}
        </dialog>,
        document.body,
      )}
    </span>
  );
}
