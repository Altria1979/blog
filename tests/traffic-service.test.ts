import assert from "node:assert/strict";
import test from "node:test";
import { handleTrafficRequest } from "../lib/traffic-service.ts";

function visit(pathname: unknown = "/", headers: HeadersInit = {}, url = "https://altria.ink/api/traffic") {
  return new Request(url, {
    method: "POST",
    headers: { Origin: "https://altria.ink", "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ pathname }),
  });
}

function counterResponse(input: string | URL | Request, payload: unknown = { site_pv: 123, site_uv: 45 }, headers: HeadersInit = {}) {
  const callback = new URL(String(input)).searchParams.get("jsonpCallback");
  assert.match(callback ?? "", /^BusuanziCallback_[A-Za-z0-9_]+$/);
  return new Response(`try{${callback}(${JSON.stringify(payload)});}catch(e){}`, {
    headers: { "Content-Type": "application/json", ...headers },
  });
}

test("the same-origin service parses the real JSONP shape into JSON in one uncached request", async () => {
  let calls = 0;
  const response = await handleTrafficRequest(visit("/en/posts/example", {
    "User-Agent": "Altria test browser", Cookie: "unrelated=private", "X-Forwarded-For": "192.0.2.1",
  }), async (input, init) => {
    calls += 1;
    const url = new URL(String(input));
    assert.equal(url.origin, "https://busuanzi.ibruce.info");
    assert.equal(url.pathname, "/busuanzi");
    assert.deepEqual([...url.searchParams.keys()], ["jsonpCallback"]);
    assert.equal(init?.method, "GET");
    assert.equal(init?.cache, "no-store");
    assert.equal(init?.redirect, "error");
    assert.ok(init?.signal instanceof AbortSignal);
    assert.deepEqual(Object.fromEntries(new Headers(init?.headers)), {
      referer: "https://altria.ink/en/posts/example", "user-agent": "Altria test browser",
    });
    return counterResponse(input, { site_pv: 123, site_uv: 45, page_pv: 99, privateValue: "ignored" });
  });
  assert.equal(calls, 1);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("set-cookie"), null);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
  assert.deepEqual(await response.json(), { pageViews: 123, visitors: 45 });
});

test("the visitor cookie is mapped explicitly and never exposed in the response body", async () => {
  const oldId = "0123456789ABCDEF0123456789ABCDEF";
  const newId = "ABCDEF0123456789ABCDEF0123456789";
  const response = await handleTrafficRequest(visit("/", { Cookie: `secret=private; altria_busuanzi_id=${oldId}; another=hidden` }), async (input, init) => {
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("cookie"), `busuanziId=${oldId}`);
    assert.equal(headers.get("user-agent"), null);
    const response = counterResponse(input);
    response.headers.append("set-cookie", "unrelated=private; Domain=ibruce.info; Path=/");
    response.headers.append("set-cookie", `busuanziId=${newId}; Domain=ibruce.info; Path=/; HttpOnly`);
    return response;
  });
  assert.equal(response.headers.get("set-cookie"), `altria_busuanzi_id=${newId}; Path=/; HttpOnly; Secure; SameSite=Lax`);
  assert.deepEqual(await response.json(), { pageViews: 123, visitors: 45 });
});

