import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import type * as TrafficModule from "../lib/traffic-stats.ts";

let moduleNumber = 0;

async function loadModule(): Promise<typeof TrafficModule> {
  const url = new URL("../lib/traffic-stats.js", import.meta.url);
  url.searchParams.set("test", String(++moduleNumber));
  return import(url.href);
}

class FakeScript {
  async = false;
  referrerPolicy = "";
  src = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  removed = false;
  remove() { this.removed = true; }
}

async function browserFixture(t: TestContext) {
  let now = 0;
  let timerNumber = 0;
  const timers = new Map<number, { at: number; callback: () => void }>();
  const scripts: FakeScript[] = [];
  const location = { hostname: "altria.ink", protocol: "https:" };
  const browser: Record<string, unknown> = {
    location,
    setTimeout(callback: () => void, delay: number) {
      const id = ++timerNumber;
      timers.set(id, { at: now + delay, callback });
      return id;
    },
    clearTimeout(id: number) { timers.delete(id); },
  };
  const document = {
    createElement(tag: string) {
      assert.equal(tag, "script");
      return new FakeScript();
    },
    head: { appendChild(script: FakeScript) { scripts.push(script); } },
  };
  for (const [key, value] of Object.entries({ window: browser, document })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  const traffic = await loadModule();
  const callbackName = (script: FakeScript) => {
    const name = new URL(script.src).searchParams.get("jsonpCallback");
    assert.ok(name);
    return name;
  };
  return {
    traffic, scripts, browser, location, document, timers, callbackName,
    respond(script: FakeScript, payload: unknown) {
      const callback = browser[callbackName(script)];
      assert.equal(typeof callback, "function");
      (callback as (payload: unknown) => void)(payload);
    },
    advance(milliseconds: number) {
      const end = now + milliseconds;
      while (true) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
      }
      now = end;
    },
  };
}

test("SSR imports have a stable empty snapshot and never attempt collection", async () => {
  const traffic = await loadModule();
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(traffic.getServerTrafficStats(), null);
  assert.doesNotThrow(() => traffic.trackPageView("/", true));
  assert.equal(traffic.getTrafficStats(), null);
});

test("collection requires enabled production configuration and the exact HTTPS host", async (t) => {
  const fixture = await browserFixture(t);
  const { traffic, scripts, location } = fixture;
  assert.equal(scripts.length, 0, "importing must not issue a request");
  traffic.trackPageView("/", false);
  for (const hostname of ["localhost", "127.0.0.1", "altria-preview.vercel.app", "www.altria.ink", "altria.ink.example.com"]) {
    location.hostname = hostname;
    traffic.trackPageView("/", true);
  }
  location.hostname = "altria.ink";
  location.protocol = "http:";
  traffic.trackPageView("/", true);
  assert.equal(scripts.length, 0);
  location.protocol = "https:";
  traffic.trackPageView("/", true);
  assert.equal(scripts.length, 1, "disabled attempts do not suppress the first real visit");
  const request = new URL(scripts[0].src);
  assert.equal(request.origin, "https://busuanzi.ibruce.info");
  assert.equal(request.pathname, "/busuanzi");
  assert.deepEqual([...request.searchParams.keys()], ["jsonpCallback"]);
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].referrerPolicy, "no-referrer-when-downgrade");
});

test("duplicate effects and card remounts do not count, but A to B to A does", async (t) => {
  const { traffic, scripts } = await browserFixture(t);
  traffic.trackPageView("/", true);
  traffic.trackPageView("/", true);
  const unsubscribe = traffic.subscribeTrafficStats(() => {});
  traffic.getTrafficStats();
  unsubscribe();
  traffic.subscribeTrafficStats(() => {})();
  traffic.trackPageView("/", true);
  assert.equal(scripts.length, 1);
  traffic.trackPageView("/posts/example", true);
  traffic.trackPageView("/posts/example", true);
  traffic.trackPageView("/", true);
  traffic.trackPageView("/en", true);
  traffic.trackPageView("/ja", true);
  assert.equal(scripts.length, 5);
  assert.equal(new Set(scripts.map((script) => script.src)).size, scripts.length);
});

test("a fresh document counts the same initial pathname again after a reload", async (t) => {
  const { traffic, scripts, respond } = await browserFixture(t);
  traffic.trackPageView("/", true);
  respond(scripts[0], { site_pv: 100, site_uv: 50 });
  scripts[0].onload?.();
  const refreshedTraffic = await loadModule();
  assert.equal(refreshedTraffic.getTrafficStats(), null);
  refreshedTraffic.trackPageView("/", true);
  assert.equal(scripts.length, 2);
  respond(scripts[1], { site_pv: 101, site_uv: 50 });
  assert.deepEqual(refreshedTraffic.getTrafficStats(), { pageViews: 101, visitors: 50 });
});

