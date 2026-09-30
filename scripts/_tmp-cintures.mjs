// TEMPORAL — les cintures de la franja de la p2 respecte les vores del carril.
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1680, 1050], [1512, 982], [1440, 900], [1366, 768], [1280, 720], [1024, 768]];
const MARG_ESQ = 65 / 2866;
const COSSOS = 2740 / 2866;

const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { t: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), l: +x.left.toFixed(1), r: +x.right.toFixed(1), h: +x.height.toFixed(1), w: +x.width.toFixed(1) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const vis = v2.querySelector('[data-stripe-visual-content="2"]');
      const img = vis ? vis.querySelector('img') : null;
      const cs = getComputedStyle(document.documentElement);
      return {
        carrilX: +Number.parseFloat(cs.getPropertyValue('--hg-mega-x')).toFixed(1),
        carrilW: +Number.parseFloat(cs.getPropertyValue('--hg-mega-w')).toFixed(1),
        vis: box(vis), img: box(img),
        visVar: vis ? getComputedStyle(vis).transform : null,
        scale: cs.getPropertyValue('--megaStripeScale').trim(),
        factor: cs.getPropertyValue('--hgStripeCarrilFactor').trim(),
        dx: cs.getPropertyValue('--megaStripeDx').trim(),
      };
    });
    const base = r.img || r.vis;
    const cinturaL = base.l + MARG_ESQ * base.w;
    const cinturaR = base.l + (MARG_ESQ + COSSOS) * base.w;
    const carrilR = r.carrilX + r.carrilW;
    console.log(`${w}x${h} carril ${r.carrilX}..${carrilR.toFixed(1)} (${r.carrilW})`);
    console.log(`    franja vis ${JSON.stringify(r.vis)}`);
    console.log(`    img   ${JSON.stringify(r.img)}  scale=${r.scale} dx=${r.dx}`);
    console.log(`    cintures ${cinturaL.toFixed(1)}..${cinturaR.toFixed(1)}  -> esq ${(cinturaL - r.carrilX).toFixed(1)} px, dreta ${(carrilR - cinturaR).toFixed(1)} px`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
