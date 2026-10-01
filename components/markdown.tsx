import { cache, createElement, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  parseMarkdown,
  safeUrl,
  inlineText,
  safeStyle,
  splitContentSlots,
  type ContentProps,
  type InlineNode,
  type MarkdownBlock,
} from "../lib/markdown";
import { getImageRow, groupImageParagraphs, splitImageRows } from "../lib/article-images";
import { ArticleImage } from "./article-image";
import { CodeBlock } from "./code-block";
import { highlightRichCode } from "../lib/code-highlight";
import { parseCodeMeta, type CodeMeta } from "../lib/code";
import { imageAssetDimensions, imageUrl, type ImageAssets } from "../lib/image-assets";
import { contentLinkIcon } from "../lib/content-icons";
import katex from "katex";
import { ContentAnchorNavigation, ContentAssetImage, ContentBlur, ContentClock, ContentCopy, ContentFeedGroup, ContentIcon, ContentKey, ContentTable, ContentTabs, ContentTip } from "./markdown-interactions";
import { GithubCard, MermaidDiagram, MusicScore, VideoEmbed } from "./markdown-media";
import { ContentFeedCard } from "./markdown-feed-card";
import "katex/dist/katex.min.css";
import "./article-content.css";
import "./markdown-content.css";

const imageAssets = cache(async (): Promise<ImageAssets> => {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "content/image-assets.json"), "utf8"));
  } catch {
    return {};
  }
});

const imageDimensions = cache(async (src: string) => {
  const recorded = imageAssetDimensions(src, await imageAssets());
  if (recorded) return recorded;
  if (!src.startsWith("/") || src.startsWith("//")) return undefined;
  try {
    const pathname = decodeURIComponent(new URL(src, "https://local.invalid").pathname);
    const relativePath = path.normalize(pathname.slice(1));
    if (path.isAbsolute(relativePath) || relativePath === ".." || relativePath.startsWith(`..${path.sep}`))
      return undefined;
    const root = await realpath(path.join(process.cwd(), "public"));
    const file = await realpath(path.join(process.cwd(), "public", relativePath));
    if (!file.startsWith(`${root}${path.sep}`)) return undefined;
    const metadata = await sharp(file).metadata();
    const { width, height } = metadata.autoOrient ?? metadata;
    return width && height ? { width, height } : undefined;
  } catch {
    return undefined;
  }
});

async function MarkdownImage({ src, alt, linked, width, height, title, caption, lightboxCaption, attrs, filter }: { src: string; alt: string; linked: boolean; width?: number; height?: number; title?: string; caption?: string | false; lightboxCaption?: string; attrs?: ContentProps; filter?: string }) {
  const dimensions = await imageDimensions(src);
  return <ArticleImage src={imageUrl(src)} alt={alt} title={title} caption={caption} lightboxCaption={lightboxCaption} attributes={elementProps(attrs)} imageStyle={filter ? elementProps({ style: `filter: ${filter}` }).style : undefined} linked={linked} width={width ?? dimensions?.width} height={height ?? dimensions?.height} />;
}

async function MarkdownImageGallery({ images }: { images: NonNullable<ReturnType<typeof getImageRow>> }) {
  const sizedImages = await Promise.all(images.map(async image => ({ ...await imageDimensions(image.src), ...image })));
  return splitImageRows(sizedImages).map((row, rowIndex) => {
    const ratios = row.map(image => image.width && image.height ? image.width / image.height : 1);
    const style = {
      "--image-columns": ratios.map(ratio => `minmax(0, ${ratio}fr)`).join(" "),
      // Cap portrait rows at the same reading height as standalone images.
      maxWidth: row.every(image => image.width && image.height)
        ? `calc(${ratios.reduce((sum, ratio) => sum + ratio, 0)} * 60vh + ${(row.length - 1) * 8}px)`
        : undefined,
      marginInline: "auto",
    } as CSSProperties;
    return (
      <p key={rowIndex} className="article-image-row" style={style}>
        {row.map((image, index) => (
            <ArticleImage key={index} src={imageUrl(image.src)} alt={image.alt} title={image.title} width={image.width} height={image.height} />
        ))}
      </p>
    );
  });
}

