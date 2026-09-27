// TEMPORAL — la punta de la maniga, a la pantalla i a la imatge, al mateix lloc.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 6 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const c = await p.evaluate(() => {
  const b2 = [...document.querySelectorAll('[data-color-barra]')].find((x) => x.getAttribute('data-color-barra') === 'light-blue');
  if (!b2) return null;
  const r = b2.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1200); }
await p.screenshot({ path: '_tmp-bec-pantalla.png', clip: { x: 1385, y: 236, width: 40, height: 60 } });
console.log('desat _tmp-bec-pantalla.png (x1385..1425, y236..296, 6x)');
// la imatge, el mateix tros: x = 1385 -> imatge (1385-357.9)/1055.1*2866
const i0 = Math.round((1385 - 357.9) / 1055.1 * 2866);
const i1 = Math.round((1425 - 357.9) / 1055.1 * 2866);
const j0 = Math.round((236 - 241.5) / 113 * 307);
const j1 = Math.round((296 - 241.5) / 113 * 307);
const data = await p.evaluate(async (d) => {
  const im = new Image();
  im.src = '/placeholders/cercador/full-white-stripe.webp';
  await im.decode();
  const cv = document.createElement('canvas');
  cv.width = d.x1 - d.x0; cv.height = d.y1 - d.y0;
  const g = cv.getContext('2d');
  g.fillStyle = '#ff00ff'; g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(im, d.x0, d.y0, cv.width, cv.height, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/png');
}, { x0: i0, x1: i1, y0: j0, y1: j1 });
const { writeFileSync } = await import('node:fs');
writeFileSync('_tmp-bec-imatge2.png', Buffer.from(data.split(',')[1], 'base64'));
console.log(`desat _tmp-bec-imatge2.png (imatge x${i0}..${i1}, y${j0}..${j1})`);
await ctx.close(); await b.close();