test("valid totals notify subscribers, preserve snapshots, and clear while loading", async (t) => {
  const { traffic, scripts, respond, timers, browser, callbackName } = await browserFixture(t);
  let updates = 0;
  const unsubscribe = traffic.subscribeTrafficStats(() => { updates += 1; });
  traffic.trackPageView("/", true);
  assert.equal(traffic.getTrafficStats(), null);
  respond(scripts[0], { site_pv: 1_234, site_uv: 56, page_pv: 9 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 1_234, visitors: 56 });
  assert.equal(traffic.getTrafficStats(), traffic.getTrafficStats());
  assert.equal(traffic.getServerTrafficStats(), null);
  assert.equal(updates, 1);
  assert.equal(scripts[0].removed, true);
  scripts[0].onload?.();
  assert.equal(timers.size, 0);
  assert.equal(browser[callbackName(scripts[0])], undefined);
  traffic.trackPageView("/posts/example", true);
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(updates, 2);
  unsubscribe();
  respond(scripts[1], { site_pv: 0, site_uv: 0 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 0, visitors: 0 });
  assert.equal(updates, 2);
});

test("malformed, negative, fractional and unsafe counters are unavailable, never coerced", async (t) => {
  const { traffic, scripts, respond } = await browserFixture(t);
  const payloads = [null, undefined, "bad", {}, [], { site_pv: 1 },
    ...[-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "42", true, null].flatMap((value) => [
      { site_pv: value, site_uv: 1 }, { site_pv: 1, site_uv: value },
    ])];
  for (const [index, payload] of payloads.entries()) {
    traffic.trackPageView(`/invalid-${index}`, true);
    respond(scripts[index], payload);
    assert.equal(traffic.getTrafficStats(), null);
    scripts[index].onload?.();
  }
  traffic.trackPageView("/largest", true);
  respond(scripts.at(-1)!, { site_pv: Number.MAX_SAFE_INTEGER, site_uv: 0 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: Number.MAX_SAFE_INTEGER, visitors: 0 });
});

test("network errors, missing callbacks and script insertion failure leave no fake totals", async (t) => {
  const { traffic, scripts, timers, browser, callbackName, document } = await browserFixture(t);
  traffic.trackPageView("/error", true);
  scripts[0].onerror?.();
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(scripts[0].removed, true);
  assert.equal(browser[callbackName(scripts[0])], undefined);
  assert.equal(timers.size, 0);
  traffic.trackPageView("/no-callback", true);
  scripts[1].onload?.();
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(scripts[1].removed, true);
  assert.equal(browser[callbackName(scripts[1])], undefined);
  assert.equal(timers.size, 0);
  document.head.appendChild = () => { throw new Error("Blocked script"); };
  assert.doesNotThrow(() => traffic.trackPageView("/blocked", true));
  assert.equal(traffic.getTrafficStats(), null);
  assert.equal(timers.size, 0);
  assert.deepEqual(Object.keys(browser).filter((key) => key.startsWith("__altriaTraffic_")), []);
});

test("a response arriving after five seconds still publishes totals without another request", async (t) => {
  const { traffic, scripts, respond, advance } = await browserFixture(t);
  traffic.trackPageView("/slow-success", true);
  advance(5_000);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].removed, false);
  assert.equal(traffic.getTrafficStats(), null);
  respond(scripts[0], { site_pv: 123, site_uv: 45 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 123, visitors: 45 });
  scripts[0].onload?.();
  advance(15_000);
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 123, visitors: 45 });
  assert.equal(scripts.length, 1);
});

test("timeouts absorb late callbacks and clean up without retrying", async (t) => {
  const { traffic, scripts, respond, advance, timers, browser, callbackName } = await browserFixture(t);
  traffic.trackPageView("/slow", true);
  advance(14_999);
  assert.equal(scripts[0].removed, false);
  advance(1);
  assert.equal(scripts[0].removed, true);
  assert.equal(traffic.getTrafficStats(), null);
  assert.doesNotThrow(() => respond(scripts[0], { site_pv: 999, site_uv: 999 }));
  assert.equal(traffic.getTrafficStats(), null);
  traffic.trackPageView("/slow", true);
  assert.equal(scripts.length, 1);
  advance(60_000);
  assert.equal(browser[callbackName(scripts[0])], undefined);
  assert.equal(timers.size, 0);
  assert.equal(scripts.length, 1);
});

test("older responses and failures cannot replace the most recent route's totals", async (t) => {
  const { traffic, scripts, respond, advance } = await browserFixture(t);
  traffic.trackPageView("/a", true);
  traffic.trackPageView("/b", true);
  respond(scripts[0], { site_pv: 100, site_uv: 50 });
  assert.equal(traffic.getTrafficStats(), null, "old data cannot replace a loading state");
  respond(scripts[1], { site_pv: 101, site_uv: 51 });
  scripts[0].onerror?.();
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 101, visitors: 51 });
  traffic.trackPageView("/c", true);
  traffic.trackPageView("/d", true);
  respond(scripts[3], { site_pv: 103, site_uv: 53 });
  advance(15_000);
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 103, visitors: 53 });
  respond(scripts[2], { site_pv: 102, site_uv: 52 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 103, visitors: 53 });
  traffic.trackPageView("/e", true);
  traffic.trackPageView("/f", true);
  respond(scripts[5], { site_pv: 105, site_uv: 55 });
  respond(scripts[4], { site_pv: 104, site_uv: 54 });
  assert.deepEqual(traffic.getTrafficStats(), { pageViews: 105, visitors: 55 });
});
