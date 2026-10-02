import assert from "node:assert/strict";
import test from "node:test";
import { handleTrafficRequest } from "../lib/traffic-service.ts";

const configuration = { url: "https://project.supabase.co", secretKey: "sb_secret_test_private_key" };
const existingId = "120e8400-e29b-41d4-a716-446655440000";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function handle(request: Request, fetcher: typeof fetch, config: Parameters<typeof handleTrafficRequest>[2] = configuration) {
  return handleTrafficRequest(request, fetcher, config);
}

function visit(pathname: unknown = "/", headers: HeadersInit = {}, url = "https://altria.ink/api/traffic") {
  return new Request(url, {
    method: "POST",
    headers: { Origin: "https://altria.ink", "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ pathname }),
  });
}

function counterResponse(payload: unknown = { pageViews: 123, visitors: 45 }) {
  return Response.json(payload);
}

function responseVisitor(response: Response) {
  const cookie = response.headers.get("set-cookie") ?? "";
  const match = cookie.match(/^altria_visitor_id=([^;]+); Path=\/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000$/);
  assert.ok(match, cookie);
  assert.match(match[1], uuidPattern);
  return match[1];
}

function legacyKey(role: string) {
  return `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
}

test("one authorized visit sends one uncached RPC using only server-owned headers and identity", async () => {
  let calls = 0;
  let recordedId = "";
  const response = await handle(visit("/en/posts/example", {
    "User-Agent": "private browser", Cookie: "unrelated=private", "X-Forwarded-For": "192.0.2.1", Authorization: "private browser token",
  }), async (input, init) => {
    calls += 1;
    assert.equal(String(input), "https://project.supabase.co/rest/v1/rpc/record_blog_page_view");
    assert.equal(init?.method, "POST");
    assert.equal(init?.cache, "no-store");
    assert.equal(init?.redirect, "error");
    assert.ok(init?.signal instanceof AbortSignal);
    assert.deepEqual(Object.fromEntries(new Headers(init?.headers)), {
      accept: "application/json", apikey: configuration.secretKey, "content-type": "application/json",
    });
    const payload = JSON.parse(String(init?.body));
    assert.deepEqual(Object.keys(payload), ["p_visitor_id"]);
    assert.match(payload.p_visitor_id, uuidPattern);
    recordedId = payload.p_visitor_id;
    const upstream = counterResponse({ pageViews: 123, visitors: 45, privateValue: "ignored" });
    upstream.headers.set("Set-Cookie", "untrusted=private; Domain=supabase.co");
    return upstream;
  });
  assert.equal(calls, 1);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
  assert.equal(responseVisitor(response), recordedId);
  assert.deepEqual(await response.json(), { pageViews: 123, visitors: 45 });
});

test("a valid existing UUID is reused and renewed without exposing it in response JSON", async () => {
  const response = await handle(visit("/", { Cookie: `secret=private; altria_visitor_id=${existingId.toUpperCase()}; another=hidden` }), async (_input, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)), { p_visitor_id: existingId });
    assert.equal(new Headers(init?.headers).get("cookie"), null);
    return counterResponse();
  });
  assert.equal(responseVisitor(response), existingId);
  assert.deepEqual(await response.json(), { pageViews: 123, visitors: 45 });
});

test("malformed visitor IDs receive a new UUID, ignoring old cookies and client body IDs", async () => {
  const generated = new Set<string>();
  for (const value of ["", "bad=value", "bad%0D%0Ainjection", "quoted\"value", "a".repeat(129), "0123456789ABCDEF0123456789ABCDEF"]) {
    let recordedId = "";
    const request = new Request("https://altria.ink/api/traffic", {
      method: "POST",
      headers: { Origin: "https://altria.ink", "Content-Type": "application/json", Cookie: `altria_visitor_id=${value}; altria_busuanzi_id=old-counter-id` },
      body: JSON.stringify({ pathname: "/", p_visitor_id: existingId }),
    });
    const response = await handle(request, async (_input, init) => {
      recordedId = JSON.parse(String(init?.body)).p_visitor_id;
      assert.match(recordedId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      assert.notEqual(recordedId, existingId);
      return counterResponse();
    });
    assert.equal(response.status, 200);
    assert.equal(responseVisitor(response), recordedId);
    generated.add(recordedId);
  }
  assert.equal(generated.size, 6);
});

test("legacy service-role JWTs use both authentication headers while new secret keys take precedence", async () => {
  const serviceRoleKey = legacyKey("service_role");
  for (const secretKey of [undefined, configuration.secretKey]) {
    const response = await handle(visit(), async (_input, init) => {
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("apikey"), secretKey ?? serviceRoleKey);
      assert.equal(headers.get("authorization"), secretKey ? null : `Bearer ${serviceRoleKey}`);
      return counterResponse();
    }, { url: configuration.url + "/", secretKey, serviceRoleKey });
    assert.equal(response.status, 200);
  }
});

test("missing or unsafe server configuration fails with 503 without contacting a service", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => { calls += 1; throw new Error("must not fetch"); };
  const invalid = [
    {}, { url: configuration.url }, { secretKey: configuration.secretKey },
    ...["sb_publishable_public", "anon", "sb_secret_", "sb_secret_key\ninvalid", legacyKey("anon")].map((secretKey) => ({ ...configuration, secretKey })),
    ...["sb_publishable_public", "sb_secret_wrong_variable", "not-a-jwt", legacyKey("anon"), legacyKey("authenticated")].map((serviceRoleKey) => ({ url: configuration.url, serviceRoleKey })),
    ...["", "not-a-url", "http://project.supabase.co", "https://user:password@project.supabase.co", "https://project.supabase.co/other", "https://project.supabase.co/?private=value", "https://project.supabase.co/#hash"].map((url) => ({ ...configuration, url })),
    { ...configuration, secretKey: "sb_publishable_public", serviceRoleKey: legacyKey("service_role") },
  ];
  for (const config of invalid) {
    const response = await handle(visit(), upstream, config);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
  }
  assert.equal(calls, 0);
});

test("legitimate zero totals and international paths remain valid", async () => {
  const response = await handle(visit("/ja/posts/%E6%97%85"), async () => counterResponse({ pageViews: 0, visitors: 0 }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { pageViews: 0, visitors: 0 });
});

test("untrusted origins, hosts, content types and methods do not contact the database", async () => {
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
    const response = await handle(request, upstream);
    assert.ok([403, 405, 415].includes(response.status));
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
  }
  assert.equal(calls, 0);
});

test("invalid pathnames and malformed JSON are rejected before any database side effect", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => { calls += 1; throw new Error("must not fetch"); };
  const invalid = [null, 42, {}, [], "", "posts/a", "%2Fposts", "https://evil.example", "//evil.example", "/%2Fevil.example", "/a?b=1", "/a#anchor", "/a\\b", "/a%5Cb", "/a\nb", "/a%0Ab", "/a\u007Fb", "/a%", "/" + "a".repeat(2_048)];
  for (const pathname of invalid) {
    const response = await handle(visit(pathname), upstream);
    assert.equal(response.status, 400, JSON.stringify(pathname));
  }
  for (const body of ["bad json", "null", "[]", "{}", '"/"']) {
    const response = await handle(new Request("https://altria.ink/api/traffic", {
      method: "POST", headers: { Origin: "https://altria.ink", "Content-Type": "application/json" }, body,
    }), upstream);
    assert.equal(response.status, 400);
  }
  assert.equal(calls, 0);
});

test("only one JSON object containing safe numeric counters is accepted", async (t) => {
  t.mock.method(console, "warn", () => {});
  for (const body of ["<html>unavailable</html>", "not json", "try{callback({});}catch(e){}", '{"pageViews":1,"visitors":1};attack()']) {
    const response = await handle(visit(), async () => new Response(body));
    assert.equal(response.status, 502, body);
    assert.equal(response.headers.get("cache-control"), "no-store");
    responseVisitor(response);
    assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
  }
  const badPayloads = [null, [], [{ pageViews: 1, visitors: 1 }], 1, "stats", {}, { pageViews: 1 }, ...[-1, 0.5, null, "1", true, Number.MAX_SAFE_INTEGER + 1].flatMap((value) => [
    { pageViews: value, visitors: 1 }, { pageViews: 1, visitors: value },
  ])];
  for (const payload of badPayloads) assert.equal((await handle(visit(), async () => counterResponse(payload))).status, 502);
  const response = await handle(visit(), async () => counterResponse({ pageViews: Number.MAX_SAFE_INTEGER, visitors: Number.MAX_SAFE_INTEGER }));
  assert.equal(response.status, 200);
});

test("database failures retain the submitted identity without retrying or substituting zeros", async (t) => {
  t.mock.method(console, "warn", () => {});
  for (const kind of ["http", "fetch", "body", "parse"]) {
    for (const cookie of ["", `altria_visitor_id=${existingId}`]) {
      let calls = 0;
      let recordedId = "";
      const response = await handle(visit("/", { Cookie: cookie }), async (_input, init) => {
        calls += 1;
        recordedId = JSON.parse(String(init?.body)).p_visitor_id;
        if (kind === "fetch") throw new Error("connection failed");
        if (kind === "http") return new Response("failed", { status: 503 });
        if (kind === "parse") return new Response("broken response");
        const upstream = counterResponse();
        upstream.text = async () => { throw new Error("body failed"); };
        return upstream;
      });
      assert.equal(calls, 1);
      assert.equal(response.status, 502);
      assert.equal(responseVisitor(response), recordedId);
      if (cookie) assert.equal(recordedId, existingId);
      assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
    }
  }
});

test("the ten-second deadline covers headers and body while preserving visitor identity", async (t) => {
  t.mock.method(console, "warn", () => {});
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const phase of ["headers", "body"]) {
    let calls = 0;
    let recordedId = "";
    let signal: AbortSignal | null | undefined;
    let notifyStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => { notifyStarted = resolve; });
    const waitForAbort = () => new Promise<never>((_resolve, reject) => {
      signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
      notifyStarted();
    });
    const pending = handle(visit(), async (_input, init) => {
      calls += 1;
      recordedId = JSON.parse(String(init?.body)).p_visitor_id;
      signal = init?.signal;
      if (phase === "headers") return waitForAbort();
      const upstream = counterResponse();
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
    assert.equal(responseVisitor(response), recordedId);
    assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
    assert.equal(calls, 1);
  }
});

test("diagnostics identify failures without exposing database keys, URLs, visitor IDs or bodies", async (t) => {
  const warn = t.mock.method(console, "warn", () => {});
  const sensitive = "PRIVATE_VISITOR_COOKIE_BODY_AND_UA";
  for (const stage of ["fetch", "status", "body", "parse"]) {
    const response = await handle(visit(`/posts/${sensitive}`, {
      Cookie: `altria_visitor_id=${existingId}`, "User-Agent": sensitive,
    }), async () => {
      if (stage === "fetch") throw new TypeError(`fetch failed for ${configuration.url} ${configuration.secretKey} ${existingId}`, { cause: { code: sensitive } });
      const upstream = stage === "status" ? new Response(sensitive, { status: 503 }) : counterResponse(stage === "parse" ? { privateValue: sensitive } : undefined);
      if (stage === "body") upstream.text = async () => { throw new Error(`body failed: ${sensitive}`); };
      return upstream;
    });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: "Traffic statistics unavailable" });
    const [message, diagnostic] = warn.mock.calls.at(-1)!.arguments as [string, Record<string, unknown>];
    assert.equal(message, "[traffic] upstream failure");
    assert.deepEqual(Object.keys(diagnostic).sort(), ["elapsedMs", "errorName", "stage", "upstreamStatus"].sort());
    assert.equal(diagnostic.stage, stage);
    assert.equal(diagnostic.upstreamStatus, stage === "fetch" ? null : stage === "status" ? 503 : 200);
    assert.equal(diagnostic.errorName, stage === "fetch" ? "TypeError" : stage === "body" ? "Error" : null);
    assert.equal(typeof diagnostic.elapsedMs, "number");
    assert.ok(Number(diagnostic.elapsedMs) >= 0);
  }
  assert.equal(warn.mock.callCount(), 4);
  const logs = JSON.stringify(warn.mock.calls.map((call) => call.arguments));
  for (const privateValue of [sensitive, configuration.url, configuration.secretKey, existingId]) assert.ok(!logs.includes(privateValue));
});

test("diagnostics reject arbitrary error names and stay silent for successful or rejected input", async (t) => {
  const warn = t.mock.method(console, "warn", () => {});
  const error = new Error("cookie=private", { cause: { code: "PRIVATE_SECRET" } });
  error.name = "PRIVATESECRET";
  const failed = await handle(visit(), async () => { throw error; });
  assert.equal(failed.status, 502);
  assert.equal((warn.mock.calls[0].arguments[1] as Record<string, unknown>).errorName, null);
  const successful = await handle(visit(), async () => counterResponse());
  const rejected = await handle(visit("//evil.example"), async () => { throw new Error("must not fetch"); });
  const unconfigured = await handle(visit(), async () => { throw new Error("must not fetch"); }, {});
  assert.equal(successful.status, 200);
  assert.equal(rejected.status, 400);
  assert.equal(unconfigured.status, 503);
  assert.equal(warn.mock.callCount(), 1);
  assert.ok(!JSON.stringify(warn.mock.calls.map((call) => call.arguments)).includes("PRIVATE"));
});
