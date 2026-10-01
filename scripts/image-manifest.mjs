import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Keep this small metadata file when the image binaries move to object storage.
const root = process.cwd();
const manifestPath = path.join(root, 'content/image-assets.json');
const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };
let assets = {};
try {
  assets = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
let updated = 0;
async function visit(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT' && directory === path.join(root, 'public/images')) return [];
    throw error;
  });
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Image inventory does not follow symbolic links: ${file}`);
    if (entry.isDirectory()) { await visit(file); continue; }
    const contentType = types[path.extname(entry.name).toLowerCase()];
    if (!entry.isFile() || !contentType) continue;
    const bytes = await readFile(file);
    const metadata = await sharp(bytes).metadata();
    const { width, height } = metadata.autoOrient ?? metadata;
    if (!width || !height) throw new Error(`Cannot read image dimensions: ${file}`);
    const key = '/' + path.relative(path.join(root, 'public'), file).split(path.sep).join('/');
    assets[key] = { width, height, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), contentType };
    updated += 1;
  }
}
await visit(path.join(root, 'public/images'));
await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(assets).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');
console.log(`Recorded ${updated} local images; retained ${Object.keys(assets).length} image metadata entries. No images uploaded or deleted.`);
