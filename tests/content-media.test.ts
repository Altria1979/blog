import assert from "node:assert/strict";
import test from "node:test";
import { githubRepository, githubRepositoryData, mediaLength, mediaRatio, safeMediaUrl, videoLink, videoRatio, videoSource } from "../lib/content-media.ts";

test("media URLs reject executable schemes, credentials and browser-normalized host escapes", () => {
  assert.equal(safeMediaUrl("/media/example.mp4?version=2"), "/media/example.mp4?version=2");
  assert.equal(safeMediaUrl("https://example.com/clip.mp4"), "https://example.com/clip.mp4");
  for (const value of ["javascript:alert(1)", "data:text/html,test", "//evil.example/", "/\\evil.example/", "https://user:pass@example.com/a", "https://exa\nmple.com/", "file:///tmp/clip.mp4", "clip.mp4", null]) assert.equal(safeMediaUrl(value), undefined);
});

test("video providers construct bounded URLs without trusting source or query injection", () => {
  assert.equal(videoSource({ type: "bilibili", id: "BV1Yr421p7rW", autoplay: true }), "https://player.bilibili.com/player.html?bvid=BV1Yr421p7rW&autoplay=0");
  assert.equal(videoSource({ type: "youtube", id: "dQw4w9WgXcQ", autoplay: true }), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1&autoplay=1&mute=1");
  assert.equal(videoSource({ type: "douyin-wide", id: "7339041157571169546" }), "https://open.douyin.com/player/video?vid=7339041157571169546&autoplay=0");
  assert.equal(videoSource({ type: "raw", id: "/video.mp4" }), "/video.mp4");
  for (const props of [{ type: "bilibili", id: "BV1Yr421p7rW&autoplay=1" }, { type: "youtube", id: "https://evil.example" }, { type: "douyin", id: "1?foo=bar" }, { type: "custom", id: "https://evil.example" }, { type: "raw", id: "javascript:alert(1)" }]) assert.equal(videoSource(props), undefined);
});

test("video layout accepts supported units and positive ratios only", () => {
  assert.equal(mediaLength(" 80dvh "), "80dvh");
  assert.equal(mediaLength("32rem"), "32rem");
  for (const value of ["expression(alert(1))", "-1px", "0px", "calc(100vw - 1px)", "80vh; color: red"]) assert.equal(mediaLength(value), undefined);
  assert.equal(mediaRatio("16/9"), "16 / 9");
  assert.equal(mediaRatio(1.6), "1.6");
  for (const value of ["16/0", "1/2/3", -1, Infinity, "auto"]) assert.equal(mediaRatio(value), undefined);
  assert.equal(videoRatio({ id: "1", type: "douyin" }), "27 / 56");
  assert.equal(videoRatio({ id: "1", type: "douyin", ratio: "4 / 3" }), "4 / 3");
  assert.equal(videoRatio({ id: "1", type: "raw" }), undefined);
});

test("video fallback links point to public source pages and reject invalid sources", () => {
  assert.equal(videoLink({ type: "youtube", id: "dQw4w9WgXcQ" }), "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.equal(videoLink({ type: "bilibili-nano", id: "BV1Yr421p7rW" }), "https://www.bilibili.com/video/BV1Yr421p7rW");
  assert.equal(videoLink({ type: "douyin-wide", id: "7339041157571169546" }), "https://www.douyin.com/video/7339041157571169546");
  assert.equal(videoLink({ type: "raw", id: "/video.mp4" }), "/video.mp4");
  assert.equal(videoLink({ type: "raw", id: "javascript:alert(1)" }), undefined);
  assert.equal(videoLink({ type: "youtube", id: "../../bad" }), undefined);
});

test("GitHub repositories require an explicit owner/name and cannot change API origin", () => {
  assert.deepEqual(githubRepository("senshinya/blog"), { name: "senshinya/blog", url: "https://github.com/senshinya/blog", api: "https://api.github.com/repos/senshinya/blog" });
  for (const repo of ["", "blog", "https://github.com/a/b", "owner/../secret", "owner/repo?token=x", "owner/repo#fragment", "owner/..", "@owner/repo", "owner/repo/extra"]) assert.equal(githubRepository(repo), undefined);
});

test("GitHub metadata is bounded to public text, counts and GitHub avatar origin", () => {
  assert.equal(githubRepositoryData({ message: "rate limit" }), undefined);
  assert.deepEqual(githubRepositoryData({ full_name: "a/b", description: "Example", stargazers_count: 3, forks_count: -1, language: "TypeScript", owner: { avatar_url: "https://avatars.githubusercontent.com.evil.example/1" }, license: { spdx_id: "NOASSERTION" } }), { description: "Example", stars: 3, forks: undefined, language: "TypeScript", license: undefined, avatar: undefined });
  assert.equal(githubRepositoryData({ full_name: "a/b", owner: { avatar_url: "https://avatars.githubusercontent.com/u/1" } })?.avatar, "https://avatars.githubusercontent.com/u/1");
});
