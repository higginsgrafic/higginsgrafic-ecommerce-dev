// TEMPORAL — no es comiteja. Les transformacions del vel vs els centres de les caselles.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=miscellania', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const rf = franja.getBoundingClientRect();
  const escala = 2866 / rf.width;
  const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => {
    const rr = el.getBoundingClientRect();
    return { i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection'), centre: +(((rr.left - rf.left) + rr.width / 2) * escala).toFixed(1) };
  }).sort((a, b2) => a.i - b2.i);
  const im = [...franja.querySelectorAll('img')].find((x) => (x.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  const svg = decodeURIComponent(im.getAttribute('src'));
  const trs = [...svg.matchAll(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)/g)].map((m) => ({ tx: +Number(m[1]).toFixed(1), ty: +Number(m[2]).toFixed(1), sx: +Number(m[3]).toFixed(3) }));
  return { cases, trs, escala: +escala.toFixed(3) };
});
console.log('escala', r.escala);
console.log('cases:', r.cases.map((c) => `${c.i}:${c.c}:${c.centre}`).join(' '));
console.log('transforms del vel:', r.trs.map((t) => `${t.tx} (sx ${t.sx})`).join(' | '));
await ctx.close();
await b.close();
