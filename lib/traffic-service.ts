import { randomUUID } from "node:crypto";

const siteOrigin = "https://altria.ink";
const visitorCookie = "altria_visitor_id";
const validVisitorId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type TrafficServiceConfig = {
  url?: string;
  secretKey?: string;
  serviceRoleKey?: string;
};

function serviceConfiguration(config: TrafficServiceConfig) {
  try {
    const url = new URL(config.url ?? "");
    if (url.protocol !== "https:" || url.username || url.password
      || url.pathname !== "/" || url.search || url.hash) return null;

    const headers = new Headers({ "Content-Type": "application/json", Accept: "application/json" });
    if (config.secretKey) {
      if (!/^sb_secret_[A-Za-z0-9_-]+$/.test(config.secretKey)) return null;
      headers.set("apikey", config.secretKey);
    } else {
      const key = config.serviceRoleKey;
      if (!key || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) return null;
      const payload: unknown = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
      if (!payload || typeof payload !== "object" || Array.isArray(payload)
        || (payload as Record<string, unknown>).role !== "service_role") return null;
      headers.set("apikey", key);
      headers.set("Authorization", `Bearer ${key}`);
    }
    return { url: new URL("/rest/v1/rpc/record_blog_page_view", url), headers };
  } catch {
    return null;
  }
}

function readCookie(header: string, name: string): string | undefined {
  const part = header.split(";").find((entry) => entry.trim().startsWith(`${name}=`));
  const value = part?.trim().slice(name.length + 1);
  return value && validVisitorId.test(value) ? value.toLowerCase() : undefined;
}

function validPathname(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2_048 || !value.startsWith("/") || value.startsWith("//")) return false;
  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith("/") && !decoded.startsWith("//")
      && !/[?#\\]/.test(value) && !/[?#\\]/.test(decoded)
      && !Array.from(decoded).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
  } catch {
    return false;
  }
}

function parseCounter(text: string) {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const { pageViews, visitors } = value as Record<string, unknown>;
    if (typeof pageViews !== "number" || typeof visitors !== "number") return null;
    if (!Number.isSafeInteger(pageViews) || pageViews < 0
      || !Number.isSafeInteger(visitors) || visitors < 0) return null;
    return { pageViews, visitors };
  } catch {
    return null;
  }
}

/** One authorized page view produces at most one uncached upstream request. */
export async function handleTrafficRequest(
  request: Request,
  fetcher: typeof fetch = fetch,
  config: TrafficServiceConfig = {
    url: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
): Promise<Response> {
  const responseHeaders = new Headers({ "Cache-Control": "no-store" });
  const fail = (status: number) => Response.json({ error: "Traffic statistics unavailable" }, { status, headers: responseHeaders });

  if (request.method !== "POST") {
    responseHeaders.set("Allow", "POST");
    return fail(405);
  }
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (url.origin !== siteOrigin || (host !== null && host !== "altria.ink")
    || request.headers.get("origin") !== siteOrigin) return fail(403);
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") return fail(415);

  let pathname: unknown;
  try {
    const body: unknown = await request.json();
    pathname = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).pathname : undefined;
  } catch {
    return fail(400);
  }
  if (!validPathname(pathname)) return fail(400);

  const service = serviceConfiguration(config);
  if (!service) return fail(503);
  const visitorId = readCookie(request.headers.get("cookie") ?? "", visitorCookie) ?? randomUUID();
  // Persist the same identity even if the database commits but its response is lost.
  responseHeaders.set("Set-Cookie", `${visitorCookie}=${visitorId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const startedAt = Date.now();
  let stage = "fetch";
  let upstreamStatus: number | null = null;
  const upstreamFailure = (status: number, error?: unknown) => {
    // Keep diagnostics structural: never log request headers, IDs, URLs or bodies.
    console.warn("[traffic] upstream failure", {
      stage, upstreamStatus,
      errorName: error instanceof Error && ["Error", "TypeError", "AbortError", "TimeoutError", "SyntaxError", "RangeError"].includes(error.name) ? error.name : null,
      elapsedMs: Math.max(0, Date.now() - startedAt),
    });
    return fail(status);
  };
  try {
    const upstream = await fetcher(service.url, {
      method: "POST", headers: service.headers, body: JSON.stringify({ p_visitor_id: visitorId }),
      cache: "no-store", redirect: "error", signal: controller.signal,
    });
    upstreamStatus = upstream.status;
    if (!upstream.ok) {
      stage = "status";
      return upstreamFailure(502);
    }
    stage = "body";
    const text = await upstream.text();
    stage = "parse";
    const stats = parseCounter(text);
    return stats ? Response.json(stats, { headers: responseHeaders }) : upstreamFailure(502);
  } catch (error) {
    return upstreamFailure(controller.signal.aborted ? 504 : 502, error);
  } finally {
    clearTimeout(timeout);
  }
}
