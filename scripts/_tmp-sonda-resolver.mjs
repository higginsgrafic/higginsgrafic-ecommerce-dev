// TEMPORAL — no es comiteja. Que resol i que NO resol el resolver de la stripe
// per a cada dibuix de LOOKING FOR MY DARCY?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
const r = await p.evaluate(async () => {
  const mod = await import('/src/utils/resolveStripeTile.js');
  const base = '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/';
  const ctx = { active: 'austen', displayedShirtColor: 'white', resolvedOverlaySrc: null };
  const out = {};
  for (const c of ['blue', 'fuchsia', 'red', 'yellow']) {
    for (const k of ['solid', 'frame']) {
      const it = `${base}${c}-${k}-grid.webp`;
      out[`${c}-${k}`] = mod.resolveForItem(it, 'color', ctx) || 'NULL';
    }
  }
  return out;
});
for (const [k, v] of Object.entries(r)) console.log(`${k.padEnd(16)} ${v}`);
await b.close();
