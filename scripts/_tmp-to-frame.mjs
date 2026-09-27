// TEMPORAL — no es comiteja. El fitxer de cada color es el dibuix que diu? Es
// compara el to dominant (H) i la saturacio del dibuix de la graella i del
// fitxer de la franja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 120000 });
const r = await p.evaluate(async () => {
  const to = async (url) => new Promise((res) => {
    const i = new Image();
    i.onload = () => {
      const c = document.createElement('canvas');
      c.width = i.naturalWidth; c.height = i.naturalHeight;
      const x = c.getContext('2d');
      x.drawImage(i, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let n = 0, sr = 0, sg = 0, sb = 0;
      // Nome's els pixels amb color (ni blanc ni negre).
      for (let k = 0; k < d.length; k += 4) {
        const R = d[k], G = d[k + 1], B = d[k + 2], A = d[k + 3];
        if (A < 40) continue;
        const max = Math.max(R, G, B), min = Math.min(R, G, B);
        if (max > 240 && min > 230) continue;
        if (max < 40) continue;
        if (max - min < 25) continue;
        sr += R; sg += G; sb += B; n++;
      }
      if (!n) return res({ n: 0 });
      const R = sr / n, G = sg / n, B = sb / n;
      const max = Math.max(R, G, B), min = Math.min(R, G, B);
      let h = 0;
      if (max === R) h = ((G - B) / (max - min)) % 6;
      else if (max === G) h = (B - R) / (max - min) + 2;
      else h = (R - G) / (max - min) + 4;
      h = Math.round(((h * 60) + 360) % 360);
      res({ n, h, s: Math.round(((max - min) / max) * 100), rgb: `${Math.round(R)},${Math.round(G)},${Math.round(B)}` });
    };
    i.onerror = () => res({ n: 0, err: true });
    i.src = url;
  });
  const grid = '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/';
  const str = '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/';
  const out = {};
  for (const c of ['yellow', 'red', 'fuchsia', 'blue']) {
    out[c] = {
      graella: await to(`${grid}${c}-frame-grid.webp`),
      franja: await to(`${str}${c}-frame-stripe.webp`),
    };
  }
  return out;
});
const nom = (h) => (h === undefined ? '?' : h < 15 || h >= 345 ? 'VERMELL' : h < 45 ? 'TARONJA' : h < 70 ? 'GROC' : h < 160 ? 'VERD' : h < 200 ? 'CYAN' : h < 260 ? 'BLAU' : h < 320 ? 'LILA/MAGENTA' : 'ROSA/VERMELL');
for (const [c, v] of Object.entries(r)) {
  console.log(c.padEnd(9),
    'graella', JSON.stringify(v.graella), nom(v.graella.h),
    '| franja', JSON.stringify(v.franja), nom(v.franja.h));
}
await b.close();
