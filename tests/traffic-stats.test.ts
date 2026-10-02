import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import type * as TrafficModule from "../lib/traffic-stats.ts";

let moduleNumber = 0;

async function loadModule(): Promise<typeof TrafficModule> {
  const url = new URL("../lib/traffic-stats.js", import.meta.url);
  url.searchParams.set("test", String(++moduleNumber));
  return import(url.href);
}

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

type FakeResponse = { ok: boolean; json: () => Promise<unknown> };
type FakeRequest = {
  url: unknown;
  options: RequestInit;
  cookieAtStart: string | undefined;
  resolve: (response: FakeResponse) => void;
  reject: (error: Error) => void;
};

async function browserFixture(t: TestContext) {
  let now = 0;
  let timerNumber = 0;
  let visitorCookie: string | undefined;
  const timers = new Map<number, { at: number; callback: () => void }>();
  const requests: FakeRequest[] = [];
  const location = { hostname: "altria.ink", protocol: "https:" };
  const browser = {
    location,
    setTimeout(callback: () => void, delay: number) {
      const id = ++timerNumber;
      timers.set(id, { at: now + delay, callback });
      return id;
    },
    clearTimeout(id: number) { timers.delete(id); },
  };
  const fetch = (url: unknown, options: RequestInit) => new Promise<FakeResponse>((resolve, reject) => {
    requests.push({ url, options, cookieAtStart: visitorCookie, resolve, reject });
    options.signal?.addEventListener("abort", () => reject(new Error("Aborted")), { once: true });
  });
  for (const [key, value] of Object.entries({ window: browser, fetch })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  const traffic = await loadModule();
  return {
    traffic, requests, location, timers,
    respond(index: number, payload: unknown, cookie?: string) {
      if (cookie) visitorCookie = cookie;
      requests[index].resolve({ ok: true, json: async () => payload });
      return flush();
    },
    async advance(milliseconds: number) {
      const end = now + milliseconds;
      while (true) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
      }
      now = end;
      await flush();
    },
  };
}

test("SSR imports have a stable empty snapshot and never attempt collection", async () => {
  const traffic = await loadModule();
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(traffic.getServerTrafficStats(), null);
  assert.doesNotThrow(() => traffic.trackPageView("/", true));
  await flush();
  assert.equal(traffic.getTrafficStats(), null);
});

test("collection requires enabled production configuration and the exact HTTPS host", async (t) => {
  const { traffic, requests, location } = await browserFixture(t);
  await flush();
  assert.equal(requests.length, 0, "importing must not issue a request");
  traffic.trackPageView("/", false);
  for (const hostname of ["localhost", "127.0.0.1", "altria-preview.vercel.app", "www.altria.ink", "altria.ink.example.com"]) {
    location.hostname = hostname;
    traffic.trackPageView("/", true);
  }
  location.hostname = "altria.ink";
  location.protocol = "http:";
  traffic.trackPageView("/", true);
  await flush();
  assert.equal(requests.length, 0);
  location.protocol = "https:";
  traffic.trackPageView("/", true);
  await flush();
  assert.equal(requests.length, 1, "disabled attempts do not suppress the first real visit");
  assert.equal(requests[0].url, "/api/traffic");
  assert.equal(requests[0].options.method, "POST");
  assert.deepEqual(requests[0].options.headers, { "Content-Type": "application/json" });
  assert.equal(requests[0].options.body, JSON.stringify({ pathname: "/" }));
  assert.equal(requests[0].options.credentials, "same-origin");
  assert.equal(requests[0].options.signal?.aborted, false);
});

test("duplicate effects and card remounts do not count, but A to B to A does", async (t) => {
  const { traffic, requests, respond } = await browserFixture(t);
  traffic.trackPageView("/", true);
  traffic.trackPageView("/", true);
  const unsubscribe = traffic.subscribeTrafficStats(() => {});
  traffic.getTrafficStats();
  unsubscribe();
  traffic.subscribeTrafficStats(() => {})();
  traffic.trackPageView("/", true);
  await flush();
  assert.equal(requests.length, 1);
  traffic.trackPageView("/posts/example", true);
  traffic.trackPageView("/posts/example", true);
  traffic.trackPageView("/", true);
  traffic.trackPageView("/en", true);
  traffic.trackPageView("/ja", true);
  for (let index = 0; index < 5; index += 1) {
    assert.equal(requests.length, index + 1);
    await respond(index, { pageViews: 100 + index, visitors: 1 });
  }
  assert.deepEqual(requests.map(({ options }) => JSON.parse(String(options.body)).pathname),
    ["/", "/posts/example", "/", "/en", "/ja"]);
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 104, visitors: 1 });
});

