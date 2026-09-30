// TEMPORAL — el bloc de la p2 centrat al megaslide, amb els dos aires de 5 px.
import { chromium } from '@playwright/test';

const VISTES = [[1366, 768], [1300, 800], [1280, 720], [1200, 800], [1180, 820], [1112, 834], [1024, 768], [1440, 900], [1920, 946]];

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
    await p.waitForTimeout(9000);
    const r = await p.evaluate(() => {
      const bb = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { t: +x.top.toFixed(2), b: +(x.top + x.height).toFixed(2), h: +x.height.toFixed(2) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const enllacos = [...v2.querySelectorAll('[data-colleccions-targeta="1"]')];
      return {
        panel: bb(document.querySelector('[data-mega-panel-surface]')),
        banda: bb(v2.querySelector('[data-colleccions-franja="1"]')),
        bcn: bb(v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
        columnes: enllacos.length ? { b: +enllacos[enllacos.length - 1].getBoundingClientRect().bottom.toFixed(2) } : null,
        stripe: bb(v2.querySelector('[data-stripe-visual-content="2"]')),
      };
    });
    if (r.banda) {
      const dalt = (r.bcn.t - r.panel.t).toFixed(2);
      const baix = (r.panel.b - r.stripe.b).toFixed(2);
      const g1 = (r.banda.t - r.bcn.b).toFixed(2);
      const g2 = (r.stripe.t - r.banda.b).toFixed(2);
      const centrat = (r.bcn.t - r.panel.t) - (r.panel.b - r.stripe.b);
      console.log(`${w}x${h}  aire dalt ${dalt}  aire baix ${baix}  (diferencia ${centrat.toFixed(2)})   | gap selector->franja ${g1}  gap franja->stripe ${g2}  errors=${errors.length}`);
    } else {
      console.log(`${w}x${h}  COLUMNA (composicio de sempre)  aire dalt ${(r.bcn.t - r.panel.t).toFixed(2)}  aire baix ${(r.panel.b - r.stripe.b).toFixed(2)}  errors=${errors.length}`);
    }
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
