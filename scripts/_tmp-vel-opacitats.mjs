// TEMPORAL — no es comiteja. Opacitats i z-index de les capes de cada casa de la franja (p2).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const out = [];
  for (const el of franja.querySelectorAll('[data-stripe-tile]')) {
    const idx = Number(el.getAttribute('data-stripe-tile'));
    const coll = el.getAttribute('data-stripe-collection');
    const caps = [...el.querySelectorAll('img')].map((im) => {
      const cs = getComputedStyle(im);
      const pr = im.parentElement ? getComputedStyle(im.parentElement) : null;
      return {
        z: cs.zIndex,
        op: cs.opacity,
        pop: pr ? pr.opacity : null,
        pz: pr ? pr.zIndex : null,
        src: (im.getAttribute('src') || '').split('/').pop().slice(0, 28),
      };
    });
    out.push({ idx, coll, caps });
  }
  return out.sort((a, b2) => a.idx - b2.idx);
});
for (const c of r) {
  console.log(`casa ${String(c.idx).padStart(2)} ${String(c.coll).padEnd(16)} ${c.caps.map((x) => `[z${x.z} op${x.op} pare(z${x.pz} op${x.pop}) ${x.src}]`).join(' ')}`);
}
await ctx.close();
await b.close();