test("a fresh document counts the same initial pathname again after a reload", async (t) => {
  const { traffic, requests, respond } = await browserFixture(t);
  traffic.trackPageView("/", true);
  await flush();
  await respond(0, { pageViews: 100, visitors: 50 }, "visitor-1");
  const refreshedTraffic = await loadModule();
  assert.equal(refreshedTraffic.getTrafficStats(), null);
  refreshedTraffic.trackPageView("/", true);
  await flush();
  assert.equal(requests.length, 2);
  assert.equal(requests[1].cookieAtStart, "visitor-1");
  await respond(1, { pageViews: 101, visitors: 50 });
  assert.deepEqual(refreshedTraffic.getTrafficStats(), { pageViews: 101, visitors: 50 });
});

test("valid totals notify subscribers, preserve snapshots, and clear while loading", async (t) => {
  const { traffic, respond, timers } = await browserFixture(t);
  let updates = 0;
  const unsubscribe = traffic.subscribeTrafficStats(() => { updates += 1; });
  traffic.trackPageView("/", true);
  await flush();
  assert.equal(traffic.getTrafficStats(), null);
  await respond(0, { pageViews: 1_234, visitors: 56 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 1_234, visitors: 56 });
  assert.equal(traffic.getTrafficStats(), traffic.getTrafficStats());
  assert.equal(traffic.getServerTrafficStats(), null);
  assert.equal(updates, 1);
  assert.equal(timers.size, 0);
  traffic.trackPageView("/posts/example", true);
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(updates, 2);
  unsubscribe();
  await flush();
  await respond(1, { pageViews: 0, visitors: 0 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 0, visitors: 0 });
  assert.equal(updates, 2);
});

test("malformed, negative, fractional and unsafe counters are unavailable, never coerced", async (t) => {
  const { traffic, respond } = await browserFixture(t);
  const payloads = [null, undefined, "bad", {}, [], { pageViews: 1 },
    { site_pv: 1, site_uv: 1 },
    ...[-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "42", true, null].flatMap((value) => [
      { pageViews: value, visitors: 1 }, { pageViews: 1, visitors: value },
    ])];
  for (const [index, payload] of payloads.entries()) {
    traffic.trackPageView(`/invalid-${index}`, true);
    await flush();
    await respond(index, payload);
    assert.equal(traffic.getTrafficStats(), null);
  }
  traffic.trackPageView("/largest", true);
  await flush();
  await respond(payloads.length, { pageViews: Number.MAX_SAFE_INTEGER, visitors: 0 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: Number.MAX_SAFE_INTEGER, visitors: 0 });
});

test("country rankings accept no data, one country and the top three without another request", async (t) => {
  const { traffic, requests, respond } = await browserFixture(t);
  const rankings = [[], [{ countryCode: "CN", pageViews: 12 }], [
    { countryCode: "CN", pageViews: 12 },
    { countryCode: "JP", pageViews: 4 },
    { countryCode: "US", pageViews: 4 },
  ]];
  for (const [index, topCountries] of rankings.entries()) {
    traffic.trackPageView(`/rankings-${index}`, true);
    await flush();
    await respond(index, { pageViews: 20, visitors: 5, topCountries });
    assert.deepEqual(traffic.getTrafficStats(), { pageViews: 20, visitors: 5, topCountries });
    assert.equal(requests.length, index + 1);
  }
});

test("missing or malformed country rankings preserve valid totals and omit the ranking", async (t) => {
  const { traffic, respond } = await browserFixture(t);
  const valid = { countryCode: "CN", pageViews: 1 };
  const rankings = [undefined, null, {}, "bad", [null], [[]], [{}],
    [valid, valid],
    ["CN", "JP", "US", "DE"].map((countryCode) => ({ countryCode, pageViews: 1 })),
    ...["cn", "C", "CHN", "XX", "ZZ", " CN", 1, null].map((countryCode) => [{ countryCode, pageViews: 1 }]),
    ...[0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "42", null].map((pageViews) => [{ countryCode: "CN", pageViews }]),
  ];
  for (const [index, topCountries] of rankings.entries()) {
    traffic.trackPageView(`/malformed-rankings-${index}`, true);
    await flush();
    await respond(index, { pageViews: 20, visitors: 5, ...(topCountries === undefined ? {} : { topCountries }) });
    assert.deepEqual(traffic.getTrafficStats(), { pageViews: 20, visitors: 5 });
    assert.equal(Object.hasOwn(traffic.getTrafficStats()!, "topCountries"), false);
  }
});

