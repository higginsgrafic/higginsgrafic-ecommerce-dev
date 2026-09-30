// TEMPORAL — la cadena de la franja de la p2: mides de disseny i transformades.
import { chromium } from '@playwright/test';
const VISTES = [[1366, 768], [1280, 720]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(9000);
    const r = await p.evaluate(() => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const vis = v2.querySelector('[data-stripe-visual-content="2"]');
      const cs = getComputedStyle(document.documentElement);
      const carrilX = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
      const carrilW = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
      const img = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-visual-content="2"] img');
      const cadena = [];
      let el = img;
      while (el && cadena.length < 7) {
        const t = getComputedStyle(el).transform;
        cadena.push({ et: el.tagName + (el.getAttribute('data-stripe-visual-content') ? '[vis]' : ''), ow: el.offsetWidth, oh: el.offsetHeight, w: +el.getBoundingClientRect().width.toFixed(1), t: t === 'none' ? 'none' : t.slice(0, 60) });
        el = el.parentElement;
      }
      return { carrilX: +carrilX.toFixed(1), carrilW: +carrilW.toFixed(1), scale: cs.getPropertyValue('--megaStripeScale').trim(), cadena };
    });
    console.log(`${w}x${h} carril ${r.carrilX} (${r.carrilW})  --megaStripeScale=${r.scale}  objectiu=${r.carrilW}  -> visio esperada ${(r.carrilW / (2740/2866)).toFixed(1)}`);
    for (const c of r.cadena) console.log(`    ${c.et.padEnd(22)} offsetW=${c.ow} offsetH=${c.oh} visW=${c.w}  transform=${c.t}`);
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0]}`); } finally { await ctx.close(); }
}
await b.close();
