// TEMPORAL — no es comiteja. On cauen les dues files DINS del retall, i que s'hi talla?
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
  const cb = clip.getBoundingClientRect();
  const gb = graella.getBoundingClientRect();
  const bar = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const sb = bar.getBoundingClientRect();
  const peces = [...graella.querySelectorAll('button')];
  const files = [[], []];
  peces.forEach((x, i) => files[i % 2].push(x));
  // El retall DE DEBÒ es l'intern (`overflow: hidden`), no el contenidor.
  const gb2 = graella.getBoundingClientRect();
  const rc = (el) => { const b2 = el.getBoundingClientRect(); return { top: +(b2.top - gb2.top).toFixed(2), bottom: +(b2.bottom - gb2.top).toFixed(2), topContenidor: +(b2.top - cb.top).toFixed(2) }; };
  // Fins on arriba la tinta de cada fitxer (a dalt i a baix), en px naturals
  const marges = async (img) => {
    await img.decode().catch(() => {});
    const cv = document.createElement('canvas');
    cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    cv.getContext('2d').drawImage(img, 0, 0);
    const alfa = (y) => { const d2 = cv.getContext('2d').getImageData(0, y, cv.width, 1).data; for (let x = 0; x < cv.width; x += 1) if (d2[x * 4 + 3] > 8) return true; return false; };
    let dalt = 0; while (dalt < cv.height && !alfa(dalt)) dalt += 1;
    let baix = 0; while (baix < cv.height && !alfa(cv.height - 1 - baix)) baix += 1;
    return { dalt, baix, natural: cv.height };
  };
  const out = [];
  for (const [i, box] of peces.entries()) {
    const bb = box.getBoundingClientRect();
    if (bb.left < cb.left || bb.right > cb.right) continue;
    const img = box.querySelector('img');
    const r = rc(box);
    out.push({ i, fila: i % 2, et: box.getAttribute('title'), retall: +(box.getBoundingClientRect().height).toFixed(2), ...r, escala: img ? +(bb.height / img.naturalHeight).toFixed(4) : null, marges: img ? await marges(img) : null });
  }
  return {
    clip: { alt: +gb2.height.toFixed(2), top: +gb2.top.toFixed(2), contenidorTop: +cb.top.toFixed(2), contenidorAlt: +cb.height.toFixed(2) },
    inner: { alt: +gb.height.toFixed(2), top: +(gb.top - cb.top).toFixed(2) },
    selector: { altura: +sb.height.toFixed(2), cel: +(sb.height / 3).toFixed(2) },
    out,
  };
});
console.log(`retall (intern): alt=${d.clip.alt}  top=${d.clip.top}  | contenidor: alt=${d.clip.contenidorAlt} top=${d.clip.contenidorTop}`);
console.log(`selector B/N/C: alt=${d.selector.altura} cel·la=${d.selector.cel}`);
for (const x of d.out.filter((y) => y.fila === 0).slice(0, 3)) {
  const tallatDalt = Math.max(0, -x.top) * (x.escala || 1);
  const tallatBaix = Math.max(0, x.bottom - d.clip.alt) * (x.escala || 1);
  console.log(`  fila 0 [${x.i}] ${String(x.et).slice(0, 16).padEnd(16)} top=${x.top} bottom=${x.bottom} | marge tinta dalt=${x.marges?.dalt}px nat, baix=${x.marges?.baix}px nat | tallat dalt=${tallatDalt.toFixed(2)}px CSS (tinta=${((x.marges?.dalt || 0) * (x.escala || 1)).toFixed(2)}) baix=${tallatBaix.toFixed(2)}px`);
}
for (const x of d.out.filter((y) => y.fila === 1).slice(0, 3)) {
  const tallatDalt = Math.max(0, -x.top) * (x.escala || 1);
  const tallatBaix = Math.max(0, x.bottom - d.clip.alt) * (x.escala || 1);
  console.log(`  fila 1 [${x.i}] ${String(x.et).slice(0, 16).padEnd(16)} top=${x.top} bottom=${x.bottom} | marge tinta dalt=${x.marges?.dalt}px nat, baix=${x.marges?.baix}px nat | tallat dalt=${tallatDalt.toFixed(2)}px CSS (tinta=${((x.marges?.dalt || 0) * (x.escala || 1)).toFixed(2)}) baix=${tallatBaix.toFixed(2)}px`);
}
await b.close();
