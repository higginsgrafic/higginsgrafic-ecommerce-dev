// TEMPORAL — no es comiteja. La tinta dels dibuixos comença a la primera fila de píxels?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(4500);
const d = await p.evaluate(async () => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const clip = v2.querySelector('[data-carrusel="1"]');
  const graella = clip.querySelector(':scope > div');
  const cTop = clip.getBoundingClientRect().top;
  const peces = [...graella.querySelectorAll('button')];
  const out = [];
  for (const [i, box] of [[0, peces[0]], [1, peces[1]]]) {
    const img = box.querySelector('img');
    if (!img) { out.push({ i, error: 'sense img' }); continue; }
    await img.decode().catch(() => {});
    const cv = document.createElement('canvas');
    cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dades = ctx.getImageData(0, 0, cv.width, Math.min(6, cv.height)).data;
    let primerAmbTinta = null;
    for (let y = 0; y < Math.min(6, cv.height); y += 1) {
      let te = false;
      for (let x = 0; x < cv.width; x += 1) { if (dades[(y * cv.width + x) * 4 + 3] > 8) { te = true; break; } }
      if (te) { primerAmbTinta = y; break; }
    }
    const bb = box.getBoundingClientRect();
    out.push({
      i,
      natural: `${img.naturalWidth}x${img.naturalHeight}`,
      primerAmbTinta,
      topCss: +(bb.top - cTop).toFixed(2),
      alcadaCss: +bb.height.toFixed(2),
      escala: +(bb.height / img.naturalHeight).toFixed(4),
    });
  }
  return { retall: +clip.getBoundingClientRect().height.toFixed(2), out };
});
console.log(`retall=${d.retall}`);
for (const x of d.out) {
  if (x.error) { console.log(`  fila ${x.i}: ${x.error}`); continue; }
  const margeCss = (x.primerAmbTinta * x.escala);
  console.log(`  fila ${x.i}: imatge ${x.natural}  primera fila amb tinta=${x.primerAmbTinta}px naturals (=${margeCss.toFixed(2)} px CSS)  la peça comença a ${x.topCss} del retall -> ${x.topCss < 0 ? `surt ${(-x.topCss).toFixed(2)} px per dalt` : 'dins'}; ${margeCss >= -x.topCss ? 'NOMES es talla marge transparent' : 'ES TALLA TINTA'}`);
}
await b.close();
