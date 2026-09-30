import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const c = document.querySelector('[data-hero-caixa="1"]');
  const x = c.getBoundingClientRect();
  const f = c.querySelector('[data-franja="1"]').getBoundingClientRect();
  return { x: Math.max(0, Math.round(x.left) - 6), y: Math.max(0, Math.round(x.top) - 6), width: Math.round(x.width) + 12, height: Math.round(x.height) + 12, franjaH: +f.height.toFixed(2) };
});
await p.screenshot({ path: `/tmp/hero-${w}.png`, clip: { x: r.x, y: r.y, width: r.width, height: r.height } });
console.log(`/tmp/hero-${w}.png`, JSON.stringify(r));
await ctx.close(); await b.close();
