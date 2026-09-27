// TEMPORAL — no es comiteja. El tint del color de samarreta a la p2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const slug = process.argv[2] || 'black';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=miscellania', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4000);
const abans = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel = [...v2.querySelectorAll('[data-color-barra]')].map((el) => ({ s: el.getAttribute('data-color-barra'), out: getComputedStyle(el).outlineColor + '/' + getComputedStyle(el).outlineWidth, b: getComputedStyle(el).borderColor, tf: getComputedStyle(el).transform }));
  return sel;
});
await p.click(`[data-mega-page-viewport="2"] [data-color-barra="${slug}"]`).catch((e) => console.log('clic fallit', e.message));
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const emb = franja.parentElement;
  const capes = [...emb.querySelectorAll('*')].map((el) => {
    const cs = getComputedStyle(el);
    const rr = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      z: cs.zIndex,
      pos: cs.position,
      mb: cs.mixBlendMode,
      bg: cs.backgroundColor,
      op: cs.opacity,
      w: Math.round(rr.width),
      src: (el.getAttribute('src') || '').slice(0, 24),
    };
  }).filter((x) => x.mb === 'multiply' || (x.bg && x.bg !== 'rgba(0, 0, 0, 0)') || x.tag === 'IMG');
  const bars = [...v2.querySelectorAll('[data-color-barra]')].map((el) => ({ s: el.getAttribute('data-color-barra'), out: getComputedStyle(el).outlineWidth, tf: getComputedStyle(el).transform }));
  return { capes, bars };
});
console.log('ABANS (barres):', JSON.stringify(abans.slice(12)));
console.log('DESPRES (barres):', JSON.stringify(r.bars.slice(12)));
console.log('capes amb fons/multiply/IMG:');
for (const c of r.capes) console.log('   ', JSON.stringify(c));
await ctx.close();
await b.close();
