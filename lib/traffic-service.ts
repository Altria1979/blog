import { randomUUID } from "node:crypto";

const siteOrigin = "https://altria.ink";
const visitorCookie = "altria_busuanzi_id";
const validVisitorId = /^[A-Za-z0-9_-]{1,128}$/;

function readCookie(header: string, name: string): string | undefined {
  const part = header.split(";").find((entry) => entry.trim().startsWith(`${name}=`));
  const value = part?.trim().slice(name.length + 1);
  return value && validVisitorId.test(value) ? value : undefined;
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

function parseCounter(text: string, callback: string) {
  // The upstream MIME type is JSON, but its body is this JSONP wrapper.
  // Parse only the expected callback's JSON argument; never execute remote code.
  const match = text.trim().match(new RegExp(`^try\\s*\\{\\s*${callback}\\s*\\(\\s*(\\{[\\s\\S]*\\})\\s*\\)\\s*;\\s*\\}\\s*catch\\s*\\(\\s*e\\s*\\)\\s*\\{\\s*\\}\\s*;?$`));
  if (!match) return null;
  try {
    const { site_pv: pageViews, site_uv: visitors } = JSON.parse(match[1]);
    if (!Number.isSafeInteger(pageViews) || pageViews < 0
      || !Number.isSafeInteger(visitors) || visitors < 0) return null;
    return { pageViews: pageViews as number, visitors: visitors as number };
  } catch {
    return null;
  }
}

/** One authorized page view produces at most one uncached upstream request. */
export async function handleTrafficRequest(request: Request, fetcher: typeof fetch = fetch): Promise<Response> {
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

  const callback = `BusuanziCallback_${randomUUID().replaceAll("-", "")}`;
  const upstreamUrl = new URL("https://busuanzi.ibruce.info/busuanzi");
  upstreamUrl.searchParams.set("jsonpCallback", callback);
  const headers = new Headers({ Referer: new URL(pathname, siteOrigin).href });
  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("User-Agent", userAgent);
  const visitorId = readCookie(request.headers.get("cookie") ?? "", visitorCookie);
  if (visitorId) headers.set("Cookie", `busuanziId=${visitorId}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const upstream = await fetcher(upstreamUrl, {
      method: "GET", headers, cache: "no-store", redirect: "error", signal: controller.signal,
    });
    const issuedId = upstream.headers.getSetCookie()
      .map((cookie) => readCookie(cookie.split(";", 1)[0], "busuanziId")).find(Boolean);
    if (issuedId) {
      responseHeaders.set("Set-Cookie", `${visitorCookie}=${issuedId}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    }
    if (!upstream.ok) return fail(502);
    const stats = parseCounter(await upstream.text(), callback);
    return stats ? Response.json(stats, { headers: responseHeaders }) : fail(502);
  } catch {
    return fail(controller.signal.aborted ? 504 : 502);
  } finally {
    clearTimeout(timeout);
  }
}
