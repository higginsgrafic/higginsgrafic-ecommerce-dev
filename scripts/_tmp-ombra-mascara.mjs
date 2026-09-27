// TEMPORAL — el bec amb la mascara del contenidor posada i treta.
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
const clip = { x: 1380, y: 240, width: 50, height: 70 };
const mostra = async (et) => {
  const buf = await p.screenshot({ clip });
  const png = PNG.sync.read(buf);
  const px = (x, y) => { const i = (y * png.width + x) * 4; return png.data[i]; };
  let l = '';
  for (let x = 1390; x <= 1414; x += 2) l += `${x}:${px((x - clip.x) * 4, (262 - clip.y) * 4)} `;
  console.log(et.padEnd(16), l);
  await p.screenshot({ path: `_tmp-bec-${et}.png`, clip });
};
await p.evaluate(() => { const o = document.querySelector('[data-maniga-ombra="1"]'); if (o) o.style.display = 'none'; });
await p.waitForTimeout(300);
await mostra('mascara-i');
await p.evaluate(() => {
  const v = document.querySelector('[data-stripe-visual-content="2"]');
  v.style.webkitMaskImage = 'none'; v.style.maskImage = 'none';
});
await p.waitForTimeout(300);
await mostra('sense-mascara');
await ctx.close(); await b.close();
