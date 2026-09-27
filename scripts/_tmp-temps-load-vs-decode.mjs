// TEMPORAL — no es comiteja. `load` vs `decode()` de la precarrega: quin arriba abans?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__d = { inici: null, load: 0, loadDarrer: 0, dec: 0, decDarrer: 0, total: 0, panel: null, rebutjats: 0 };
  const Orig = window.Image;
  window.Image = function (...args) {
    const im = new Orig(...args);
    const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    Object.defineProperty(im, 'src', {
      configurable: true,
      get() { return desc.get.call(im); },
      set(v) {
        const t0 = performance.now();
        if (window.__d.inici == null) window.__d.inici = Math.round(t0);
        window.__d.total += 1;
        im.addEventListener('load', () => {
          window.__d.load += 1;
          window.__d.loadDarrer = Math.max(window.__d.loadDarrer, Math.round(performance.now() - window.__d.inici));
        });
        desc.set.call(im, v);
      },
    });
    const origDecode = im.decode.bind(im);
    im.decode = function () {
      return origDecode().then(
        () => { window.__d.dec += 1; window.__d.decDarrer = Math.max(window.__d.decDarrer, Math.round(performance.now() - window.__d.inici)); },
        () => { window.__d.rebutjats += 1; },
      );
    };
    return im;
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
