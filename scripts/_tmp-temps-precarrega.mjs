// TEMPORAL — no es comiteja. Quan acaben de baixar les imatges i quan es munta el panell?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__t = { panel: null, firstGraella: null };
  const mira = () => {
    const p = document.querySelector('[data-mega-panel-surface="1"]');
    if (p && window.__t.panel == null) window.__t.panel = Math.round(performance.now());
    const g = document.querySelector('[data-carrusel="1"] > div');
    if (g && window.__t.firstGraella == null) {
      const btns = [...g.querySelectorAll('button img')];
      window.__t.firstGraella = {
        t: Math.round(performance.now()),
        total: btns.length,
        ok: btns.filter((i) => i.naturalWidth > 0).length,
      };
    }
    if (window.__t.firstGraella == null) requestAnimationFrame(() => window.setTimeout(mira, 0));
  };
  requestAnimationFrame(() => window.setTimeout(mira, 0));
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const recs = performance.getEntriesByType('resource')
    .filter((e) => /images_grid_trim|images_stripe|full-white-stripe/.test(e.name));
  const perCarpeta = {};
  for (const e of recs) {
    const k = /images_grid_trim/.test(e.name) ? 'grid_trim' : (/images_stripe/.test(e.name) ? 'stripe' : 'base');
    perCarpeta[k] = perCarpeta[k] || { n: 0, darrer: 0 };
    perCarpeta[k].n += 1;
    perCarpeta[k].darrer = Math.max(perCarpeta[k].darrer, Math.round(e.responseEnd));
  }
  return { t: window.__t, perCarpeta };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
