// TEMPORAL — el contorn de la maniga sobre el selector: per a cada alcada, on
// acaba la tinta blanca de la samarreta i comenca el gris de la columna.
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
const clip = { x: 1370, y: 235, width: 90, height: 125 };
const buf = await p.screenshot({ clip });
const png = PNG.sync.read(buf);
const px = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
const esGris = (c) => Math.abs(c[0] - 243) <= 3 && Math.abs(c[1] - 244) <= 3 && Math.abs(c[2] - 246) <= 3;
const esBlanc = (c) => c[0] >= 248 && c[1] >= 248 && c[2] >= 248;
console.log('alcada -> ultim x blanc (tinta) | primer x gris (columna)');
for (let y = 240; y <= 355; y += 5) {
  let ultimBlanc = null; let primerGris = null;
  for (let x = 1370; x <= 1460; x++) {
    const c = px(Math.round((x - clip.x) * 4), Math.round((y - clip.y) * 4));
    if (esBlanc(c)) ultimBlanc = x;
    if (esGris(c) && primerGris === null) primerGris = x;
  }
  console.log(`y=${y}  blanc fins a ${ultimBlanc ?? '-'}   gris des de ${primerGris ?? '-'}`);
}
await p.screenshot({ path: '_tmp-maniga-contorn.png', clip });
console.log('desat _tmp-maniga-contorn.png (x1370..1460, y235..360)');
await ctx.close();
await b.close();
