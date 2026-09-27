// TEMPORAL — el bec de la maniga AMB i SENSE l'ombra.
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
const mostra = async (etiqueta) => {
  const buf = await p.screenshot({ clip });
  const png = PNG.sync.read(buf);
  const px = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
  for (const y of [262, 270, 278, 286, 294]) {
    let l = '';
    for (let x = 1394; x <= 1412; x += 2) l += `${x}:${px((x - clip.x) * 4, (y - clip.y) * 4)} `;
    console.log(etiqueta.padEnd(6), 'y=' + y, l);
  }
  await p.screenshot({ path: `_tmp-ombra-${etiqueta}.png`, clip });
};
await mostra('amb');
await p.evaluate(() => { const o = document.querySelector('[data-maniga-ombra="1"]'); if (o) o.style.visibility = 'hidden'; });
await p.waitForTimeout(400);
await mostra('sense');
await ctx.close(); await b.close();
