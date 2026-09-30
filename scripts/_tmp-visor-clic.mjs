// TEMPORAL: que passa quan es clica una vista del mosaic?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/browser-overlay.html', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(9000);

const estat = () => p.evaluate(() => ({
  activa: document.querySelector('.pestanya.activa')?.textContent?.trim(),
  pestanyes: [...document.querySelectorAll('.pestanya')].map((t) => t.textContent.trim().replace(/\s+/g, ' ')),
  marcs: document.querySelectorAll('.marc').length,
}));
console.log('abans      ', JSON.stringify(await estat()));

// 1) Clic al CENTRE del marc (cau dins de l'iframe)
const caixa = await p.evaluate(() => {
  const m = document.querySelectorAll('.marc')[0];
  if (!m) return null;
  const r = m.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, nom: m.querySelector('.nom')?.textContent };
});
console.log('marc 0     ', JSON.stringify(caixa));
if (caixa) { await p.mouse.click(caixa.x, caixa.y); await p.waitForTimeout(1500); }
console.log('despres clic centre', JSON.stringify(await estat()));

// 2) Clic a l'ETIQUETA (fora de l'iframe)
const et = await p.evaluate(() => {
  const e = document.querySelectorAll('.marc')[0]?.querySelector('.etiqueta .nom');
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
if (et) { await p.mouse.click(et.x, et.y); await p.waitForTimeout(1500); }
console.log('despres clic etiqueta', JSON.stringify(await estat()));

await ctx.close();
await b.close();
