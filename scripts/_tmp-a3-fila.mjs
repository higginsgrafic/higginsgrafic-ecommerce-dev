// TEMPORAL — no es comiteja. A3: una fila de pixels de la costura, amb l'ombra
// activada i desactivada, i quin element hi pinta.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
await p.screenshot({ path: '_tmp-a3-fi-on.png', clip: { x: 1398, y: 250, width: 12, height: 1 } });
await p.evaluate(() => { document.querySelector('[data-maniga-ombra="1"]').style.display = 'none'; });
await p.waitForTimeout(300);
await p.screenshot({ path: '_tmp-a3-fi-off.png', clip: { x: 1398, y: 250, width: 12, height: 1 } });
await ctx.close();
await b.close();
for (const nom of ['_tmp-a3-fi-on.png', '_tmp-a3-fi-off.png']) {
  const img = PNG.sync.read(readFileSync(nom));
  const { width, data } = img;
  const fila = [];
  for (let x = 0; x < width; x += 1) {
    const i = x * 4;
    fila.push(`${1398 + x}:${data[i]}`);
  }
  console.log(nom, fila.join(' '));
}
