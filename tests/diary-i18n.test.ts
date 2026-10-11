import assert from "node:assert/strict";
import test from "node:test";
import { getLocaleAlternates, localePath, localeSwitchUrl, locales } from "../lib/i18n.ts";
import { getDiaryMessages } from "../lib/diary-messages.ts";
import { getMessages } from "../lib/messages.ts";

test("all diary interfaces are available even before any translations are published", () => {
  const expected = { zh: "/diary", en: "/en/diary", ja: "/ja/diary" };
  for (const locale of locales) {
    assert.deepEqual(getLocaleAlternates(localePath("/diary", locale), {}), expected);
    assert.deepEqual(getLocaleAlternates(`${localePath("/diary", locale)}/`, {}), expected);
    const messages = getDiaryMessages(locale);
    assert.equal(messages.title, getMessages(locale).diary);
    assert.ok(messages.empty && messages.subtitle && messages.pagination);
    assert.match(messages.pageLabel(2, 3), /2.*3/);
    assert.ok(messages.entryLabel("2026-10-11").includes("2026-10-11"));
  }
});

test("diary language switching resets page and fragment without dropping unrelated query state", () => {
  for (const locale of locales) {
    const path = localePath("/diary", locale);
    assert.equal(localeSwitchUrl(path, "?page=3", "#diary-one-heading"), path);
    assert.equal(localeSwitchUrl(path, "?page=3&from=nav&page=4", "#diary-one-heading"), `${path}?from=nav`);
    assert.equal(localeSwitchUrl(path, "", "#diary-one-heading"), path);
  }
});

test("other language switches preserve the existing query and fragment exactly", () => {
  for (const path of ["/en", "/ja/archives", "/en/posts/hello", "/en/diary-entry"]) {
    assert.equal(localeSwitchUrl(path, "?page=3&query=%E6%97%A5", "#section"), `${path}?page=3&query=%E6%97%A5#section`);
  }
});