test("invalid IDs are neither forwarded nor set, and IDs are never invented", async () => {
  for (const value of ["", "bad=value", "bad%0D%0Ainjection", "quoted\"value", "a".repeat(129)]) {
    const response = await handleTrafficRequest(visit("/", { Cookie: `altria_busuanzi_id=${value}; other=private` }), async (input, init) => {
      assert.equal(new Headers(init?.headers).get("cookie"), null);
      return counterResponse(input, undefined, { "Set-Cookie": `busuanziId=${value}; Path=/` });
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("a safely issued visitor ID survives an upstream body failure without leaking to JSON", async () => {
  const response = await handleTrafficRequest(visit(), async () => new Response("broken response", {
    headers: { "Set-Cookie": "busuanziId=issued_123; Domain=ibruce.info" },
  }));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("set-cookie"), "altria_busuanzi_id=issued_123; Path=/; HttpOnly; Secure; SameSite=Lax");
  assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
});

test("legitimate zero totals and international paths remain valid", async () => {
  const response = await handleTrafficRequest(visit("/ja/posts/%E6%97%85"), async (input, init) => {
    assert.equal(new Headers(init?.headers).get("referer"), "https://altria.ink/ja/posts/%E6%97%85");
    return counterResponse(input, { site_pv: 0, site_uv: 0 });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { pageViews: 0, visitors: 0 });
});

test("untrusted origins, hosts, content types and methods do not contact the counter", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => { calls += 1; throw new Error("must not fetch"); };
  const requests = [
    new Request("https://altria.ink/api/traffic"),
    visit("/", { Origin: "https://evil.example" }),
    visit("/", { Origin: "null" }),
    visit("/", { Origin: "https://altria.ink.evil.example" }),
    visit("/", { Origin: "https://altria.ink:8443" }),
    visit("/", { Host: "preview.vercel.app" }),
    visit("/", {}, "https://preview.vercel.app/api/traffic"),
    visit("/", {}, "http://altria.ink/api/traffic"),
    visit("/", {}, "https://altria.ink:8443/api/traffic"),
    visit("/", { "Content-Type": "text/plain" }),
    new Request("https://altria.ink/api/traffic", { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"pathname":"/"}' }),
  ];
  for (const request of requests) {
    const response = await handleTrafficRequest(request, upstream);
    assert.ok([403, 405, 415].includes(response.status));
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.equal(calls, 0);
});

test("invalid pathnames and malformed JSON are rejected before any upstream side effect", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => { calls += 1; throw new Error("must not fetch"); };
  const invalid = [null, 42, {}, [], "", "posts/a", "%2Fposts", "https://evil.example", "//evil.example", "/%2Fevil.example", "/a?b=1", "/a#anchor", "/a\\b", "/a%5Cb", "/a\nb", "/a%0Ab", "/a\u007Fb", "/a%", "/" + "a".repeat(2_048)];
  for (const pathname of invalid) {
    const response = await handleTrafficRequest(visit(pathname), upstream);
    assert.equal(response.status, 400, JSON.stringify(pathname));
  }
  for (const body of ["bad json", "null", "[]", "{}", '"/"']) {
    const response = await handleTrafficRequest(new Request("https://altria.ink/api/traffic", {
      method: "POST", headers: { Origin: "https://altria.ink", "Content-Type": "application/json" }, body,
    }), upstream);
    assert.equal(response.status, 400);
  }
  assert.equal(calls, 0);
});

test("only the exact callback wrapper and safe numeric counters are accepted", async () => {
  const badBodies = [
    "<html>upstream unavailable</html>", '{"site_pv":1,"site_uv":1}',
    "try{DifferentCallback({\"site_pv\":1,\"site_uv\":1});}catch(e){}",
    "try{CALLBACK({site_pv:1,site_uv:1});}catch(e){}",
    "try{CALLBACK({\"site_pv\":1,\"site_uv\":1});attack();}catch(e){}",
    "try{CALLBACK({\"site_pv\":1,\"site_uv\":1});}catch(e){attack();}",
    "try{CALLBACK({\"site_pv\":1,\"site_uv\":1});}catch(e){};attack();",
  ];
  for (const body of badBodies) {
    const response = await handleTrafficRequest(visit(), async (input) => {
      const callback = new URL(String(input)).searchParams.get("jsonpCallback")!;
      return new Response(body.replace("CALLBACK", callback));
    });
    assert.equal(response.status, 502, body);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
  }
  const badPayloads = [{}, { site_pv: 1 }, ...[-1, 0.5, null, "1", true, Number.MAX_SAFE_INTEGER + 1].flatMap((value) => [
    { site_pv: value, site_uv: 1 }, { site_pv: 1, site_uv: value },
  ])];
  for (const payload of badPayloads) {
    assert.equal((await handleTrafficRequest(visit(), async (input) => counterResponse(input, payload))).status, 502);
  }
});

test("upstream failures do not retry or substitute zeros", async () => {
  for (const kind of ["http", "fetch", "body"]) {
    let calls = 0;
    const response = await handleTrafficRequest(visit(), async (input) => {
      calls += 1;
      if (kind === "fetch") throw new Error("connection failed");
      if (kind === "http") return new Response("failed", { status: 503 });
      const upstream = counterResponse(input);
      upstream.text = async () => { throw new Error("body failed"); };
      return upstream;
    });
    assert.equal(calls, 1);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
  }
});

test("the ten-second timeout covers headers and body while preserving an already issued ID", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const phase of ["headers", "body"]) {
    let calls = 0;
    let signal: AbortSignal | null | undefined;
    let notifyStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => { notifyStarted = resolve; });
    const waitForAbort = () => new Promise<never>((_resolve, reject) => {
      signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
      notifyStarted();
    });
    const pending = handleTrafficRequest(visit(), async (input, init) => {
      calls += 1;
      signal = init?.signal;
      if (phase === "headers") return waitForAbort();
      const upstream = counterResponse(input, undefined, { "Set-Cookie": "busuanziId=issued-before-timeout; Path=/" });
      upstream.text = waitForAbort;
      return upstream;
    });
    await started;
    t.mock.timers.tick(9_999);
    assert.equal(signal?.aborted, false);
    t.mock.timers.tick(1);
    const response = await pending;
    assert.equal(signal?.aborted, true);
    assert.equal(response.status, 504);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), phase === "body" ? "altria_busuanzi_id=issued-before-timeout; Path=/; HttpOnly; Secure; SameSite=Lax" : null);
    assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
    assert.equal(calls, 1);
  }
});

