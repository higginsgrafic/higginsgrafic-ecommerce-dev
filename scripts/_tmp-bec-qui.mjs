// TEMPORAL — qui pinta el bec: combinacions d'ombra i imatge.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 4 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const clip = { x: 1390, y: 255, width: 30, height: 15 };
const mostra = async (et) => {
  const buf = await p.screenshot({ clip });
  const png = PNG.sync.read(buf);
  const px = (x, y) => { const i = (y * png.width + x) * 4; return png.data[i]; };
  console.log(et.padEnd(22), 'x1400:', px((1400 - clip.x) * 4, (262 - clip.y) * 4), ' x1410:', px((1410 - clip.x) * 4, (262 - clip.y) * 4));
};
await mostra('tot');
await p.evaluate(() => { document.querySelector('[data-maniga-ombra="1"]').style.display = 'none'; });
await p.waitForTimeout(300);
await mostra('sense ombra');
await p.evaluate(() => {
  const v = document.querySelector('[data-stripe-visual-content="2"]');
  const t = [...v.querySelectorAll('img')].find((i) => /stripe\.webp/.test(i.getAttribute('src') || ''));
  if (t) t.style.visibility = 'hidden';
});
await p.waitForTimeout(300);
await mostra('sense ombra ni tinta');
await p.evaluate(() => {
  const v = document.querySelector('[data-stripe-visual-content="2"]');
  v.style.webkitMaskImage = 'none'; v.style.maskImage = 'none';
});
await p.waitForTimeout(300);
await mostra('sense res mes (mascara off)');
await ctx.close(); await b.close();