test("country rankings expose only aggregate country codes and page views", async (t) => {
  const { traffic, respond } = await browserFixture(t);
  traffic.trackPageView("/country-privacy", true);
  await flush();
  await respond(0, {
    pageViews: 20,
    visitors: 5,
    ip: "203.0.113.1",
    visitorId: "private-visitor-id",
    topCountries: [{ countryCode: "CN", pageViews: 12, ip: "203.0.113.1", visitorId: "private-visitor-id", visitors: 4 }],
  });
  assert.deepEqual(traffic.getTrafficStats(), {
    pageViews: 20,
    visitors: 5,
    topCountries: [{ countryCode: "CN", pageViews: 12 }],
  });
});

test("visits wait for previous responses so the next request carries the visitor cookie", async (t) => {
  const { traffic, requests, respond } = await browserFixture(t);
  traffic.trackPageView("/a", true);
  traffic.trackPageView("/b", true);
  traffic.trackPageView("/a", true);
  await flush();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].cookieAtStart, undefined);
  assert.equal(requests[0].options.signal?.aborted, false, "route changes must not cancel counted visits");
  await respond(0, { pageViews: 1, visitors: 1 }, "visitor-1");
  assert.equal(traffic.getTrafficStats(), null, "the old route cannot replace the newest loading state");
  assert.equal(requests.length, 2);
  assert.equal(requests[1].cookieAtStart, "visitor-1");
  await respond(1, { pageViews: 2, visitors: 1 });
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(requests.length, 3);
  assert.equal(requests[2].cookieAtStart, "visitor-1");
  await respond(2, { pageViews: 3, visitors: 1 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 3, visitors: 1 });
});

test("network, HTTP and invalid JSON errors leave no fake totals and the queue continues", async (t) => {
  const { traffic, requests, respond, timers } = await browserFixture(t);
  for (const pathname of ["/network", "/http", "/json", "/success"]) traffic.trackPageView(pathname, true);
  await flush();
  requests[0].reject(new Error("Network unavailable"));
  await flush();
  assert.equal(requests.length, 2);
  assert.equal(traffic.getTrafficStats(), null);
  requests[1].resolve({ ok: false, json: async () => { assert.fail("non-2xx body must not be parsed"); } });
  await flush();
  assert.equal(requests.length, 3);
  assert.equal(traffic.getTrafficStats(), null);
  requests[2].resolve({ ok: true, json: async () => { throw new SyntaxError("Invalid JSON"); } });
  await flush();
  assert.equal(requests.length, 4);
  assert.equal(traffic.getTrafficStats(), null);
  await respond(3, { pageViews: 10, visitors: 2 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 10, visitors: 2 });
  assert.equal(timers.size, 0);
});

test("a response arriving after five seconds still publishes totals without another request", async (t) => {
  const { traffic, requests, respond, advance, timers } = await browserFixture(t);
  traffic.trackPageView("/slow-success", true);
  await flush();
  await advance(5_000);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.signal?.aborted, false);
  assert.equal(traffic.getTrafficStats(), null);
  await respond(0, { pageViews: 123, visitors: 45 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 123, visitors: 45 });
  assert.equal(timers.size, 0);
  await advance(15_000);
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 123, visitors: 45 });
  assert.equal(requests.length, 1);
});

test("15-second timeouts abort once, ignore late responses and do not retry", async (t) => {
  const { traffic, requests, respond, advance, timers } = await browserFixture(t);
  traffic.trackPageView("/timeout", true);
  await flush();
  await advance(14_999);
  assert.equal(requests[0].options.signal?.aborted, false);
  await advance(1);
  assert.equal(requests[0].options.signal?.aborted, true);
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(timers.size, 0);
  await respond(0, { pageViews: 999, visitors: 999 });
  assert.equal(traffic.getTrafficStats(), null);
  traffic.trackPageView("/timeout", true);
  await flush();
  await advance(60_000);
  assert.equal(requests.length, 1);
});

test("queued visits get their own deadline after a timeout and cannot receive old totals", async (t) => {
  const { traffic, requests, respond, advance } = await browserFixture(t);
  traffic.trackPageView("/a", true);
  traffic.trackPageView("/b", true);
  await flush();
  assert.equal(requests.length, 1);
  await advance(15_000);
  assert.equal(requests[0].options.signal?.aborted, true);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].options.signal?.aborted, false);
  await advance(14_999);
  assert.equal(requests[1].options.signal?.aborted, false, "waiting in the queue does not spend the deadline");
  await respond(1, { pageViews: 2, visitors: 1 });
  await respond(0, { pageViews: 1, visitors: 1 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 2, visitors: 1 });
  assert.equal(requests.length, 2);
});
