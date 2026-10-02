export type TrafficStats = {
  pageViews: number;
  visitors: number;
};

let stats: TrafficStats | null = null;
let lastPathname: string | undefined;
let latestRequest = 0;
let requestQueue = Promise.resolve();
const listeners = new Set<() => void>();

export function subscribeTrafficStats(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getTrafficStats(): TrafficStats | null {
  return stats;
}

export function getServerTrafficStats(): null {
  return null;
}

function publish(value: TrafficStats | null) {
  if (stats === value) return;
  stats = value;
  listeners.forEach((listener) => listener());
}

function parseStats(payload: unknown): TrafficStats | null {
  if (!payload || typeof payload !== "object") return null;
  const { pageViews, visitors } = payload as Record<string, unknown>;
  if (typeof pageViews !== "number" || !Number.isSafeInteger(pageViews) || pageViews < 0
    || typeof visitors !== "number" || !Number.isSafeInteger(visitors) || visitors < 0) return null;
  return { pageViews, visitors };
}

async function sendPageView(pathname: string, request: number): Promise<void> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  let value: TrafficStats | null = null;
  try {
    const response = await fetch("/api/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname }),
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (response.ok) value = parseStats(await response.json());
  } catch {
    // Analytics failures must not interrupt reading or block later page views.
  } finally {
    window.clearTimeout(timeout);
  }
  if (request === latestRequest) publish(controller.signal.aborted ? null : value);
}

/** Call from the global collector's effect, never from the stats card or during render. */
export function trackPageView(pathname: string, enabled: boolean): void {
  if (!enabled || typeof window === "undefined"
    || window.location.hostname !== "altria.ink" || window.location.protocol !== "https:"
    || pathname === lastPathname) return;

  // Only adjacent calls are deduplicated: returning from B to A is a new page view.
  lastPathname = pathname;
  const request = ++latestRequest;
  publish(null);
  // Let the browser apply the first response's visitor cookie before the next visit.
  requestQueue = requestQueue.then(() => sendPageView(pathname, request));
}
