import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);
const estat = () => p.evaluate(() => {
  const tira = document.querySelector('[data-carrusel="1"] > div > div');
  const peces = tira ? tira.querySelectorAll('button').length : 0;
  return { transform: tira ? getComputedStyle(tira).transform : null, peces, ample: tira ? tira.offsetWidth : null };
});
console.log('inici', JSON.stringify(await estat()));
const v2 = await p.$('[data-mega-page-viewport="2"]');
const next = await v2.$('#stripe-guide-right-arrow');
for (let i = 0; i < 3; i++) { await next.click(); await p.waitForTimeout(400); console.log(`next ${i + 1}`, JSON.stringify(await estat())); }
const prev = await v2.$('[aria-label="Anterior"]');
for (let i = 0; i < 2; i++) { await prev.click(); await p.waitForTimeout(400); console.log(`prev ${i + 1}`, JSON.stringify(await estat())); }
// rodeta
const caixa = await v2.$('[data-carrusel="1"] > div');
const bb = await caixa.boundingBox();
await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.mouse.wheel(0, 300);
await p.waitForTimeout(600);
console.log('rodeta', JSON.stringify(await estat()));
// 70 clics (mes d'una volta de 64 peces): el residu no ha de passar del periode
for (let k = 0; k < 70; k++) { await next.click(); }
await p.waitForTimeout(600);
const final = await estat();
console.log('70 clics', JSON.stringify(final), 'periode 2234,5');
console.log('errors', JSON.stringify(errors.slice(0, 3)));
await b.close();
