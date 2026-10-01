"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useLocale } from "./locale-provider";
import "./markdown-copy.css";

function useLabels() {
  const locale = useLocale();
  return {
    zh: { copy: "复制", copied: "已复制", failed: "复制失败，请手动复制", reset: "恢复原始内容", edit: "编辑命令", wrap: "表格自动换行", reveal: "显示隐藏内容", hide: "隐藏内容", shuffle: "随机排列", restore: "恢复顺序" },
    en: { copy: "Copy", copied: "Copied", failed: "Copy failed; copy manually", reset: "Restore original", edit: "Edit command", wrap: "Wrap table text", reveal: "Reveal hidden text", hide: "Hide text", shuffle: "Shuffle", restore: "Restore order" },
    ja: { copy: "コピー", copied: "コピーしました", failed: "手動でコピーしてください", reset: "元に戻す", edit: "コマンドを編集", wrap: "表の折り返し", reveal: "隠した文字を表示", hide: "文字を隠す", shuffle: "シャッフル", restore: "元の順序" },
  }[locale];
}

export function ContentTabs({ labels, panels, active = 1, center = false }: { labels: string[]; panels: ReactNode[]; active?: number; center?: boolean }) {
  const [selected, setSelected] = useState(Math.max(0, Math.min(labels.length - 1, active - 1)));
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reveal = () => {
      let hash: string;
      try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const target = hash && document.getElementById(hash);
      if (!target || !root.current?.contains(target)) return;
      const index = panels.findIndex((_, index) => document.getElementById(`${id}-panel-${index}`)?.contains(target));
      if (index >= 0) {
        setSelected(index);
        requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      }
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [id, panels]);
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "Home" ? 0 : event.key === "End" ? labels.length - 1
      : event.key === "ArrowRight" ? (index + 1) % labels.length
        : event.key === "ArrowLeft" ? (index + labels.length - 1) % labels.length : undefined;
    if (next === undefined) return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }
  return <div ref={root} className={`md-tabs${center ? " is-centered" : ""}`}>
    <div className="md-tab-list" role="tablist" aria-label={labels.join(" / ")}>
      {labels.map((label, index) => <button key={index} id={`${id}-tab-${index}`} type="button" role="tab" aria-selected={selected === index}
        aria-controls={`${id}-panel-${index}`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => onKey(event, index)}>{label}</button>)}
    </div>
    {panels.map((panel, index) => <div key={index} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={selected !== index} tabIndex={0} className="md-tab-panel">{panel}</div>)}
  </div>;
}