test("upstream diagnostics identify the failure stage without exposing visitor data", async (t) => {
  const warn = t.mock.method(console, "warn", () => {});
  const sensitive = "PRIVATE_VISITOR_COOKIE_BODY_AND_UA";
  for (const stage of ["fetch", "headers", "status", "body", "parse"]) {
    const response = await handleTrafficRequest(visit(`/posts/${sensitive}`, {
      Cookie: `altria_busuanzi_id=${sensitive}`, "User-Agent": sensitive,
    }), async (input) => {
      if (stage === "fetch") throw new TypeError(`fetch failed for ${sensitive}`, { cause: { code: "ECONNRESET", privateValue: sensitive } });
      const upstream = stage === "status"
        ? new Response(sensitive, { status: 503, headers: { "Content-Type": `text/html; private=${sensitive}` } })
        : counterResponse(input, stage === "parse" ? { privateValue: sensitive } : undefined);
      upstream.headers.set("Set-Cookie", `busuanziId=${sensitive}; Path=/`);
      if (stage === "headers") upstream.headers.getSetCookie = () => { throw new TypeError(`headers failed: ${sensitive}`); };
      if (stage === "body") upstream.text = async () => { throw new Error(`body failed: ${sensitive}`); };
      return upstream;
    });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
    const [message, diagnostic] = warn.mock.calls.at(-1)!.arguments as [string, Record<string, unknown>];
    assert.equal(message, "[traffic] upstream failure");
    assert.deepEqual(Object.keys(diagnostic).sort(), ["causeCode", "contentType", "elapsedMs", "errorName", "stage", "upstreamStatus"].sort());
    assert.equal(diagnostic.stage, stage);
    assert.equal(diagnostic.upstreamStatus, stage === "fetch" ? null : stage === "status" ? 503 : 200);
    assert.equal(diagnostic.contentType, stage === "fetch" ? null : stage === "status" ? "text/html" : "application/json");
    assert.equal(diagnostic.causeCode, stage === "fetch" ? "ECONNRESET" : null);
    assert.equal(typeof diagnostic.elapsedMs, "number");
    assert.ok(Number(diagnostic.elapsedMs) >= 0);
    assert.ok(!JSON.stringify(warn.mock.calls.map((call) => call.arguments)).includes(sensitive));
  }
  assert.equal(warn.mock.callCount(), 5);
});

test("diagnostics reject unsafe error labels and stay silent for success or rejected input", async (t) => {
  const warn = t.mock.method(console, "warn", () => {});
  const error = new Error("cookie=private", { cause: { code: "ECONNRESET\nCookie=private" } });
  error.name = "Error https://private.example/visitor";
  const failed = await handleTrafficRequest(visit(), async () => { throw error; });
  assert.equal(failed.status, 502);
  const diagnostic = warn.mock.calls[0].arguments[1] as Record<string, unknown>;
  assert.equal(diagnostic.errorName, null);
  assert.equal(diagnostic.causeCode, null);
  const malformedMime = await handleTrafficRequest(visit(), async () => new Response("private body", {
    status: 503, headers: { "Content-Type": "cookie=private" },
  }));
  assert.equal(malformedMime.status, 502);
  assert.equal((warn.mock.calls[1].arguments[1] as Record<string, unknown>).contentType, "invalid");
  const successful = await handleTrafficRequest(visit(), async (input) => counterResponse(input));
  const rejected = await handleTrafficRequest(visit("//evil.example"), async () => { throw new Error("must not fetch"); });
  assert.equal(successful.status, 200);
  assert.equal(rejected.status, 400);
  assert.equal(warn.mock.callCount(), 2);
  assert.ok(!JSON.stringify(warn.mock.calls.map((call) => call.arguments)).includes("private"));
});
