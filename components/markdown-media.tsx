"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { SynthObjectController } from "abcjs";
import {
  githubRepository, githubRepositoryData, mediaLength, safeMediaUrl, videoLink, videoRatio, videoSource,
  type GithubRepositoryData, type VideoEmbedProps,
} from "../lib/content-media";
import "abcjs/abcjs-audio.css";
import "./markdown-media.css";

function useNearViewport() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    if (!("IntersectionObserver" in window)) {
      queueMicrotask(() => { if (active) setVisible(true); });
      return () => { active = false; };
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.boundingClientRect.width > 0)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "50%" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function Source({ code, language }: { code: string; language: string }) {
  return <details className="markdown-media-source"><summary>查看 {language} 源码</summary><pre><code>{code}</code></pre></details>;
}

// Mermaid's configuration is global; serialize initialization with each render.
let diagramQueue: Promise<unknown> = Promise.resolve();

export function MermaidDiagram({ code }: { code: string }) {
  const { ref, visible } = useNearViewport();
  const id = useId().replace(/[^a-z\d_-]/gi, "");
  const sequence = useRef(0);
  const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.dataset.theme === "dark", () => false);
  const [fit, setFit] = useState(false);
  const [result, setResult] = useState<{ svg?: string; width?: number; error?: string }>({});

  useEffect(() => {
    if (!visible) return;
    let disposed = false;
    diagramQueue = diagramQueue.catch(() => {}).then(async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        await document.fonts?.ready;
        if (disposed) return;
        const style = getComputedStyle(document.documentElement);
        const canvas = document.createElement("canvas").getContext("2d");
        const color = (name: string, fallback: string) => {
          if (!canvas) return fallback;
          canvas.fillStyle = fallback;
          canvas.fillStyle = style.getPropertyValue(name).trim() || fallback;
          return canvas.fillStyle;
        };
        mermaid.initialize({
          startOnLoad: false, securityLevel: "strict", suppressErrorRendering: true, theme: "base", fontFamily: "inherit",
          themeVariables: {
            darkMode: dark, background: color("--panel", dark ? "#202124" : "#f3f4f5"),
            edgeLabelBackground: color("--panel", dark ? "#202124" : "#f3f4f5"),
            primaryColor: color("--panel", dark ? "#202124" : "#f3f4f5"),
            primaryBorderColor: color("--accent", "#367bf0"),
            primaryTextColor: color("--text", dark ? "#eeeeee" : "#333333"),
            textColor: color("--text", dark ? "#eeeeee" : "#333333"),
            lineColor: color("--secondary", dark ? "#bbbbbb" : "#666666"),
          },
        });
        const { svg } = await mermaid.render(`diagram-${id}-${sequence.current++}`, code);
        const width = new DOMParser().parseFromString(svg, "image/svg+xml").querySelector("svg")?.viewBox.baseVal.width;
        if (!disposed) setResult({ svg, width });
      } catch (error) {
        if (!disposed) setResult({ error: error instanceof Error ? error.message : "无法绘制图表" });
      }
    });
    return () => { disposed = true; };
  }, [code, dark, id, visible]);

  return <div ref={ref} className="markdown-mermaid">
    {result.svg ? <>
      <div className="markdown-media-tools"><button type="button" aria-pressed={fit} onClick={() => setFit(!fit)}>{fit ? "横向滚动" : "适应宽度"}</button></div>
      <div className="markdown-mermaid-scroll" tabIndex={0} role="region" aria-label="Mermaid 图表">
        <div style={{ minWidth: !fit && result.width ? `${result.width}px` : undefined }} dangerouslySetInnerHTML={{ __html: result.svg }} />
      </div>
    </> : <p role="status" className="markdown-media-status">{result.error ? "图表渲染失败，源码仍可查看。" : visible ? "正在绘制图表…" : "图表将在进入视野后加载。"}</p>}
    {result.error && <details className="markdown-media-error"><summary>错误详情</summary><pre>{result.error}</pre></details>}
    <Source code={code} language="Mermaid" />
  </div>;
}

export function MusicScore({ abc }: { abc: string }) {
  const { ref, visible } = useNearViewport();
  const score = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("乐谱将在进入视野后加载。");
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!visible || !score.current || !audio.current) return;
    const scoreElement = score.current;
    const audioElement = audio.current;
    let disposed = false;
    let controller: (SynthObjectController & { destroy?: () => void }) | undefined;
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 7000);
    async function render() {
      try {
        const library = await import("abcjs");
        const abcjs = library.default ?? library;
        if (disposed) return;
        scoreElement.replaceChildren();
        audioElement.replaceChildren();
        const tune = abcjs.renderAbc(scoreElement, abc, { responsive: "resize", add_classes: true, foregroundColor: "currentColor", ariaLabel: "ABC 乐谱" })[0];
        if (!tune) throw new Error("未找到可渲染的 ABC 乐谱。");
        setStatus("");
        setError(undefined);
        if (!abcjs.synth.supportsAudio()) {
          setStatus("当前浏览器不支持乐谱播放，仍可阅读乐谱。");
          return;
        }
        try {
          const response = await fetch("https://paulrosen.github.io/midi-js-soundfonts/", { method: "HEAD", signal: abort.signal, credentials: "omit" });
          if (!response.ok) throw new Error("SoundFonts unavailable");
        } catch {
          if (!disposed) setStatus("音源暂时无法加载，仍可阅读乐谱。");
          return;
        } finally { window.clearTimeout(timeout); }
        if (disposed) return;
        controller = new abcjs.synth.SynthController();
        const player = controller;
        const play = player.play.bind(player);
        player.play = () => Promise.resolve(play()).then(() => {
          if (disposed) player.pause();
        }).catch(() => {
          player.pause();
          player.disable(true);
          if (!disposed) setStatus("音源加载失败，仍可阅读乐谱。");
        });
        player.load(audioElement, null, { displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true });
        // false defers audio initialization until the visitor presses Play.
        await player.setTune(tune, false, { soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/" });
        if (disposed) player.pause();
      } catch (failure) {
        if (!disposed) {
          setError(failure instanceof Error ? failure.message : "乐谱渲染失败");
          setStatus("乐谱渲染失败，源码仍可查看。");
        }
      }
    }
    void render();
    return () => {
      disposed = true;
      abort.abort();
      window.clearTimeout(timeout);
      controller?.pause();
      controller?.destroy?.();
      audioElement.replaceChildren();
    };
  }, [abc, visible]);

  return <div ref={ref} className="markdown-music-score">
    <div ref={score} className="markdown-score-sheet" role="img" aria-label="ABC 乐谱" />
    <div ref={audio} aria-label="乐谱播放控制" />
    {status && <p role="status" className="markdown-media-status">{status}</p>}
    {error && <details className="markdown-media-error"><summary>错误详情</summary><pre>{error}</pre></details>}
    <Source code={abc} language="ABC" />
  </div>;
}

