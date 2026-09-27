// TEMPORAL — el vel sobre una samarreta ACTIVA: hi es?
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
// TRIO EL COLOR com a la captura de l'amo (light-blue)
const c = await p.evaluate(() => {
  const b = [...document.querySelectorAll('[data-color-barra]')].find((x) => x.getAttribute('data-color-barra') === 'light-blue');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1200); }
const rect = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const f = v.querySelector('[data-stripe-visual-content="2"]').getBoundingClientRect();
  return { x: f.left, y: f.top, w: f.width, h: f.height };
});
const mostra = async (et) => {
  const buf = await p.screenshot({ clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h } });
  const png = PNG.sync.read(buf);
  const px = (cx, cy) => { const i = (Math.round(cy * 2) * png.width + Math.round(cx * 2)) * 4; return png.data[i]; };
  // cases actives: 3..9; el cos a la cintura (y ~ 78 % de l'alcada)
  const img = (xu) => xu / 2866 * rect.w;
  let l = '';
  for (const k of [3, 5, 7, 9]) l += `casa${k}:${px(img(196.9 * (k - 1) + 150), rect.h * 0.78)} `;
  // i una de velada (casa 1)
  l += `casa1(velada):${px(img(260.76 + 90), rect.h * 0.78)}`;
  console.log(et.padEnd(12), l);
};
await mostra('amb vel');
await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const f = v.querySelector('[data-stripe-visual-content="2"]');
  for (const im of f.querySelectorAll('img')) {
    if ((im.getAttribute('src') || '').startsWith('data:image/svg+xml')) im.style.visibility = 'hidden';
  }
});
await p.waitForTimeout(300);
await mostra('sense vel');
await ctx.close(); await b.close();