export function ContentCopy({ code, prompt = "$", lang, inline = false, children }: { code: string; prompt?: string | boolean; lang?: string; inline?: boolean; children?: ReactNode }) {
  const t = useLabels();
  const [value, setValue] = useState(code);
  const [status, setStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const inferredLanguage = typeof prompt === "string"
    ? prompt.startsWith("$") || prompt.startsWith("#") ? "sh" : prompt.startsWith("CMD") ? "bat" : prompt.startsWith("PS") ? "powershell" : "text"
    : "text";
  const language = lang?.trim().toLowerCase() || inferredLanguage;
  const [highlighted, setHighlighted] = useState<{
    value: string;
    language: string;
    tokens: { content: string; light?: string; dark?: string }[];
  }>();
  const tokens = highlighted?.value === value && highlighted.language === language ? highlighted.tokens : undefined;
  useEffect(() => {
    if (inline || !value || value.length > 20_000) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const { codeToTokens, bundledLanguages } = await import("shiki");
        const resolvedLanguage = Object.hasOwn(bundledLanguages, language) ? language as keyof typeof bundledLanguages : "text";
        const { tokens } = await codeToTokens(value, { lang: resolvedLanguage, themes: { light: "catppuccin-latte", dark: "one-dark-pro" }, defaultColor: false });
        if (!active) return;
        setHighlighted({ value, language, tokens: tokens.flat().map(token => ({ content: token.content, light: token.htmlStyle?.["--shiki-light"] ?? token.color, dark: token.htmlStyle?.["--shiki-dark"] ?? token.color })) });
        requestAnimationFrame(() => {
          if (active && highlight.current && input.current) highlight.current.scrollLeft = input.current.scrollLeft;
        });
      } catch {
        // The native input remains readable and editable when highlighting is unavailable.
        if (active) setHighlighted(undefined);
      }
    }, 80);
    return () => { active = false; window.clearTimeout(timer); };
  }, [inline, language, value]);
  async function copy() {
    try { await navigator.clipboard.writeText(inline ? code : value); setStatus(t.copied); }
    catch { setStatus(t.failed); }
  }
  return <span className={`md-copy${inline ? " is-inline" : ""}`}>
    {!inline && prompt !== true && prompt !== false && <span className="md-copy-prompt">{prompt}</span>}
    {inline ? <code>{children ?? code}</code> : <span className={`md-copy-editor${tokens ? " is-highlighted" : ""}`} data-language={language}>
      {tokens && <span ref={highlight} className="md-copy-highlight" aria-hidden="true"><span className="md-copy-token-line">{tokens.map((token, index) => <span key={index} className="md-copy-token" style={{ "--copy-token-light": token.light, "--copy-token-dark": token.dark } as CSSProperties}>{token.content}</span>)}</span></span>}
      <input ref={input} aria-label={t.edit} value={value} spellCheck={false} autoCapitalize="off" autoCorrect="off" dir="ltr"
        onScroll={event => { if (highlight.current) highlight.current.scrollLeft = event.currentTarget.scrollLeft; }}
        onChange={event => { setValue(event.target.value.replace(/[\r\n]/g, "")); setStatus(""); }} />
    </span>}
    {!inline && value !== code && <button type="button" aria-label={t.reset} title={t.reset} onClick={() => { setValue(code); setStatus(""); }}>↶</button>}
    <button type="button" aria-label={t.copy} title={t.copy} onClick={copy}>{status === t.copied ? "✓" : "⧉"}</button>
    <span className="md-sr-only" role="status">{status}</span>
  </span>;
}

export function ContentTip({ children, tip, copy = false }: { children: ReactNode; tip?: string; copy?: boolean }) {
  const t = useLabels();
  const text = useRef<HTMLSpanElement>(null);
  const tooltip = useRef<HTMLSpanElement>(null);
  const [tooltipShift, setTooltipShift] = useState(0);
  const [status, setStatus] = useState("");
  const id = useId();
  function fitTooltip() {
    setTooltipShift(0);
    requestAnimationFrame(() => {
      const rect = tooltip.current?.getBoundingClientRect();
      if (rect) setTooltipShift(rect.left < 16 ? 16 - rect.left : rect.right > innerWidth - 16 ? innerWidth - 16 - rect.right : 0);
    });
  }
  async function activate() {
    if (!copy) return;
    try { await navigator.clipboard.writeText(text.current?.textContent ?? ""); setStatus(t.copied); }
    catch { setStatus(t.failed); }
  }
  return <span className="md-tip" tabIndex={0} role={copy ? "button" : undefined} aria-describedby={id} onClick={activate} onFocus={fitTooltip} onMouseEnter={fitTooltip}
    onKeyDown={e => { if (copy && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); void activate(); } }}>
    <span ref={text}>{children}</span>{copy && <span aria-hidden="true"> ⧉</span>}
    <span ref={tooltip} id={id} role="tooltip" className="md-tooltip" style={{ "--tip-shift": `${tooltipShift}px` } as CSSProperties}>{status || tip || t.copy}</span>
    <span className="md-sr-only" role="status">{status}</span>
  </span>;
}

