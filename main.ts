// gta6-clipper-01 entry (Node 22, standard library only).
//
// The entry is the YouTube video named in VIDEO.json: this program only
// copies VIDEO.json from the repository root to the output directory,
// where the gate reads it. The house reads the video's views itself
// through the YouTube Data API; nothing this program writes is scored.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

const source = join(BOT_DIR, 'VIDEO.json');
const target = join(OUTPUT_DIR, 'VIDEO.json');

try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// Validate the copied file instead of silently passing a broken URL
// through: the gate reads out/VIDEO.json, so a bad URL here would fail
// the entry with no useful diagnostic. Fail fast with a clear message.
const SHORTS_URL_RE = /^https:\/\/www\.youtube\.com\/shorts\/[A-Za-z0-9_-]{11}$/;

try {
  const copied = JSON.parse(readFileSync(target, 'utf8')) as { url?: unknown };
  if (typeof copied.url !== 'string' || !SHORTS_URL_RE.test(copied.url)) {
    throw new Error(
      `VIDEO.json has no valid YouTube Shorts URL (expected https://www.youtube.com/shorts/<11-char id>, got ${JSON.stringify(copied.url)})`,
    );
  }
} catch (err) {
  console.error(`VIDEO.json validation failed: ${(err as Error).message}`);
  process.exit(1);
}
