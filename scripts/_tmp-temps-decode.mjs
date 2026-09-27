// TEMPORAL — no es comiteja. Quant triga a resoldre's el `decode()` de la precarrega?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__d = { inici: null, fets: 0, total: 0, darrer: null, panel: null, rebutjats: 0 };
  const orig = HTMLImageElement.prototype.decode;
  HTMLImageElement.prototype.decode = function () {
    const t0 = performance.now();
    if (window.__d.inici == null) window.__d.inici = Math.round(t0);
    window.__d.total += 1;
    return orig.call(this).then(
      () => { window.__d.fets += 1; window.__d.darrer = Math.round(performance.now() - window.__d.inici); },
      () => { window.__d.rebutjats += 1; },
    );
  };
  const mira = () => {
    if (window.__d.panel == null) {
      const p = document.querySelector('[data-mega-panel-surface="1"]');
      if (p) window.__d.panel = Math.round(performance.now() - (window.__d.inici || 0));
    }
    if (window.__d.panel == null) requestAnimationFrame(() => window.setTimeout(mira, 0));
  };
  requestAnimationFrame(() => window.setTimeout(mira, 0));
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
console.log(JSON.stringify(await p.evaluate(() => window.__d)));
await b.close();
