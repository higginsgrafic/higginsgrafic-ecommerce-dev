// TEMPORAL — no es comiteja. A3: comparativa amb l'ombra activada i desactivada.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const clip = { x: 1395, y: 250, width: 20, height: 20 };
await p.screenshot({ path: '_tmp-a3-on.png', clip });
await p.evaluate(() => { document.querySelector('[data-maniga-ombra="1"]').style.display = 'none'; });
await p.waitForTimeout(300);
await p.screenshot({ path: '_tmp-a3-off.png', clip });
await ctx.close();
await b.close();
for (const nom of ['_tmp-a3-on.png', '_tmp-a3-off.png']) {
  const img = PNG.sync.read(readFileSync(nom));
  const { width, data } = img;
  const fila = [];
  for (let x = 0; x < width; x += 1) {
    const i = (5 * width + x) * 4;
    fila.push(`${(1395 + x / 3).toFixed(1)}:${data[i]}`);
  }
  console.log(nom, fila.join(' '));
}