function textProp(props: ContentProps, key: string): string | undefined {
  const value = props[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}
function boolProp(props: ContentProps, key: string): boolean {
  const value = props[key];
  return value === true || value === "" || value === "true" || value === 1;
}
function numberProp(props: ContentProps, key: string): number | undefined {
  const value = Number(props[key]);
  return props[key] !== undefined && Number.isFinite(value) ? value : undefined;
}
function elementProps(attrs?: ContentProps): HTMLAttributes<HTMLElement> {
  if (!attrs) return {};
  return {
    id: textProp(attrs, "id"),
    className: textProp(attrs, "class"),
    title: textProp(attrs, "title"),
    style: typeof attrs.style === "string" ? Object.fromEntries(safeStyle(attrs.style).split(";").filter(Boolean).map(declaration => {
      const colon = declaration.indexOf(":");
      return [declaration.slice(0, colon).trim().replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()), declaration.slice(colon + 1).trim()];
    })) as CSSProperties : undefined,
  };
}
function MathExpression({ value, display = false }: { value: string; display?: boolean }) {
  try {
    const html = katex.renderToString(value, { displayMode: display, throwOnError: false, trust: false, strict: "ignore", maxExpand: 1000, maxSize: 20, output: "htmlAndMathml" });
    return createElement(display ? "div" : "span", { className: display ? "md-math-block" : "md-math-inline", dangerouslySetInnerHTML: { __html: html } });
  } catch {
    return display ? <pre className="md-math-fallback">{value}</pre> : <code>{value}</code>;
  }
}
function PlainImage({ src, alt = "", className, width, height }: { src: string; alt?: string; className?: string; width?: number; height?: number }) {
  const safe = safeUrl(src);
  if (!safe || /^mailto:/i.test(safe)) return <span>{alt}</span>;
  return <ContentAssetImage src={imageUrl(safe)} alt={alt} className={className} width={width} height={height} />;
}

async function HighlightedBlock({ value, ...meta }: CodeMeta & { value: string }) {
  return <CodeBlock value={value} {...meta} tokens={await highlightRichCode(value, meta.language, { indent: meta.indent, words: meta.words })} />;
}

async function HighlightedInline({ value, language, copy, attrs }: { value: string; language: string; copy?: boolean; attrs?: ContentProps }) {
  const tokens = await highlightRichCode(value, language);
  const content = tokens.map((token, index) => <span key={index} className="md-code-token" style={{ "--code-light": token.lightColor, "--code-dark": token.darkColor } as CSSProperties}>{token.text}</span>);
  return copy ? <ContentCopy code={value} inline>{content}</ContentCopy> : <code {...elementProps(attrs)}>{content}</code>;
}

