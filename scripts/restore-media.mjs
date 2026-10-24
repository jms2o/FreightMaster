import { readFileSync, existsSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// GitHub transfer uses small binary parts. Restore the exact original MP4s
// before dev/build, without downloads or third-party dependencies.
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('assets/video-manifest.json', root), 'utf8'));
const sha256 = data => createHash('sha256').update(data).digest('hex');
for (const video of manifest.videos) {
  const target = fileURLToPath(new URL(video.path, root));
  if (existsSync(target)) {
    const existing = readFileSync(target);
    if (existing.length === video.bytes && sha256(existing) === video.sha256) continue;
  }
  const buffers = video.parts.map(part => {
    const data = readFileSync(new URL(part.path, root));
    if (data.length !== part.bytes) throw new Error(`Incomplete video part: ${part.path}`);
    return data;
  });
  const data = Buffer.concat(buffers);
  if (data.length !== video.bytes || sha256(data) !== video.sha256) {
    throw new Error(`Video integrity check failed: ${video.path}`);
  }
  mkdirSync(dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, data);
  renameSync(temporary, target);
  console.log(`Restored ${video.path} (${data.length} bytes, SHA-256 verified)`);
}
