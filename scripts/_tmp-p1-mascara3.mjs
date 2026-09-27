// TEMPORAL — la mascara del contenidor de la p1: quina alfa te a cada punt?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(async () => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  const pare = f.parentElement;
  const cs = getComputedStyle(pare);
  const m = cs.maskImage || cs.webkitMaskImage;
  const url = m.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
  const box = f.getBoundingClientRect();
  const im = new Image();
  im.src = url;
  await im.decode();
  const c = document.createElement('canvas');
  c.width = Math.round(box.width); c.height = Math.round(box.height);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(im, 0, 0, c.width, c.height);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const alfa = (x, y) => d[(Math.round(y) * c.width + Math.round(x)) * 4 + 3];
  const rgb = (x, y) => { const i = (Math.round(y) * c.width + Math.round(x)) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
  return {
    mask: url.slice(0, 60),
    size: cs.maskSize, mode: cs.maskMode,
    mida: [c.width, c.height],
    punts: [[33, 50], [106, 50], [140, 50], [160, 80], [500, 50]].map(([x, y]) => ({ xy: [x, y], rgba: rgb(x, y) })),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