function renderInline(nodes: InlineNode[], prefix: string, linked = false): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${prefix}-${index}`;
    const attrs = elementProps(node.attrs);
    switch (node.type) {
      case "text": return node.value;
      case "break": return <br key={key} />;
      case "math": return <MathExpression key={key} value={node.value} />;
      case "code": return node.language ? <HighlightedInline key={key} value={node.value} language={node.language} copy={node.copy && !linked} attrs={node.attrs} /> : node.copy && !linked
        ? <ContentCopy key={key} code={node.value} inline />
        : <code key={key} {...attrs}>{node.value}</code>;
      case "strong": return <strong key={key} {...attrs}>{renderInline(node.children, key, linked)}</strong>;
      case "emphasis": return <em key={key} {...attrs}>{renderInline(node.children, key, linked)}</em>;
      case "delete": return <del key={key} {...attrs}>{renderInline(node.children, key, linked)}</del>;
      case "footnote-reference": return <sup key={key} id={`fnref-${node.id}-${node.reference}`} className="md-footnote-ref"><a href={`#fn-${node.id}`} aria-label={`Footnote ${node.number}`}>{node.number}</a></sup>;
      case "link": {
        if (linked) return <span key={key}>{renderInline(node.children, key, true)}</span>;
        const external = /^https?:\/\//i.test(node.href);
        const domain = external ? new URL(node.href).hostname : undefined;
        const icon = node.attrs?.icon === false || node.attrs?.icon === "false" ? undefined : typeof node.attrs?.icon === "string" ? node.attrs.icon : contentLinkIcon(node.href);
        return <a key={key} {...attrs} href={node.href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
          title={attrs.title ?? node.title ?? domain}>{icon && <ContentIcon name={icon} />}{renderInline(node.children, key, true)}{external && <span className="md-external-mark" aria-hidden="true">↗</span>}</a>;
      }
      case "image": return attrs.className?.split(/\s+/).includes("icon")
        ? <PlainImage key={key} src={node.src} alt={node.alt} className="md-inline-image icon" width={node.width} height={node.height} />
        : <MarkdownImage key={key} src={node.src} alt={node.alt} title={node.title} attrs={node.attrs} linked={linked} width={node.width} height={node.height} />;
      case "component": return <ContentComponent key={key} name={node.name} props={node.props} inline linked={linked} prefix={key} inlineNodes={node.children} />;
    }
  });
}

