// TEMPORAL — espai que quedaria si es centra el bloc de la p2 al megaslide.
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1680, 1050], [1512, 982], [1440, 900], [1366, 768], [1280, 720], [1200, 800], [1112, 834], [1024, 768]];

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
      const bb = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { t: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const enllacos = [...v2.querySelectorAll('[data-colleccions-targeta="1"]')];
      return {
        panel: bb(document.querySelector('[data-mega-panel-surface]')),
        graella: bb(v2.querySelector('[data-carrusel="1"]')),
        colors: bb(v2.querySelector('[data-p2-color-grid]')),
        banda: bb(v2.querySelector('[data-colleccions-franja="1"]')),
        columnes: enllacos.length ? { t: +enllacos[0].getBoundingClientRect().top.toFixed(1), b: +enllacos[enllacos.length - 1].getBoundingClientRect().bottom.toFixed(1) } : null,
        stripe: bb(v2.querySelector('[data-stripe-visual-content="2"]')),
      };
    });
    const espai = r.stripe.t - r.panel.t;
    const dalt = r.graella.t - r.panel.t;
    const baix = r.stripe.t - r.graella.t; // referencia: tot l'espai fins a la tinta
    const ambColleccions = Math.max(r.colors.b, r.banda ? r.banda.b : -Infinity, r.columnes ? r.columnes.b : -Infinity);
    const senseColleccions = Math.max(r.colors.b, r.banda ? r.banda.b : -Infinity);
    const f = (peu) => ((espai - (peu - r.graella.t)) / 2);
    console.log(`${w}x${h}  espai interior ${espai.toFixed(1)} px (${dalt.toFixed(1)} dalt / ${baix.toFixed(1)} fins a la tinta)`);
    console.log(`     AMB colleccions (peu ${ambColleccions.toFixed(1)}, alçada ${(ambColleccions - r.graella.t).toFixed(1)}): centrat -> ${f(ambColleccions).toFixed(1)} px a dalt i a baix`);
    console.log(`     SENSE colleccions (peu ${senseColleccions.toFixed(1)}, alçada ${(senseColleccions - r.graella.t).toFixed(1)}): centrat -> ${f(senseColleccions).toFixed(1)} px a dalt i a baix`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
