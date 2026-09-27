// TEMPORAL — el pixel renderitzat de la franja de la p1 contra el mateix pixel
// de la imatge original (dibuixada en un canvas a la mateixa mida).
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => { const v = document.querySelector('[data-mega-page-viewport="1"]'); let t = v.parentElement; while (t && (t.style && t.style.width !== '400%')) t = t.parentElement; if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; } });
await p.waitForTimeout(600);
const info = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  const img = [...f.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').includes('full-color-stripe') || (i.getAttribute('src') || '').includes('full-white-stripe'));
  const r = img.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height, src: img.getAttribute('src') };
});
const buf = await p.screenshot({ clip: { x: info.x, y: info.y, width: info.w, height: info.h } });
const png = PNG.sync.read(buf);
// el mateix pixel, del fitxer
const fitxer = await p.evaluate(async (dades) => {
  const im = new Image();
  im.src = dades.src;
  await im.decode();
  const c = document.createElement('canvas');
  c.width = Math.round(dades.w); c.height = Math.round(dades.h);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  g.drawImage(im, 0, 0, c.width, c.height);
  const px = (x, y) => { const d = g.getImageData(Math.round(x), Math.round(y), 1, 1).data; return [d[0], d[1], d[2]]; };
  return { ample: [c.width, c.height], natural: [im.naturalWidth, im.naturalHeight], punts: [[33, 50], [106, 50], [140, 50], [160, 80]].map(([x, y]) => ({ xy: [x, y], canvas: px(x, y) })) };
}, { src: info.src, w: Math.round(info.w), h: Math.round(info.h) });
console.log('img', info.w + 'x' + info.h, 'natural', JSON.stringify(fitxer.natural), 'canvas', JSON.stringify(fitxer.ample));
const esc = png.width / info.w;
const px = (x, y) => { const i = (Math.round(y * esc) * png.width + Math.round(x * esc)) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
for (const q of fitxer.punts) {
  console.log(`punt ${JSON.stringify(q.xy)}  render ${JSON.stringify(px(q.xy[0], q.xy[1]))}  fitxer ${JSON.stringify(q.canvas)}`);
}
await ctx.close(); await b.close();