function ContentComponent({ name, props, children = [], slots = {}, inline = false, linked = false, prefix, inlineNodes = [] }: {
  name: string; props: ContentProps; children?: MarkdownBlock[]; slots?: Record<string, MarkdownBlock[]>; inline?: boolean; linked?: boolean; prefix: string; inlineNodes?: InlineNode[];
}) {
  const text = (key: string) => textProp(props, key);
  const flag = (key: string) => boolProp(props, key);
  const defaultBlocks = [...children, ...(slots.default ?? [])];
  const content = inline ? renderInline(inlineNodes, prefix, linked) : renderBlocks(defaultBlocks, prefix);
  const hasContent = inline ? inlineNodes.length > 0 : defaultBlocks.length > 0;
  const fallback = content.length ? content : text("text");
  const slot = (key: string) => slots[key]?.length ? renderBlocks(slots[key], `${prefix}-${key}`) : undefined;
  const wrapper = inline ? "span" : "div";
  const wrap = (className: string, value: ReactNode = fallback) => createElement(wrapper, { ...elementProps(props), className: [className, text("class")].filter(Boolean).join(" ") }, value);
  const component = name.toLowerCase().replace(/_/g, "-");
  switch (component) {
    case "icon": return <ContentIcon name={text("name") ?? ""} label={text("title")} />;
    case "span": return wrap("");
    case "alert": {
      const type = ["tip", "info", "question", "warning", "error", "note", "important", "caution"].includes(text("type") ?? "") ? text("type") : "tip";
      const title = text("title") || ({ tip: "提醒", info: "信息", question: "问题", warning: "警告", error: "错误", note: "注意", important: "重要", caution: "警告" }[type!] ?? "提醒");
      const symbol = text("icon") ? <ContentIcon name={text("icon")!} /> : ({ tip: "✦", info: "ⓘ", question: "?", warning: "⚠", error: "⊗" }[type!] ?? "ⓘ");
      const customColor = text("color") && elementProps({ style: `color: ${text("color")}` }).style?.color;
      return <aside {...elementProps(props)} className={`md-alert md-alert-${type}${flag("flat") ? " is-flat" : " is-card"} ${text("class") ?? ""}`.trim()} style={{ ...elementProps(props).style, ...(customColor ? { "--alert-color": customColor } : {}) } as CSSProperties}>
        <div className="md-alert-title"><span aria-hidden="true">{symbol}</span>{slot("title") ?? title}</div>{fallback}</aside>;
    }
    case "folding":
    case "details": return <details {...elementProps(props)} className={`md-folding ${text("class") ?? ""}`.trim()} open={flag("open")}><summary>{slot("title") ?? text("title") ?? "展开内容"}</summary>{content}</details>;
    case "tab": {
      const labels = Array.isArray(props.tabs) ? props.tabs.map(String) : Object.keys(slots).filter(key => /^tab\d+$/.test(key)).map((_, i) => String(i + 1));
      return <ContentTabs labels={labels} panels={labels.map((_, i) => slot(`tab${i + 1}`))} active={numberProp(props, "active")} center={flag("center")} />;
    }
    case "poetry": return <section className="md-poetry">{text("title") && <h2>{text("title")}</h2>}{text("author") && <div className="md-poetry-author">{text("author")}</div>}<div>{content}</div>{text("footer") && <footer>{text("footer")}</footer>}</section>;
    case "quote": return wrap("md-quote title-like", <><span className="md-quote-icon" aria-hidden="true">{slot("icon") ?? (text("icon") ? <ContentIcon name={text("icon")!} /> : "❝")}</span>{fallback}</>);
    case "md-title": return wrap("md-title");
    case "card-list": return wrap("md-card-list");
    case "blur": return linked ? wrap("md-blur") : <ContentBlur>{fallback}</ContentBlur>;
    case "tip": return linked ? <span title={text("tip")}>{fallback}</span> : <ContentTip tip={text("tip")} copy={flag("copy")}>{fallback}</ContentTip>;
    case "copy": return linked ? <code>{text("code")}</code> : <ContentCopy code={text("code") ?? inlineText(inlineNodes)} lang={text("lang") ?? text("language")} prompt={typeof props.prompt === "boolean" ? props.prompt : text("prompt")} />;
    case "prose-code": return <HighlightedInline value={text("code") ?? inlineText(inlineNodes)} language={text("language") ?? text("lang") ?? "text"} copy={flag("copy") && !linked} attrs={props} />;
    case "prose-pre": return <HighlightedBlock value={text("code") ?? ""} {...parseCodeMeta(`${text("language") ?? ""} ${text("meta") ?? ""}`)} {...(text("filename") ? { filename: text("filename") } : {})} />;
    case "key": return <ContentKey text={text("text") || (inlineNodes.length ? inlineText(inlineNodes) : undefined)} code={text("code")} ctrl={flag("ctrl")} shift={flag("shift")} alt={flag("alt")} meta={flag("meta")} win={flag("win")} cmd={flag("cmd")} prevent={flag("prevent")} icon={props.icon === undefined ? undefined : flag("icon")} />;
    case "emoji-clock": return <ContentClock datetime={text("datetime")} rotate={flag("rotate")} />;
    case "badge": {
      const href = text("link") && safeUrl(text("link")!);
      const external = href && /^https?:/.test(href) ? new URL(href) : undefined;
      const owner = external?.hostname === "github.com" ? external.pathname.split("/")[1] : undefined;
      const image = text("img") ?? (owner && /^[\w-]+$/.test(owner) ? `https://github.com/${owner}.png` : external ? new URL("/favicon.ico", external).href : undefined);
      return createElement(href && !linked ? "a" : "span", { ...elementProps(props), className: `md-badge${flag("round") || image && !flag("square") ? " is-round" : ""} ${text("class") ?? ""}`.trim(), href: linked ? undefined : href, ...(href && /^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {}) }, image && <PlainImage src={image} />, <span>{fallback}</span>);
    }
    case "link-card":
    case "link-banner": {
      const href = text("link") && safeUrl(text("link")!);
      const title = text("title") ?? text("sitenick") ?? text("author") ?? text("link");
      const description = text("description") ?? text("desc") ?? (href && /^https?:/.test(href) ? new URL(href).hostname : href);
      const icon = text("avatar") ?? text("icon");
      const details = <>{component === "link-banner" && text("banner") && <PlainImage src={text("banner")!} className="md-link-banner-image" />}
        <span className="md-link-card-info"><strong>{title}</strong><span>{description}</span>{text("author") && <small>{text("author")}</small>}{text("comment") && <small>{text("comment")}</small>}</span>
        {component !== "link-banner" && (slot("icon") ?? (icon && (/^[\w-]+:[\w-]+$/.test(icon) && !safeUrl(icon) ? <ContentIcon name={icon} /> : <PlainImage src={icon} className="md-link-card-icon" />)))}{content}</>;
      return createElement(href && !props.error ? "a" : "div", { ...elementProps(props), className: `md-link-card md-${component} ${text("class") ?? ""}`.trim(), href: props.error ? undefined : href, title: text("error") ?? text("link"), ...(href && /^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {}) }, details);
    }
    case "feed-card": return <ContentFeedCard author={text("author")} sitenick={text("sitenick")} title={text("title")} desc={text("desc")} description={text("description")} link={text("link")} feed={text("feed")} icon={text("icon")} avatar={text("avatar")} date={text("date")} comment={text("comment")} error={text("error")} archs={Array.isArray(props.archs) ? props.archs.filter((arch): arch is string => typeof arch === "string") : undefined} className={text("class")} id={text("id")} />;
    case "feed-group": {
      const entries = Array.isArray(props.entries) ? props.entries.filter(entry => entry && typeof entry === "object" && !Array.isArray(entry)) as ContentProps[] : [];
      return <ContentFeedGroup name={text("name")} description={text("desc")} shuffle={flag("shuffle")} cards={entries.map((entry, i) => <ContentComponent key={i} name="feed-card" props={entry} prefix={`${prefix}-${i}`} />)} />;
    }
    case "pic":
    case "prose-img": {
      const src = text("src") && safeUrl(text("src")!);
      if (!src || /^mailto:/.test(src)) return <span>{text("alt") || text("caption")}</span>;
      const caption = slot("caption");
      return <figure {...elementProps(props)} className={`md-picture ${text("class") ?? ""}`.trim()}><MarkdownImage src={src} alt={text("caption") || text("alt") || ""} title={text("title")} caption={caption ? false : text("caption") ?? false} lightboxCaption={text("alt") || text("caption")} filter={text("filter")} linked={props.zoom === false || props.zoom === "false"} width={numberProp(props,"width")} height={numberProp(props,"height")} />{caption && <figcaption>{caption}</figcaption>}</figure>;
    }
    case "chat":
    case "timeline": {
      let control = "";
      const entries: ReactNode[] = [];
      for (const [i, child] of defaultBlocks.entries()) {
        const label = child.type === "paragraph" ? inlineText(child.children).match(/^\{([.:]?)(.*?)\}$/) : null;
        if (label) {
          control = component === "chat" ? label[1] === "." ? " is-self" : label[1] === ":" ? " is-system" : "" : "";
          entries.push(<dt key={i} className={control}>{label[2]}</dt>);
        } else {
          entries.push(<dd key={i} className={control}>{renderBlocks([child], `${prefix}-${i}`)}</dd>);
        }
      }
      return <dl className={`md-${component}`}>{entries}</dl>;
    }
    case "mermaid": return <MermaidDiagram code={text("code") ?? ""} />;
    case "music-score": return <MusicScore abc={text("abc") ?? ""} />;
    case "video-embed": return <VideoEmbed type={text("type")} id={text("id") ?? ""} autoplay={flag("autoplay")} ratio={text("ratio")} poster={text("poster")} width={text("width")} height={text("height")} zoom={numberProp(props, "zoom")} />;
    case "github": return <GithubCard repo={text("repo") ?? text("repository") ?? ""} title={text("title")} description={text("description")} />;
    case "br": return <br />;
    case "mark": case "kbd": case "sub": case "sup": case "abbr": case "small": case "ins": case "u": case "b": case "i": case "strong": case "em": case "s":
      return createElement(component, elementProps(props), fallback);
    case "div": case "section": case "center": return wrap(component === "center" ? "text-center" : "");
    default:
      // Unknown components retain every slot's readable content without executing code.
      return wrap("md-unknown-component", <>{hasContent ? content : text("text")}{Object.entries(slots).filter(([name]) => name !== "default").map(([name, blocks]) => <div key={name}>{renderBlocks(blocks, `${prefix}-${name}`)}</div>)}</>);
  }
}

