// TEMPORAL — els dos gaps de la franja de colleccions (selector B/C/N i samarretes).
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1200, 800], [1112, 834], [1024, 768]];

const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const bb = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { t: +x.top.toFixed(2), b: +(x.top + x.height).toFixed(2), l: +x.left.toFixed(1), r: +x.right.toFixed(1) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const enllacos = [...v2.querySelectorAll('[data-colleccions-targeta="1"]')];
      return {
        banda: bb(v2.querySelector('[data-colleccions-franja="1"]')),
        bcn: bb(v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
        columnes: enllacos.length ? { l: +enllacos[0].getBoundingClientRect().left.toFixed(1), b: +enllacos[enllacos.length - 1].getBoundingClientRect().bottom.toFixed(2) } : null,
        stripe: bb(v2.querySelector('[data-stripe-visual-content="2"]')),
        panel: bb(document.querySelector('[data-mega-panel-surface]')),
        colors: bb(v2.querySelector('[data-p2-color-grid]')),
      };
    });
    if (r.banda) {
      const dalt = (r.banda.t - r.bcn.b).toFixed(2);
      const baix = (r.stripe.t - r.banda.b).toFixed(2);
      const daltSelector = (r.bcn.t - r.panel.t).toFixed(2);
      const baixStripe = (r.panel.b - r.stripe.b).toFixed(2);
      console.log(`${w}x${h}  FRANJA  gap selector->franja = ${dalt} px   gap franja->stripe = ${baix} px   | aire sobre el selector = ${daltSelector}   aire sota la stripe = ${baixStripe}  errors=${errors.length}`);
    } else {
      console.log(`${w}x${h}  COLUMNA  (x ${r.columnes.l}, cul ${r.columnes.b})  tinta stripe ${r.stripe.t}  -> gap = ${(r.stripe.t - r.columnes.b).toFixed(2)} px  errors=${errors.length}`);
    }
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
