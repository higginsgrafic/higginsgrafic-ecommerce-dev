// TEMPORAL — mesura el ROMBE a qualsevol vista: la diferencia entre la franja
// amb vel i sense vel. Si el vel es uniforme, tots els pixels de la samarreta
// velada tenen el MATEIX guany; el rombe es un segon grao mes alt.
//   node scripts/_tmp-rombe-metre.mjs 1920x946 [colorIdx] [pestanya|taula]
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const [mida, colorArg, lloc] = process.argv.slice(2);
const [w, h] = (mida || '1920x946').split('x').map(Number);
const colorIdx = colorArg === undefined ? -1 : Number(colorArg);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
if (colorIdx >= 0) {
  const c = await p.evaluate((i) => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const g = v.querySelector('[data-p2-color-grid]');
    const btns = g ? [...g.querySelectorAll('button')] : [];
    if (!btns[i]) return null;
    const r = btns[i].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }, colorIdx);
  if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1200); }
}
if (lloc === 'taula') {
  // la franja de la taula vertical
} 
const sel = lloc === 'taula'
  ? '[data-taula-vertical="2"] [data-stripe-visual-content="2"]'
  : '[data-mega-page-viewport="2"] [data-stripe-visual-content="2"]';
const rect = await p.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}, sel);
if (!rect) { console.log('no trobo la franja', sel); await ctx.close(); await b.close(); process.exit(1); }
await p.waitForTimeout(300);
const amb = PNG.sync.read(await p.screenshot({ clip: rect }));
const n = await p.evaluate((s) => {
  const franja = document.querySelector(s);
  let k = 0;
  for (const el of franja.querySelectorAll('path[fill-opacity]')) { el.style.visibility = 'hidden'; k++; }
  for (const el of franja.querySelectorAll('g[opacity]')) { if (el.querySelector('path')) { el.style.visibility = 'hidden'; k++; } }
  for (const im of franja.querySelectorAll('img')) {
    const src = im.getAttribute('src') || '';
    if (src.startsWith('data:image/svg+xml')) { im.style.visibility = 'hidden'; k++; }
  }
  return k;
}, sel);
await p.waitForTimeout(300);
const sens = PNG.sync.read(await p.screenshot({ clip: rect }));
const lum = (png, i) => 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
const cont = new Map();
let max = -1e9; let min = 1e9; let nVel = 0;
const arrodonir = (v) => Math.round(v);
for (let i = 0; i < amb.data.length; i += 4) {
  const d = lum(amb, i) - lum(sens, i);
  if (d <= 0.5) continue;
  nVel++;
  const k = arrodonir(d);
  cont.set(k, (cont.get(k) || 0) + 1);
  if (d > max) max = d;
  if (d < min) min = d;
}
const ordenat = [...cont.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, 6);
const total = [...cont.values()].reduce((a, v) => a + v, 0) || 1;
const pics = ordenat.map(([k, v]) => `${k}(${(v / total * 100).toFixed(1)}%)`).join(' ');
const damunt = [...cont.entries()].filter(([k]) => k >= 2).reduce((a, [, v]) => a + v, 0);
console.log(`${mida} color=${colorIdx} ${lloc || 'panell'} | pixels amb vel ${nVel} | guanys: ${pics} | min ${min.toFixed(1)} max ${max.toFixed(1)}`);
console.log(`  pixels amb guany >= 2 (ROMBE): ${damunt}`);
await ctx.close();
await b.close();