export function VideoEmbed(props: VideoEmbedProps) {
  const { type = "raw", autoplay = false, poster, width, height, zoom } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [automaticZoom, setAutomaticZoom] = useState<number>();
  const src = videoSource(props);
  const fixedZoom = typeof zoom === "number" && Number.isFinite(zoom) && zoom > 0 && zoom <= 10 ? zoom : undefined;
  useEffect(() => {
    const element = ref.current;
    if (!element || !["douyin", "douyin-wide"].includes(type) || fixedZoom || !("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setAutomaticZoom(entry.contentRect.width * (type === "douyin" ? 0.0031 : 0.00134));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [fixedZoom, type]);
  if (!src) return <div className="markdown-media-invalid" role="note">无法嵌入视频：来源类型或视频地址无效。</div>;
  const style: CSSProperties = { aspectRatio: videoRatio(props), maxWidth: mediaLength(width), maxHeight: mediaLength(height) ?? "80vh" };
  return <figure className="markdown-video-figure" style={{ maxWidth: style.maxWidth }}>
    <div ref={ref} className={`markdown-video${type === "raw" ? " is-raw" : ""}`} style={style}>
      {type === "raw"
        ? <video src={src} poster={safeMediaUrl(poster)} controls preload="metadata" playsInline autoPlay={autoplay} muted={autoplay} style={{ maxHeight: style.maxHeight }} />
        : <iframe src={src} title={`${type} 视频播放器`} loading="lazy" style={{ zoom: fixedZoom ?? automaticZoom }} allow="accelerometer; autoplay; encrypted-media; fullscreen; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
    </div>
    <figcaption><a href={videoLink(props)} target="_blank" rel="noopener noreferrer">{type === "raw" ? "打开视频源文件" : "在原站打开视频"} ↗</a></figcaption>
  </figure>;
}

const repositoryCache = new Map<string, Promise<GithubRepositoryData | undefined>>();

function fetchRepository(api: string) {
  let result = repositoryCache.get(api);
  if (!result) {
    result = fetch(api, { headers: { Accept: "application/vnd.github+json" }, credentials: "omit", signal: AbortSignal.timeout(8000) })
      .then(response => response.ok ? response.json() : undefined)
      .then(githubRepositoryData)
      .catch(() => undefined);
    repositoryCache.set(api, result);
  }
  return result;
}

export function GithubCard({ repo, title, description }: { repo: string; title?: string; description?: string }) {
  const { ref, visible } = useNearViewport();
  const repository = githubRepository(repo);
  const api = repository?.api;
  const [result, setResult] = useState<{ api: string; data?: GithubRepositoryData }>();
  useEffect(() => {
    if (!visible || !api) return;
    let active = true;
    void fetchRepository(api).then(data => { if (active) setResult({ api, data }); });
    return () => { active = false; };
  }, [api, visible]);
  if (!repository) return <div className="markdown-media-invalid" role="note">GitHub 仓库名称无效，请使用 owner/repository 格式。</div>;
  const data = result && result.api === api ? result.data : undefined;
  const format = (value: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return <div ref={ref} className="markdown-github-container"><a href={repository.url} className="markdown-github-card" target="_blank" rel="noopener noreferrer">
    {data?.avatar
      // A public GitHub avatar is optional; API and image failures leave a usable repository link.
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={data.avatar} alt="" width={48} height={48} loading="lazy" decoding="async" />
      : <span className="markdown-github-symbol" aria-hidden="true">⌘</span>}
    <span className="markdown-github-info"><strong>{title || repository.name}</strong><span className="markdown-github-description">{description || data?.description || "在 GitHub 查看仓库"}</span>
      {data && <span className="markdown-github-meta">
        {data.stars !== undefined && <span aria-label={`${data.stars} 个星标`}>☆ {format(data.stars)}</span>}
        {data.forks !== undefined && <span aria-label={`${data.forks} 个派生`}>⑂ {format(data.forks)}</span>}
        {(data.license || data.language) && <span>{data.license || data.language}</span>}
      </span>}
    </span>
  </a></div>;
}
