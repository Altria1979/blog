import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import {
  getLocaleAlternates,
  isLocale,
  languageTag,
  localePath,
  locales,
  splitLocalePath,
} from "../lib/i18n.ts";
import { getHeadings } from "../lib/markdown.ts";
import { getPost, getPosts, getTranslationManifest, parsePost } from "../lib/posts.ts";

const postSource = (metadata = "", content = "A complete article body.") =>
  `---\ntitle: Article\ndate: 2026-09-30\n${metadata}\n---\n\n${content}`;

function withPosts(files: Record<string, string>, run: (directory: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), "altria-i18n-"));
  try {
    for (const [filename, content] of Object.entries(files)) {
      const path = join(directory, filename);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    }
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("language URLs preserve legacy Chinese paths, query values, and anchors", () => {
  const paths = [
    "/",
    "/posts/hello",
    "/archives",
    "/about",
    "/?category=%E6%8A%80%E6%9C%AF&page=2#results",
    "/posts/hello?from=search&next=%2Fja%2Fabout#reading",
  ];
  for (const path of paths) {
    assert.equal(localePath(path, "zh"), path);
    for (const locale of ["en", "ja"] as const) {
      const expected = path === "/" ? `/${locale}`
        : path.startsWith("/?") ? `/${locale}${path.slice(1)}`
        : `/${locale}${path}`;
      assert.equal(localePath(path, locale), expected);
      assert.equal(localePath(expected, "zh"), path);
      assert.equal(localePath(expected, locale), expected);
      assert.equal(splitLocalePath(expected).locale, locale);
      assert.equal(splitLocalePath(expected).path, path);
      assert.ok(!localePath(expected, "zh").startsWith("/zh"));
    }
  }
  assert.equal(localePath("/en/posts/hello?tag=CSS#code", "ja"), "/ja/posts/hello?tag=CSS#code");
  assert.equal(localePath("/ja#intro", "en"), "/en#intro");
  assert.equal(localePath("/en/#intro", "zh"), "/#intro");
});

test("locale detection recognizes only supported complete first path segments", () => {
  for (const path of ["/english", "/enough/posts/hello", "/january", "/ja-JP", "/en-US", "/posts/en", "/zh/about"]) {
    assert.deepEqual(splitLocalePath(path), { locale: "zh", path });
    assert.equal(localePath(path, "en"), `/en${path}`);
  }
  for (const locale of locales) assert.equal(isLocale(locale), true);
  for (const value of ["", "fr", "en-US", "ja-JP", "zh-CN", "EN", "../en"]) {
    assert.equal(isLocale(value), false);
  }
  assert.deepEqual(locales.map(languageTag), ["zh-CN", "en", "ja"]);
});

test("application alternates keep Chinese canonical paths and exclude removed or unknown pages", () => {
  for (const path of ["/", "/archives", "/about"]) {
    const expected = {
      zh: path,
      en: localePath(path, "en"),
      ja: localePath(path, "ja"),
    };
    for (const locale of locales) {
      const localized = localePath(path, locale);
      assert.deepEqual(getLocaleAlternates(localized, {}), expected);
      assert.deepEqual(getLocaleAlternates(`${localized}/`, {}), expected);
    }
  }
  for (const path of ["/links", "/en/links", "/ja/links", "/zh/about", "/posts/missing", "/en/posts/missing", "/english/about", "/%E0%A4%A"]) {
    assert.deepEqual(getLocaleAlternates(path, {}), {}, path);
  }
});

test("existing posts default to Chinese and translated posts retain their explicit group", () => {
  const original = parsePost("original", postSource());
  assert.equal(original?.locale, "zh");
  assert.equal(original?.translationKey, "original");
  for (const locale of ["en", "ja"] as const) {
    const translated = parsePost("translated", postSource(`locale: ${locale}\ntranslationKey: original`), locale);
    assert.equal(translated?.locale, locale);
    assert.equal(translated?.translationKey, "original");
    assert.equal(parsePost("translated", postSource(), locale)?.locale, locale);
  }
});

test("invalid or mismatched locale metadata never enters the publication list", () => {
  for (const locale of locales) {
    for (const declared of ["fr", "en-US", "ja-JP", "zh-CN", "EN", "", ...locales.filter((value) => value !== locale)]) {
      assert.equal(parsePost("invalid", postSource(`locale: ${declared}`), locale), undefined);
    }
  }
  withPosts({
    "original.md": postSource(),
    "wrong-root.md": postSource("locale: en"),
    "en/wrong-language.md": postSource("locale: ja"),
    "en/unsupported.md": postSource("locale: fr"),
    "ja/unsupported.md": postSource("locale: ja-JP"),
  }, (directory) => {
    assert.deepEqual(getPosts(directory).map((post) => post.slug), ["original"]);
    assert.deepEqual(getPosts(directory, "en"), []);
    assert.deepEqual(getPosts(directory, "ja"), []);
    assert.deepEqual(getTranslationManifest(directory), {
      "/posts/original": { zh: "/posts/original" },
    });
  });
});

test("missing translations have no fabricated alternate or post", () => {
  withPosts({ "original.md": postSource() }, (directory) => {
    const manifest = getTranslationManifest(directory);
    assert.deepEqual(manifest, { "/posts/original": { zh: "/posts/original" } });
    assert.deepEqual(getLocaleAlternates("/posts/original", manifest), { zh: "/posts/original" });
    for (const locale of ["en", "ja"] as const) {
      assert.deepEqual(getPosts(directory, locale), []);
      assert.equal(getPost("original", directory, locale), undefined);
      assert.deepEqual(getLocaleAlternates(`/${locale}/posts/original`, manifest), {});
    }
  });
});

test("draft translations stay out of posts and every published alternate group", () => {
  withPosts({
    "original.md": postSource(),
    "en/translated.md": postSource("locale: en\ntranslationKey: original\ndraft: true"),
    "ja/translated.md": postSource("locale: ja\ntranslationKey: original"),
  }, (directory) => {
    const manifest = getTranslationManifest(directory);
    const expected = { zh: "/posts/original", ja: "/ja/posts/translated" };
    assert.deepEqual(getPosts(directory, "en"), []);
    assert.equal(getPost("translated", directory, "en"), undefined);
    assert.deepEqual(manifest, {
      "/posts/original": expected,
      "/ja/posts/translated": expected,
    });
    assert.deepEqual(getLocaleAlternates("/en/posts/translated", manifest), {});
  });
});

test("translation keys link real translated slugs across languages", () => {
  withPosts({
    "original.md": postSource("translationKey: shared"),
    "en/english-title.md": postSource("locale: en\ntranslationKey: shared"),
    "ja/japanese-title.md": postSource("locale: ja\ntranslationKey: shared"),
  }, (directory) => {
    const manifest = getTranslationManifest(directory);
    const expected = {
      zh: "/posts/original",
      en: "/en/posts/english-title",
      ja: "/ja/posts/japanese-title",
    };
    assert.deepEqual(Object.keys(manifest).sort(), Object.values(expected).sort());
    for (const path of Object.values(expected)) {
      assert.deepEqual(manifest[path], expected);
      assert.deepEqual(getLocaleAlternates(path, manifest), expected);
    }
    assert.equal(getPost("english-title", directory, "en")?.translationKey, "shared");
    assert.equal(getPost("original", directory, "en"), undefined);
    assert.equal(getPost("english-title", directory), undefined);
  });
});

test("duplicate translation keys within one language fail explicitly", () => {
  for (const locale of locales) {
    const folder = locale === "zh" ? "" : `${locale}/`;
    withPosts({
      [`${folder}first.md`]: postSource(`locale: ${locale}\ntranslationKey: shared`),
      [`${folder}second.md`]: postSource(`locale: ${locale}\ntranslationKey: shared`),
    }, (directory) => {
      assert.throws(() => getTranslationManifest(directory), new RegExp(`Duplicate ${locale} translation: shared`));
    });
  }
});

test("localized post lookups never resolve traversal or another language's files", () => {
  withPosts({
    "original.md": postSource(),
    "en/translated.md": postSource("locale: en\ntranslationKey: original"),
    "ja/translated.md": postSource("locale: ja\ntranslationKey: original"),
  }, (directory) => {
    for (const locale of locales) {
      for (const slug of ["../original", "../original.md", "../../original", "..\\original", "/etc/passwd", "%2e%2e%2foriginal", "../en/translated", "en/translated", "./translated", "translated.md"]) {
        assert.equal(getPost(slug, directory, locale), undefined, `${locale}: ${slug}`);
      }
    }
    assert.equal(getPost("original", directory)?.locale, "zh");
    assert.equal(getPost("translated", directory, "en")?.locale, "en");
    assert.equal(getPost("translated", directory, "ja")?.locale, "ja");
  });
});

test("published translations preserve metadata, sections, and executable code", () => {
  const originals = getPosts();
  const manifest = getTranslationManifest();
  assert.ok(originals.length > 0);
  for (const locale of ["en", "ja"] as const) {
    const translations = getPosts(undefined, locale);
    assert.ok(translations.length > 0);
    for (const original of originals.filter((post) => translations.some((translation) => translation.translationKey === post.translationKey))) {
      const translated = translations.find((post) => post.translationKey === original.translationKey);
      assert.ok(translated, `${locale}: ${original.slug}`);
      assert.equal(translated.locale, locale);
      assert.notEqual(translated.title, original.title);
      assert.notEqual(translated.description, original.description);
      assert.notEqual(translated.content, original.content);
      for (const field of ["date", "category", "tags", "cover", "type", "license", "featured"] as const) {
        assert.deepEqual(translated[field], original[field], `${locale}: ${original.slug}: ${field}`);
      }
      assert.deepEqual(
        getHeadings(translated.content).map((heading) => heading.level),
        getHeadings(original.content).map((heading) => heading.level),
        `${locale}: ${original.slug}: sections`,
      );
      const executableCode = (content: string) => content.match(/```(?:css|tsx)\n[\s\S]*?\n```/g) ?? [];
      assert.deepEqual(executableCode(translated.content), executableCode(original.content));
      assert.equal(manifest[`/posts/${original.slug}`][locale], `/${locale}/posts/${translated.slug}`);
      assert.equal(manifest[`/${locale}/posts/${translated.slug}`].zh, `/posts/${original.slug}`);
    }
  }
});

test("Japanese reading counts include kana, while Chinese and English counting stay compatible", () => {
  const text = "こんにちは カタカナ 漢字 hello world";
  assert.equal(parsePost("ja", postSource("locale: ja", text), "ja")?.wordCount, 13);
  assert.equal(parsePost("zh", postSource("", "你好 hello world"))?.wordCount, 4);
  assert.equal(parsePost("en", postSource("locale: en", "Hello world"), "en")?.wordCount, 2);
});
