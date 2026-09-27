// TEMPORAL — la punta de la maniga de l'ultima samarreta: on acaba la tinta i on
// acaba la imatge.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const r = await p.evaluate(async () => {
  const out = {};
  for (const [nom, url] of [
    ['color (p1)', '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp'],
    ['white (p2)', '/placeholders/cercador/full-white-stripe.webp'],
  ]) {
    const im = new Image();
    im.src = url;
    await im.decode();
    const W = im.naturalWidth; const H = im.naturalHeight;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, W, H).data;
    const lum = (x, y) => { const i = (y * W + x) * 4; return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; };
    // tinta = lluminositat < 252 (el fons es 255)
    const alcades = [40, 60, 76, 90, 120, 150, 250];
    const dreta = {};
    for (const y of alcades) {
      let ultim = -1;
      for (let x = W - 1; x >= 0; x--) { if (lum(x, y) < 252) { ultim = x; break; } }
      dreta['y' + y] = ultim;
    }
    out[nom] = { mida: [W, H], ultimPixelDeTinta: dreta, darreraColumna: W - 1 };
  }
  return out;
});
for (const [nom, v] of Object.entries(r)) {
  console.log(nom, JSON.stringify(v.mida));
  console.log('   ultim pixel amb tinta:', JSON.stringify(v.ultimPixelDeTinta));
}
await ctx.close(); await b.close();
