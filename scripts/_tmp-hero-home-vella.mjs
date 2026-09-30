// TEMPORAL: on cau la hero de la HOME VELLA (`/`), que es la que surt al mosaic.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 766], [1366, 634], [1280, 586]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(6000);
  const d = await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('Barreja'));
    const hero = btn ? btn.parentElement : null;
    const r = hero ? hero.getBoundingClientRect() : null;
    const vh = window.innerHeight;
    return {
      trobat: !!hero,
      hero: r ? `${+r.left.toFixed(1)}..${+r.right.toFixed(1)} x ${+r.top.toFixed(1)}..${+r.bottom.toFixed(1)} (${+r.width.toFixed(1)}x${+r.height.toFixed(1)})` : null,
      baix: r ? +(vh - r.bottom).toFixed(1) : null,
      vh,
      alcadaDoc: document.documentElement.scrollHeight,
    };
  });
  console.log(`${w}x${h}`.padEnd(10), 'hero', String(d.hero).padEnd(46), 'baix a', String(d.baix).padStart(7), 'px   (vh', d.vh + ', doc', d.alcadaDoc + ')');
  await ctx.close();
}
await b.close();