export function ContentBlur({ children }: { children: ReactNode }) {
  const t = useLabels();
  const [revealed, setRevealed] = useState(false);
  return <span className={`md-blur${revealed ? " is-revealed" : ""}`} tabIndex={0} role="button" aria-label={revealed ? t.hide : t.reveal} aria-expanded={revealed}
    onClick={() => setRevealed(!revealed)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setRevealed(!revealed); } }}>{children}</span>;
}

export function ContentIcon({ name, label }: { name: string; label?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !/^[a-z][\w-]*:[a-z][\w-]*$/i.test(name)) return <span className="md-content-icon" role="img" aria-label={label || name} title={label || name}>◇</span>;
  // Iconify serves only the explicitly named icon; no script from Markdown runs.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="md-content-icon" src={`https://api.iconify.design/${name.replace(":", "/")}.svg?color=%23888888`} alt={label || name} title={label || name} loading="lazy" onError={() => setFailed(true)} />;
}

export function ContentAssetImage({ src, alt = "", className, width, height }: { src: string; alt?: string; className?: string; width?: number; height?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return alt ? <span className={className}>{alt}</span> : null;
  // Author-declared card images may use hosts outside the Next image allowlist.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} width={width} height={height} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

export type ContentKeyProps = { text?: string; code?: string; icon?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean; win?: boolean; cmd?: boolean; prevent?: boolean };
export function ContentKey(props: ContentKeyProps) {
  const [isMac, setIsMac] = useState(false);
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform);
    const updatePlatform = window.setTimeout(() => setIsMac(mac), 0);
    const onDown = (event: globalThis.KeyboardEvent) => {
      const matches = (!props.code || event.key.toLowerCase() === props.code.toLowerCase()) &&
        event.ctrlKey === Boolean(props.ctrl || (props.cmd && !mac) || props.code === "Control") && event.shiftKey === Boolean(props.shift || props.code === "Shift") &&
        event.altKey === Boolean(props.alt || props.code === "Alt") && event.metaKey === Boolean(props.meta || props.win || (props.cmd && mac) || props.code === "Meta");
      setPressed(matches);
      if (matches && props.prevent) event.preventDefault();
    };
    const clear = () => setPressed(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", clear);
    window.addEventListener("blur", clear);
    return () => { clearTimeout(updatePlatform); window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", clear); window.removeEventListener("blur", clear); };
  }, [props.code, props.ctrl, props.shift, props.alt, props.meta, props.win, props.cmd, props.prevent]);
  const symbol = props.icon ?? isMac;
  const names: Record<string, string> = symbol ? { Control: "⌃", Meta: isMac ? "⌘" : "⊞", Alt: "⌥", Shift: "⇧", Enter: "↵", Tab: "⇥", Escape: "⎋", Backspace: "⌫", " ": "␣" }
    : { Control: "Ctrl", Meta: isMac ? "Cmd" : "Win", Escape: "Esc", Delete: "Del", " ": "Space" };
  const keys = [props.cmd && (isMac ? "Meta" : "Control"), props.ctrl && !props.cmd && "Control", props.shift && "Shift", props.alt && "Alt", (props.meta || props.win) && !props.cmd && "Meta", props.code];
  const value = props.text || keys.filter((key): key is string => typeof key === "string").map(key => names[key] ?? ({ ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" }[key] || key)).join(symbol ? "" : "+");
  return <kbd className={`md-key${pressed ? " is-pressed" : ""}`}>{value}</kbd>;
}

export function ContentClock({ datetime, rotate }: { datetime?: string; rotate?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (datetime) return;
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 30_000);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, [datetime]);
  const date = datetime ? new Date(datetime.replace(" ", "T") + (/Z$|[+-]\d{2}:?\d{2}$/.test(datetime) ? "" : "+08:00")) : now;
  const parts = date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Shanghai", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(date) : [];
  const hour = Number(parts.find(p => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find(p => p.type === "minute")?.value ?? 0);
  const faces = ["🕛", "🕧", "🕐", "🕜", "🕑", "🕝", "🕒", "🕞", "🕓", "🕟", "🕔", "🕠", "🕕", "🕡", "🕖", "🕢", "🕗", "🕣", "🕘", "🕤", "🕙", "🕥", "🕚", "🕦"];
  const index = rotate ? ((hour % 12 - Math.round(minute / 5) + 12) % 12) * 2 : (hour * 2 + Math.round(minute / 30)) % 24;
  return <span className="md-clock" role="img" aria-label={`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`} style={rotate ? { transform: `rotate(${Math.round(minute / 5) * 30}deg)` } : undefined}>{faces[index]}</span>;
}

export function ContentTable({ children }: { children: ReactNode }) {
  const t = useLabels();
  const [wrap, setWrap] = useState(false);
  return <div className={`markdown-table md-table${wrap ? " is-wrapped" : ""}`}>
    <div className="md-table-toolbar"><button type="button" aria-pressed={wrap} onClick={() => setWrap(!wrap)}>{t.wrap}</button></div>
    <div className="md-table-scroll" tabIndex={0}>{children}</div>
  </div>;
}

export function ContentFeedGroup({ name, description, shuffle, cards }: { name?: string; description?: string; shuffle?: boolean; cards: ReactNode[] }) {
  const t = useLabels();
  const [order, setOrder] = useState<number[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const previousPositions = useRef(new Map<string, DOMRect>());
  const indices = order.length === cards.length ? order : cards.map((_, i) => i);
  const count = cards.length;
  function rememberPositions() {
    previousPositions.current = new Map(Array.from(list.current?.children ?? []).map(child => [child.getAttribute("data-card")!, child.getBoundingClientRect()]));
  }
  function randomOrder(values: number[]) {
    const next = [...values];
    for (let i = next.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [next[i], next[j]] = [next[j], next[i]]; }
    return next;
  }
  useEffect(() => {
    if (!shuffle || new URLSearchParams(location.search).get("shuffle") === "false") return;
    const frame = requestAnimationFrame(() => setOrder(randomOrder(Array.from({ length: count }, (_, i) => i))));
    return () => cancelAnimationFrame(frame);
  }, [shuffle, count]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const child of Array.from(list.current?.children ?? [])) {
      const before = previousPositions.current.get(child.getAttribute("data-card")!);
      if (!before || typeof child.animate !== "function") continue;
      const after = child.getBoundingClientRect();
      child.animate([{ transform: `translate(${before.left - after.left}px, ${before.top - after.top}px)` }, { transform: "none" }], { duration: 350, easing: "ease-out" });
    }
    previousPositions.current.clear();
  }, [order]);
  function mix() {
    rememberPositions();
    setOrder(randomOrder(indices));
  }
  function restore() { rememberPositions(); setOrder([]); }
  return <section className="md-feed-group"><h3>{shuffle ? <button type="button" title={`${t.shuffle} · Ctrl/⌘ ${t.restore}`} onClick={event => event.ctrlKey || event.metaKey || event.altKey || event.shiftKey ? restore() : mix()}>{name}</button> : name}</h3>{description && <p>{description}</p>}
    {shuffle && <div className="md-feed-tools"><button type="button" onClick={mix}>{t.shuffle}</button><button type="button" onClick={restore}>{t.restore}</button></div>}
    <div ref={list} className="md-feed-cards">{indices.map(index => <div key={index} data-card={index}>{cards[index]}</div>)}</div>
  </section>;
}

/** Deep links into folded content remain reachable from the shared TOC. */
export function ContentAnchorNavigation() {
  useEffect(() => {
    const reveal = () => {
      let hash: string;
      try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const target = hash && document.getElementById(hash);
      if (!target) return;
      let ancestor = target.parentElement;
      while (ancestor) { if (ancestor instanceof HTMLDetailsElement) ancestor.open = true; ancestor = ancestor.parentElement; }
    };
    reveal(); window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  return null;
}