function renderBlocks(blocks: MarkdownBlock[], prefix: string): ReactNode[] {
  return groupImageParagraphs(blocks).map((block, index) => {
    const key = `${prefix}-${index}`;
    switch (block.type) {
      case "heading": return createElement(`h${block.level}`, { ...elementProps(block.attrs), key, id: block.id }, <a className="article-heading-anchor" href={`#${block.id}`}>{renderInline(block.children, key, true)}</a>);
      case "paragraph": {
        const images = getImageRow(block.children);
        return images ? <MarkdownImageGallery key={key} images={images} /> : <p key={key} {...elementProps(block.attrs)}>{renderInline(block.children, key)}</p>;
      }
      case "blockquote": return <blockquote key={key}>{renderBlocks(block.children, key)}</blockquote>;
      case "component": return <ContentComponent key={key} {...block} prefix={key} />;
      case "math": return <MathExpression key={key} value={block.value} display />;
      case "list": {
        const items = block.items.map((item, i) => <li key={`${key}-${i}`} className={typeof block.checked?.[i] === "boolean" ? "md-task-item" : undefined}>
          {typeof block.checked?.[i] === "boolean" && <input type="checkbox" checked={block.checked[i]!} disabled aria-label={block.checked[i] ? "Completed" : "Not completed"} />}{renderBlocks(item, `${key}-${i}`)}</li>);
        return block.ordered ? <ol key={key} start={block.start}>{items}</ol> : <ul key={key}>{items}</ul>;
      }
      case "code":
        if (block.language === "mermaid") return <MermaidDiagram key={key} code={block.value} />;
        if (["music-abc", "abc"].includes(block.language)) return <MusicScore key={key} abc={block.value} />;
        if (["math", "latex", "katex"].includes(block.language)) return <MathExpression key={key} value={block.value} display />;
        return <HighlightedBlock key={key} {...block} />;
      case "hr": return <hr key={key} />;
      case "footnote-definition": return <div key={key} id={`fn-${block.id}`} className="md-footnote"><span className="md-footnote-number">{block.number}.</span><div>{renderBlocks(block.children, key)}{Array.from({ length: block.references }, (_, i) => <a key={i} className="md-footnote-back" href={`#fnref-${block.id}-${i + 1}`} aria-label={`Back to reference ${block.number}${i ? ` (${i + 1})` : ""}`}>↩{i ? i + 1 : ""}</a>)}</div></div>;
      case "table": return <ContentTable key={key}><table><thead><tr>{block.headers.map((cell, column) => <th key={column} scope="col" style={{ textAlign: block.align[column] }}>{renderInline(cell, `${key}-h-${column}`)}</th>)}</tr></thead><tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, column) => <td key={column} style={{ textAlign: block.align[column] }}>{renderInline(cell, `${key}-${i}-${column}`)}</td>)}</tr>)}</tbody></table></ContentTable>;
    }
  });
}

export function MarkdownBlocks({ blocks, className = "" }: { blocks: MarkdownBlock[]; className?: string }) {
  return <div className={`markdown ${className}`.trim()}>{renderBlocks(blocks, "md")}</div>;
}
export function Markdown({ content, className = "" }: { content: string; className?: string }) {
  return <><ContentAnchorNavigation /><MarkdownBlocks blocks={splitContentSlots(parseMarkdown(content)).body} className={className} /></>;
}

export function MarkdownSlot({ block }: { block: Extract<MarkdownBlock, { type: "component" }> }) {
  return <section className={`md-meta-slot${boolProp(block.props, "card") ? " is-card" : ""}`}>
    {textProp(block.props, "title") && <h3>{textProp(block.props, "title")}</h3>}
    <MarkdownBlocks blocks={[...block.children, ...Object.values(block.slots).flat()]} />
  </section>;
}

export default Markdown;
