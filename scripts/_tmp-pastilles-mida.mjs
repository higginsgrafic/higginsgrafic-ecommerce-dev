// TEMPORAL — totes les pastilles dels selectors: la mateixa mida?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1024, 768]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(7000);
  const r = await p.evaluate(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const mida = (el) => (el ? [+el.getBoundingClientRect().width.toFixed(2), +el.getBoundingClientRect().height.toFixed(2)] : null);
    const pillDe = (root, ampleMax) => [...root.querySelectorAll('span[aria-hidden="true"]')].find((s) => {
      const x = s.getBoundingClientRect();
      return x.width > 0 && x.height > 10 && (!ampleMax || x.width < ampleMax);
    });
    const banda = v2.querySelector('[data-colleccions-franja="1"]');
    const bcn2 = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const bcn1 = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
    return {
      franja: mida(banda ? banda.querySelector('[aria-current="true"]') : null),
      bcn2: mida(pillDe(v2, bcn2 ? bcn2.getBoundingClientRect().width : null)),
      bcn1: mida(pillDe(v1, bcn1 ? bcn1.getBoundingClientRect().width : null)),
    };
  });
  console.log(`${w}x${h}  tira ${JSON.stringify(r.franja)}  bcn2 ${JSON.stringify(r.bcn2)}  bcn1 ${JSON.stringify(r.bcn1)}  errors=${errors.length}`);
  await ctx.close();
}
await b.close();
