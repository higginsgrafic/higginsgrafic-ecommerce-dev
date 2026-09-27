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
    const c = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const px = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
    let amin = 255; let amax = 0;
    for (let i = 3; i < d.length; i += 4) { if (d[i] < amin) amin = d[i]; if (d[i] > amax) amax = d[i]; }
    out[nom] = { mida: [c.width, c.height], alfaMin: amin, alfaMax: amax, punts: [[288, 136], [380, 136], [435, 200], [90, 136]].map(([x, y]) => ({ xy: [x, y], rgba: px(x, y) })) };
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
