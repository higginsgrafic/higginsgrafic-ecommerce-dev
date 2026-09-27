// TEMPORAL — no es comiteja. El vel de la franja VISIBLE de la taula vertical (768x1024).
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const info = await p.evaluate(() => {
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const franja = taula.querySelector('[data-stripe-visual-content="2"]');
  const rr = franja.getBoundingClientRect();
  const svg = franja.querySelector('svg');
  const paths = svg ? [...svg.querySelectorAll('path')] : [];
  const vel = paths.filter((x) => x.getAttribute('fill-opacity') !== null);
  const tiles = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => {
    const r = el.getBoundingClientRect();
    return { i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection'), x: r.left, y: r.top, w: r.width, h: r.height };
  });
  return {
    rect: { x: rr.left, y: rr.top, w: rr.width, h: rr.height },
    nPaths: paths.length,
    vel: vel.map((x) => {
      const r = x.getBoundingClientRect();
      return { idx: x.id, fo: x.getAttribute('fill-opacity'), tx: x.getAttribute('transform'), box: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` };
    }),
    tiles,
    sonde: window.__HG_VEL__ || null,
  };
});
console.log(`franja visible ${JSON.stringify(info.rect)} paths=${info.nPaths} ambVel=${info.vel.length}`);
console.log('SONDA idx:', info.sonde ? info.sonde.idx.join(',') : 'n/a', 'offset', info.sonde ? info.sonde.offset : '?');
for (const v of info.vel) console.log(`   ${v.idx || '(sense id)'} fo=${v.fo} box=${v.box} tr=${v.tx}`);
console.log('cases:');
for (const t of info.tiles.sort((a, b2) => a.i - b2.i)) console.log(`   casa ${String(t.i).padStart(2)} ${String(t.c).padEnd(16)} ${Math.round(t.x)},${Math.round(t.y)} ${Math.round(t.w)}x${Math.round(t.h)}`);
const clip = { x: Math.max(0, Math.round(info.rect.x - 10)), y: Math.max(0, Math.round(info.rect.y - 10)), width: Math.round(info.rect.w + 20), height: Math.round(info.rect.h + 20) };
await p.screenshot({ path: `_tmp-tv-on-${act}.png`, clip });
const amagats = await p.evaluate(() => {
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const franja = taula.querySelector('[data-stripe-visual-content="2"]');
  let n = 0;
  for (const x of franja.querySelectorAll('path[fill-opacity]')) { x.style.visibility = 'hidden'; n += 1; }
  for (const im of franja.querySelectorAll('img')) {
    const s = im.getAttribute('src') || '';
    if (s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s))) { im.style.visibility = 'hidden'; n += 1; }
  }
  return n;
});
await p.waitForTimeout(300);
await p.screenshot({ path: `_tmp-tv-off-${act}.png`, clip });
const on = PNG.sync.read(readFileSync(`_tmp-tv-on-${act}.png`));
const off = PNG.sync.read(readFileSync(`_tmp-tv-off-${act}.png`));
const out = new PNG({ width: on.width, height: on.height });
for (let i = 0; i < on.width * on.height; i++) {
  const k = i * 4;
  const d = Math.max(Math.abs(on.data[k] - off.data[k]), Math.abs(on.data[k + 1] - off.data[k + 1]), Math.abs(on.data[k + 2] - off.data[k + 2]));
  const v = Math.min(255, d * 6);
  out.data[k] = v; out.data[k + 1] = v; out.data[k + 2] = v; out.data[k + 3] = 255;
}
writeFileSync(`_tmp-tv-diff-${act}.png`, PNG.sync.write(out));
console.log(`elements de vel amagats: ${amagats}; desat _tmp-tv-diff-${act}.png (${on.width}x${on.height}) clip ${JSON.stringify(clip)}`);
await ctx.close();
await b.close();
