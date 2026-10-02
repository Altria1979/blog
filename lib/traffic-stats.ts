export type TrafficStats = {
  pageViews: number;
  visitors: number;
};

let stats: TrafficStats | null = null;
let lastPathname: string | undefined;
let latestRequest = 0;
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
  const { site_pv: pageViews, site_uv: visitors } = payload as Record<string, unknown>;
  if (typeof pageViews !== "number" || !Number.isSafeInteger(pageViews) || pageViews < 0
    || typeof visitors !== "number" || !Number.isSafeInteger(visitors) || visitors < 0) return null;
  return { pageViews, visitors };
}

/** Call from the global collector's effect, never from the stats card or during render. */
export function trackPageView(pathname: string, enabled: boolean): void {
  if (!enabled || typeof window === "undefined" || typeof document === "undefined"
    || window.location.hostname !== "altria.ink" || window.location.protocol !== "https:"
    || pathname === lastPathname) return;

  // Only adjacent calls are deduplicated: returning from B to A is a new page view.
  lastPathname = pathname;
  const request = ++latestRequest;
  publish(null);

  const callbacks = window as unknown as Record<string, ((payload: unknown) => void) | undefined>;
  const callbackName = `__altriaTraffic_${Date.now()}_${request}`;
  const script = document.createElement("script");
  script.async = true;
  script.referrerPolicy = "no-referrer-when-downgrade";
  script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callbackName}`;

  let settled = false;
  let callbackRemoved = false;
  let retirementTimeout: number | undefined;
  const removeCallback = () => {
    if (callbackRemoved) return;
    callbackRemoved = true;
    if (retirementTimeout !== undefined) window.clearTimeout(retirementTimeout);
    delete callbacks[callbackName];
    script.onload = null;
    script.onerror = null;
  };
  const finish = (value: TrafficStats | null) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timeout);
    // Removing a script does not always cancel code already queued by the browser.
    // Keep a harmless callback until it loads, with bounded cleanup if it never does.
    callbacks[callbackName] = () => {};
    script.remove();
    retirementTimeout = window.setTimeout(removeCallback, 60_000);
    if (request === latestRequest) publish(value);
  };

  callbacks[callbackName] = (payload) => finish(parseStats(payload));
  script.onload = () => {
    finish(null); // A loaded script without its JSONP callback is a failed response.
    removeCallback();
  };
  script.onerror = () => {
    finish(null);
    removeCallback();
  };
  const timeout = window.setTimeout(() => finish(null), 15_000);
  try {
    document.head.appendChild(script);
  } catch {
    finish(null);
    removeCallback();
  }
}
