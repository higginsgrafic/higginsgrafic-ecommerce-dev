// TEMPORAL — no es comiteja. Quines peces VISIBLES perden tinta per dalt?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(4500);
  const d = await p.evaluate(async () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const clip = v2.querySelector('[data-carrusel="1"]');
    const graella = clip.querySelector(':scope > div');
    const cb = clip.getBoundingClientRect();
    const peces = [...graella.querySelectorAll('button')];
    const out = [];
    for (const [i, box] of peces.entries()) {
      const bb = box.getBoundingClientRect();
      // Nomes les que es veuen de ple dins el retall
      if (bb.left < cb.left || bb.right > cb.right) continue;
      const img = box.querySelector('img');
      if (!img) { out.push({ i, et: box.getAttribute('title'), fila: i % 2, senseImg: true }); continue; }
      await img.decode().catch(() => {});
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const files = Math.min(4, cv.height);
      const dades = ctx.getImageData(0, 0, cv.width, files).data;
      let primera = null;
      for (let y = 0; y < files; y += 1) {
        for (let x = 0; x < cv.width; x += 1) { if (dades[(y * cv.width + x) * 4 + 3] > 8) { primera = y; break; } }
        if (primera !== null) break;
      }
      out.push({ i, et: box.getAttribute('title'), fila: i % 2, natural: `${img.naturalWidth}x${img.naturalHeight}`, primera, topRel: +(bb.top - cb.top).toFixed(2), escala: +(bb.height / img.naturalHeight).toFixed(4) });
    }
    return { retall: +cb.height.toFixed(2), out };
  });
  console.log(`--- ${w}x${h}  retall=${d.retall}`);
  for (const x of d.out) {
    if (x.fila !== 0) continue;
    if (x.senseImg) { console.log(`  [${x.i}] ${x.et}: sense imatge (etiqueta)`); continue; }
    const marge = x.primera * x.escala;
    console.log(`  [${x.i}] ${String(x.et).slice(0, 22).padEnd(22)} img ${x.natural} tinta a ${x.primera}px nat (${marge.toFixed(2)} CSS)  top=${x.topRel}  ${marge >= -x.topRel ? 'ok (nomes marge)' : 'TALLADA'}`);
  }
  await p.close();
}
await b.close();
