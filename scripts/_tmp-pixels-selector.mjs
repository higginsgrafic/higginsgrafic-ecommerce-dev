// MOSTREIG DE PIXELS DEL SELECTOR DE LA P1 A 1024 (02/10/2026).
// Mira si la pastilla blanca es veu o si la tapa el fons de la peca.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const buf = await p.screenshot({ clip: { x: 884, y: 70, width: 100, height: 100 } });
const png = PNG.sync.read(buf);
const px = (x, y) => {
  const i = (y * png.width + x) * 4;
  return `${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`;
};
console.log('ample', png.width, 'alt', png.height);
for (let y = 0; y < png.height; y += 4) console.log(`y${70 + y}  x20=${px(20, y)}  x50=${px(50, y)}  x80=${px(80, y)}  x95=${px(95, y)}`);
await ctx.close();
await b.close();
