"use client";

import { useId, useState, type CSSProperties } from "react";
import { codeStats, codeTokenLines, type CodeMeta, type CodeToken } from "../lib/code";
import { Icon } from "./icon";
import { getMessages } from "@/lib/messages";
import { useLocale } from "./locale-provider";
import { contentCodeIcon } from "../lib/content-icons";
import { ContentIcon } from "./markdown-interactions";
import "./code-enhancements.css";

function tokenStyle(token: CodeToken): CSSProperties {
  const fontStyle = token.fontStyle ?? 0;
  const darkFontStyle = token.darkFontStyle ?? fontStyle;
  return {
    "--code-token-light": token.lightColor,
    "--code-token-dark": token.darkColor,
    "--code-font-style": fontStyle & 1 ? "italic" : "normal",
    "--code-font-weight": fontStyle & 2 ? "bold" : "normal",
    "--code-text-decoration": fontStyle & 4 ? "underline" : "none",
    "--code-dark-font-style": darkFontStyle & 1 ? "italic" : "normal",
    "--code-dark-font-weight": darkFontStyle & 2 ? "bold" : "normal",
    "--code-dark-text-decoration": darkFontStyle & 4 ? "underline" : "none",
  } as CSSProperties;
}

export function CodeBlock({
  value,
  language,
  filename,
  highlights,
  diff,
  tokens,
  wrap = false,
  expand = false,
  indent = 2,
  icon,
}: CodeMeta & { value: string; tokens: CodeToken[] }) {
  const t = getMessages(useLocale());
  const [expanded, setExpanded] = useState(expand);
  const [wrapped, setWrapped] = useState(wrap);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const contentId = useId();
  const stats = codeStats(value);
  const collapsible = stats.collapsible && !expand;
  const collapsed = collapsible && !expanded;
  const displayValue = tokens.map(token => token.text).join("");
  const tokenLines = codeTokenLines(tokens);
  if (displayValue.endsWith("\n")) tokenLines.pop();
  const hasFocus = tokens.some(token => token.lineClasses?.includes("focused"));
  const safeIcon = icon && /^[a-z0-9-]+:[a-z0-9-]+$/.test(icon) ? icon : contentCodeIcon(language, filename);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className={`article-code${collapsed ? " is-collapsed" : ""}${wrapped ? " is-wrapped" : ""}${hasFocus ? " has-focused" : ""}`} style={{ "--code-indent": Math.max(1, Math.min(16, indent)) } as CSSProperties}>
      <div className="article-code-toolbar">
        <span className="article-code-filename">
          <ContentIcon name={safeIcon} />
          {filename ?? t.code}
        </span>
        <span className="article-code-language">{language || "text"}</span>
        <div className="article-code-actions">
          <button
            type="button"
            onClick={() => setWrapped(!wrapped)}
            aria-pressed={wrapped}
            aria-label={wrapped ? t.disableCodeWrap : t.enableCodeWrap}
            title={wrapped ? t.disableWrap : t.wrap}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 6h18M3 11h14a4 4 0 0 1 0 8h-4m3-3-3 3 3 3M3 16h5" /></svg>
          </button>
          <button type="button" onClick={copy} aria-label={t.copyCode} title={t.copyCode}>
            <Icon name={copyStatus === "copied" ? "check" : "copy"} width="17" height="17" />
          </button>
        </div>
      </div>
      <pre id={contentId} tabIndex={0} aria-label={filename ? `${filename}, ${t.codeLines(stats.lines)}` : t.codeLines(stats.lines)}>
        <code className={language ? `language-${language}` : undefined}>
          {(collapsed ? tokenLines.slice(0, 16) : tokenLines).map((lineTokens, index) => {
            const line = lineTokens.map(token => token.text).join("");
            const number = lineTokens.find(token => token.lineNumber)?.lineNumber ?? index + 1;
            const classes = lineTokens.find(token => token.lineClasses)?.lineClasses ?? [];
            const highlighted = classes.includes("highlighted") || highlights.some(({ start, end }) => number >= start && number <= end);
            const changed = diff && /^[+-]/.test(line) && !/^(?:\+{3}|-{3})/.test(line);
            const added = classes.includes("add") || (changed && line.startsWith("+"));
            const removed = classes.includes("remove") || (changed && line.startsWith("-"));
            return (
              <span
                key={index}
                className={`article-code-line${highlighted ? " is-highlighted" : ""}${added ? " is-added" : ""}${removed ? " is-removed" : ""}${classes.includes("focused") ? " is-focused" : ""}${classes.includes("error") ? " is-error" : ""}${classes.includes("warning") ? " is-warning" : ""}`}
                data-line-number={number}
              >
                {line ? lineTokens.map((token, tokenIndex) => (
                  token.kind || token.lightColor || token.darkColor || token.highlighted || token.indentGuide
                    ? <span key={tokenIndex} className={`${token.kind ? `code-token-${token.kind} ` : ""}${token.lightColor || token.darkColor ? "article-shiki-token " : ""}${token.highlighted ? "is-word-highlighted " : ""}${token.indentGuide ? "article-code-indent" : ""}`.trim()} style={tokenStyle(token)}>{token.text}</span>
                    : token.text
                )) : "\u200b"}
              </span>
            );
          })}
        </code>
      </pre>
      {collapsible && (
        <button
          type="button"
          className="article-code-expand"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={contentId}
        >
          <span>{expanded ? t.collapseCode : t.expandCode}</span>
          <span>{t.codeStats(stats.lines, stats.characters, stats.bytes)}</span>
          <Icon name="chevron" width="14" height="14" />
        </button>
      )}
      <span className="article-code-status" role="status">{copyStatus === "copied" ? t.codeCopied : copyStatus === "error" ? t.codeCopyFailed : ""}</span>
    </div>
  );
}
