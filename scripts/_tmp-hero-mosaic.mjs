// TEMPORAL: radiografia del mosaic `browser-overlay.html`.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/browser-overlay.html', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(15000);
const resum = await p.evaluate(() => {
  const iframes = [...document.querySelectorAll('iframe')];
  return {
    quantsIframes: iframes.length,
    marcs: [...document.querySelectorAll('[data-fmt], .marc, [class*=marc]')].length,
    srcs: iframes.map((f) => f.getAttribute('src')),
  };
});
console.log(JSON.stringify(resum, null, 1));
const detall = await p.evaluate(() => [...document.querySelectorAll('iframe')].map((f, i) => {
  const out = { i, src: f.getAttribute('src') };
  try {
    const doc = f.contentDocument; const win = doc?.defaultView;
    const c = doc?.querySelector('[data-hero-caixa="1"]');
    const nou = !!doc?.querySelector('[data-taula-inici="1"]');
    const btn = [...(doc?.querySelectorAll('button') || [])].find((x) => (x.getAttribute('aria-label') || '').includes('Barreja'));
    const vella = btn ? btn.parentElement : null;
    const r = (c || vella)?.getBoundingClientRect();
    const vh = win?.innerHeight;
    out.nou = nou; out.quin = c ? 'nova' : (vella ? 'vella' : '?');
    out.hero = r ? `${+r.top.toFixed(1)}..${+r.bottom.toFixed(1)}` : null;
    out.vh = vh;
    out.baix = r && vh ? +(vh - r.bottom).toFixed(1) : null;
  } catch (e) { out.error = e.message; }
  return out;
}));
console.table(detall);
await ctx.close();
await b.close();
