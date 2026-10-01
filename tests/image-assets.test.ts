import assert from "node:assert/strict";
import test from "node:test";
import { imageAssetDimensions, imageBaseUrl, imageRemotePatterns, imageUrl } from "../lib/image-assets.ts";

test("image hosting uses a single HTTPS public origin, never credentials or an endpoint path", () => {
  assert.equal(imageBaseUrl(""), "");
  assert.equal(imageBaseUrl(" https://cdn.example.com/ "), "https://cdn.example.com");
  for (const value of ["http://cdn.example.com", "https://key:secret@cdn.example.com", "https://cdn.example.com/bucket", "https://cdn.example.com?token=secret", "https://cdn.example.com/#images", "https://*.r2.dev", "https://cdn.example.com:8443"]) {
    assert.throws(() => imageBaseUrl(value), Error, value);
  }
});

test("only clean local image paths move to the configured origin", () => {
  const src = "/images/posts/2025-year-in-review/01.webp";
  const base = "https://cdn.example.com";
  assert.equal(imageUrl(src, ""), src);
  assert.equal(imageUrl(src, base), `${base}${src}`);
  for (const value of ["https://elsewhere.example/pic.jpg", "/fonts/font.woff2", "//elsewhere.example/a", "/images/../secret", "/images/%2e%2e/secret", "/images/path%2fsecret", "/images/a\\b.jpg", "/images/a.jpg?token=value", "/images/a.jpg#fragment"]) {
    assert.equal(imageUrl(value, base), value);
  }
  assert.deepEqual(imageRemotePatterns(base), [{ protocol: "https", hostname: "cdn.example.com", port: "", pathname: "/images/**", search: "" }]);
  assert.deepEqual(imageRemotePatterns(""), []);
});

test("recorded dimensions remain usable after local image files are removed", () => {
  const assets = { "/images/photo.webp": { width: 2048, height: 1443, bytes: 100, sha256: "hash", contentType: "image/webp" } };
  assert.deepEqual(imageAssetDimensions("/images/photo.webp", assets), { width: 2048, height: 1443 });
  assert.equal(imageAssetDimensions("/images/missing.webp", assets), undefined);
  assert.equal(imageAssetDimensions("/images/photo.webp", { "/images/photo.webp": { ...assets["/images/photo.webp"], height: 0 } }), undefined);
});
