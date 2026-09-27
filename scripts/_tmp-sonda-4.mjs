import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const a = bs[0].getBoundingClientRect();
  const c = bs[2].getBoundingClientRect();
  const b1 = bs[1].getBoundingClientRect();
  return { ample: +a.width.toFixed(4), alcada: +a.height.toFixed(4), pas: +(c.left - a.left).toFixed(4), desnivell_files: +(b1.top - a.top).toFixed(4) };
});
console.log(JSON.stringify(r));
await b.close();
