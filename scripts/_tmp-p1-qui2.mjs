// TEMPORAL — la p1: qui aclareix les samarretes. Es proven les capes una a una.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
const rect = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]').getBoundingClientRect();
  return { x: f.left, y: f.top, width: f.width, height: f.height };
});
const mostra = async (et) => {
  const buf = await p.screenshot({ clip: rect });
  const png = PNG.sync.read(buf);
  const px = (x, y) => png.data[(y * png.width + x) * 4];
  console.log(et.padEnd(26), 'casa0(100,150):', px(100, 150), 'casa1(320,150):', px(320, 150), 'casa2(420,150):', px(420, 150));
};
await mostra('tot');
// 1) fora la mascara del contenidor
await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  f.style.webkitMaskImage = 'none'; f.style.maskImage = 'none';
});
await p.waitForTimeout(300);
await mostra('sense mascara');
// 2) fora la capa de dibuixos
await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const capa = [...v.querySelectorAll('div')].find((d) => { const c = getComputedStyle(d); return (c.clipPath || 'none') !== 'none' && d.querySelector('img'); });
  if (capa) capa.style.visibility = 'hidden';
});
await p.waitForTimeout(300);
await mostra('sense dibuixos');
// 3) fora la imatge de la franja
await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  const t = [...f.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').includes('full-color-stripe') || (i.getAttribute('src') || '').includes('full-white-stripe'));
  if (t) t.style.visibility = 'hidden';
});
await p.waitForTimeout(300);
await mostra('sense tinta');
await ctx.close(); await b.close();
