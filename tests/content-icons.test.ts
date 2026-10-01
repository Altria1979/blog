import test from "node:test";
import assert from "node:assert/strict";
import { contentLinkIcon, contentCodeIcon, contentArchIcon } from "../lib/content-icons";

test("domain icons distinguish real hosts, subdomains and lookalike suffixes", () => {
  assert.equal(contentLinkIcon("https://docs.github.com/en"), contentLinkIcon("https://github.com"));
  assert.notEqual(contentLinkIcon("https://mp.weixin.qq.com/article"), contentLinkIcon("https://qq.com"));
  assert.equal(contentLinkIcon("https://github.com.evil.test/path"), undefined);
  assert.equal(contentLinkIcon("javascript:alert(1)"), undefined);
  assert.equal(contentLinkIcon("/posts/github.com"), undefined);
});

test("file icons override language icons and unknown names use a safe fallback", () => {
  assert.notEqual(contentCodeIcon("json", "package.json"), contentCodeIcon("json", "data.json"));
  assert.equal(contentCodeIcon("constructor"), "catppuccin:file");
  assert.equal(contentArchIcon("constructor"), undefined);
});
