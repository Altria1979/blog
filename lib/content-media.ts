export type VideoProvider = "raw" | "bilibili" | "bilibili-nano" | "youtube" | "douyin" | "douyin-wide" | "tiktok";

export interface VideoEmbedProps {
  type?: string;
  id: string;
  autoplay?: boolean;
  ratio?: string | number;
  poster?: string;
  width?: string;
  height?: string;
  zoom?: number;
}

/** Only ordinary media URLs and paths rooted in this site are accepted. */
export function safeMediaUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim() || /[\u0000-\u001f\u007f\\]/.test(value)) return;
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) return;
    return parsed.href;
  } catch { return; }
}

export function mediaLength(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  if (/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|[sdl]?v[wh]|vmin|vmax)$/.test(trimmed) && Number.parseFloat(trimmed) > 0) return trimmed;
}

export function mediaRatio(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return;
  const parts = String(value).trim().split(/\s*\/\s*/);
  if (parts.length > 2 || parts.some(part => !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(part) || !Number.isFinite(Number(part)) || Number(part) <= 0)) return;
  return parts.join(" / ");
}

export function videoSource({ type = "raw", id, autoplay = false }: VideoEmbedProps): string | undefined {
  if (typeof id !== "string") return;
  if (type === "raw") return safeMediaUrl(id);
  if ((type === "bilibili" || type === "bilibili-nano") && /^BV[\da-zA-Z]{10}$/.test(id)) {
    const endpoint = type === "bilibili" ? "player.bilibili.com/player.html" : "www.bilibili.com/blackboard/newplayer.html";
    // Embedded players stay silent until the visitor chooses to play.
    return `https://${endpoint}?bvid=${id}&autoplay=0`;
  }
  if (type === "youtube" && /^[\w-]{11}$/.test(id))
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&autoplay=${autoplay ? 1 : 0}&mute=1`;
  if ((type === "douyin" || type === "douyin-wide") && /^\d{1,24}$/.test(id))
    return `https://open.douyin.com/player/video?vid=${id}&autoplay=0`;
  if (type === "tiktok" && /^\d{1,24}$/.test(id))
    return `https://www.tiktok.com/player/v1/${id}?autoplay=0`;
}

export function videoRatio({ type = "raw", ratio }: VideoEmbedProps): string | undefined {
  return mediaRatio(ratio) ?? (type === "raw" ? undefined : type === "douyin" ? "27 / 56" : type === "douyin-wide" ? "1198 / 731" : "16 / 9");
}

/** The viewer can still open a video when a provider blocks embedding. */
export function videoLink(props: VideoEmbedProps): string | undefined {
  if (!videoSource(props)) return;
  switch (props.type ?? "raw") {
    case "raw": return safeMediaUrl(props.id);
    case "bilibili":
    case "bilibili-nano": return `https://www.bilibili.com/video/${props.id}`;
    case "youtube": return `https://www.youtube.com/watch?v=${props.id}`;
    case "douyin":
    case "douyin-wide": return `https://www.douyin.com/video/${props.id}`;
    case "tiktok": return `https://www.tiktok.com/share/video/${props.id}`;
  }
}

export function githubRepository(value: unknown): { name: string; url: string; api: string } | undefined {
  if (typeof value !== "string") return;
  const name = value.trim();
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\/[\w.-]{1,100}$/i.test(name) || /\/\.{1,2}$/.test(name)) return;
  return { name, url: `https://github.com/${name}`, api: `https://api.github.com/repos/${name}` };
}

export interface GithubRepositoryData {
  description?: string;
  stars?: number;
  forks?: number;
  language?: string;
  license?: string;
  avatar?: string;
}

export function githubRepositoryData(value: unknown): GithubRepositoryData | undefined {
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if (typeof record.full_name !== "string") return;
  const text = (value: unknown) => typeof value === "string" ? value : undefined;
  const count = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
  const license = record.license && typeof record.license === "object" ? text((record.license as Record<string, unknown>).spdx_id) : undefined;
  const avatar = record.owner && typeof record.owner === "object" ? safeMediaUrl((record.owner as Record<string, unknown>).avatar_url) : undefined;
  return {
    description: text(record.description), stars: count(record.stargazers_count), forks: count(record.forks_count),
    language: text(record.language), license: license === "NOASSERTION" ? undefined : license,
    avatar: avatar?.startsWith("https://avatars.githubusercontent.com/") ? avatar : undefined,
  };
}
