import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const sharp: typeof import("sharp").default = createRequire(join(root, "package.json"))("sharp");

test("image inventory records displayed dimensions and retains remote assets", async () => {
  const directory = await mkdtemp(join(tmpdir(), "altria-image-manifest-"));
  const retained = { width: 640, height: 480, bytes: 42, sha256: "existing", contentType: "image/webp" };
  try {
    await mkdir(join(directory, "public/images"), { recursive: true });
    await mkdir(join(directory, "content"));
    await writeFile(join(directory, "content/image-assets.json"), JSON.stringify({ "/images/remote.webp": retained }));
    const fixture = { create: { width: 120, height: 80, channels: 3 as const, background: "white" } };
    await sharp(fixture).jpeg().withMetadata({ orientation: 6 }).toFile(join(directory, "public/images/rotated.jpg"));
    await sharp(fixture).jpeg().toFile(join(directory, "public/images/unrotated.jpg"));

    execFileSync(process.execPath, [join(root, "scripts/image-manifest.mjs")], { cwd: directory });

    const assets = JSON.parse(await readFile(join(directory, "content/image-assets.json"), "utf8"));
    assert.deepEqual(assets["/images/remote.webp"], retained);
    assert.deepEqual([assets["/images/unrotated.jpg"].width, assets["/images/unrotated.jpg"].height], [120, 80]);
    assert.deepEqual([assets["/images/rotated.jpg"].width, assets["/images/rotated.jpg"].height], [80, 120]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
