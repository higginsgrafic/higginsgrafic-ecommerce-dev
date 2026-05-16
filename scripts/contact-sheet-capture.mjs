#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Contact Sheet capture
 * ---------------------
 * Renders every page declared in `src/dev/pagesManifest.js` in headless Firefox
 * at a fixed viewport, takes a full-page screenshot and writes:
 *   - public/contact-sheet/<slug>.png
 *   - public/contact-sheet/index.json   (path -> { src, width, height })
 *
 * Usage:
 *   node scripts/contact-sheet-capture.mjs                       # uses defaults
 *   node scripts/contact-sheet-capture.mjs --base-url=http://localhost:3003
 *   node scripts/contact-sheet-capture.mjs --only=/checkout,/track
 *
 * Requires the dev server to be running (default: http://localhost:3003).
 */

import { firefox } from 'playwright';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MANIFEST_URL = pathToFileURL(resolve(ROOT, 'src/dev/pagesManifest.js')).href;

// ---- args ---------------------------------------------------------------
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a) => a.replace(/^--/, '').split('='))
    .map(([k, v]) => [k, v ?? true])
);
const BASE_URL = String(args['base-url'] || 'http://localhost:3003').replace(/\/$/, '');
const VIEWPORT_W = Number(args.width || 1280);
const VIEWPORT_H = Number(args.height || 800);
const ONLY = args.only ? String(args.only).split(',').map((s) => s.trim()).filter(Boolean) : null;
const CLEAN = args.clean === true || args.clean === 'true';
const OUT_DIR = resolve(ROOT, String(args['out-dir'] || 'public/contact-sheet'));
// URL prefix is the OUT_DIR relative to /public, so generated src links point
// to the right place regardless of where the captures were written.
const PUBLIC_DIR = resolve(ROOT, 'public');
const URL_PREFIX = OUT_DIR.startsWith(PUBLIC_DIR + '/')
  ? '/' + OUT_DIR.slice(PUBLIC_DIR.length + 1)
  : '/contact-sheet';

// ---- helpers ------------------------------------------------------------
const slugify = (path) => {
  if (path === '/' || path === '') return 'home';
  return path
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
};

async function main() {
  const { PAGES_MANIFEST } = await import(MANIFEST_URL);
  const pages = ONLY
    ? PAGES_MANIFEST.filter((p) => ONLY.includes(p.path))
    : PAGES_MANIFEST;

  if (pages.length === 0) {
    console.error('No pages to capture.');
    process.exit(1);
  }

  if (CLEAN && existsSync(OUT_DIR)) {
    await rm(OUT_DIR, { recursive: true, force: true });
  }
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`▸ Launching Firefox`);
  const browser = await firefox.launch();
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const index = {};
  let ok = 0;
  let fail = 0;

  for (const entry of pages) {
    const slug = slugify(entry.path);
    const file = `${slug}.png`;
    const url = `${BASE_URL}${entry.path}${entry.path.includes('?') ? '&' : '?'}embed=contact-sheet`;
    process.stdout.write(`  · ${entry.path.padEnd(40)} → ${file} `);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Give the app a beat to settle (animations, lazy mounts).
      await page.waitForTimeout(400);
      const dims = await page.evaluate(() => ({
        width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      }));
      await page.screenshot({
        path: resolve(OUT_DIR, file),
        fullPage: true,
        type: 'png',
      });
      index[entry.path] = {
        src: `${URL_PREFIX}/${file}`,
        width: dims.width,
        height: dims.height,
      };
      ok += 1;
      console.log(`OK ${dims.width}×${dims.height}`);
    } catch (err) {
      fail += 1;
      console.log(`FAIL ${err.message}`);
    }
  }

  await writeFile(
    resolve(OUT_DIR, 'index.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl: BASE_URL, viewport: { w: VIEWPORT_W, h: VIEWPORT_H }, pages: index }, null, 2)}\n`,
    'utf8'
  );

  await context.close();
  await browser.close();

  console.log(`\nDone. ${ok} captured, ${fail} failed. Output: ${OUT_DIR}`);
  if (fail > 0) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
