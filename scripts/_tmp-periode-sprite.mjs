// TEMPORAL — no es comiteja. El periode exacte del dibuix de la franja: coincideix
// la imatge desplacada mig periode amb ella mateixa?
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);

const r = await p.evaluate(async () => {
  const carrega = async (src) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    return { d: g.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
  };
  const compara = (a, b, desplac) => {
    // Compara a[x] amb b[x + desplac] a totes les files
    let iguals = 0; let total = 0; let difMax = 0;
    for (let y = 0; y < a.h; y += 2) {
      for (let x = 0; x < a.w - desplac; x += 3) {
        const ia = (y * a.w + x) * 4;
        const ib = (y * b.w + x + desplac) * 4;
        total++;
        const d = Math.abs(a.d[ia] - b.d[ib]) + Math.abs(a.d[ia + 1] - b.d[ib + 1]) + Math.abs(a.d[ia + 2] - b.d[ib + 2]) + Math.abs(a.d[ia + 3] - b.d[ib + 3]);
        if (d === 0) iguals++;
        if (d > difMax) difMax = d;
      }
    }
    return { pct: +(100 * iguals / total).toFixed(2), difMax };
  };
  const out = {};
  for (const [nom, src] of [
    ['white (p2)', '/placeholders/cercador/full-white-stripe.webp'],
    ['color (p1)', '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp'],
  ]) {
    const im = await carrega(src);
    const w = im.w;
    out[nom] = {
      mida: [w, im.h],
      '1/14': compara(im, im, Math.round(w / 14)),
      '2/14': compara(im, im, Math.round(w * 2 / 14)),
      '7/14': compara(im, im, Math.round(w / 2)),
      '1px': compara(im, im, 1),
      '0 (control)': compara(im, im, 0),
    };
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
