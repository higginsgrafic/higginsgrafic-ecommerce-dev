// TEMPORAL — no es comiteja. Quins colors conte cada fitxer de marc? Es mostreja
// el centre (on hi ha el dibuix) i es llisten els colors mes frequents.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 120000 });
const r = await p.evaluate(async () => {
  const analitza = async (url) => new Promise((res) => {
    const i = new Image();
    i.onload = () => {
      const c = document.createElement('canvas');
      c.width = i.naturalWidth; c.height = i.naturalHeight;
      const x = c.getContext('2d');
      x.drawImage(i, 0, 0);
      // Zona central (on hi ha el dibuix): el 60% central.
      const x0 = Math.floor(c.width * 0.2), y0 = Math.floor(c.height * 0.2);
      const w = Math.floor(c.width * 0.6), h = Math.floor(c.height * 0.6);
      const d = x.getImageData(x0, y0, w, h).data;
      const comptes = new Map();
      for (let k = 0; k < d.length; k += 4) {
        const R = d[k], G = d[k + 1], B = d[k + 2], A = d[k + 3];
        if (A < 60) continue;
        const max = Math.max(R, G, B), min = Math.min(R, G, B);
        if (max > 240 && min > 228) continue;
        if (max - min < 30) continue;
        const q = `${Math.round(R / 24) * 24},${Math.round(G / 24) * 24},${Math.round(B / 24) * 24}`;
        comptes.set(q, (comptes.get(q) || 0) + 1);
      }
      const top = [...comptes.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, 4);
      const total = [...comptes.values()].reduce((a, b2) => a + b2, 0);
      res({ total, top: top.map(([rgb, n]) => `${rgb} (${Math.round((n / total) * 100)}%)`) });
    };
    i.onerror = () => res({ err: true });
    i.src = url;
  });
  const base = '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/';
  const out = {};
  for (const c of ['yellow', 'red', 'fuchsia', 'blue']) out[c] = await analitza(`${base}${c}-frame-stripe.webp`);
  return out;
});
for (const [c, v] of Object.entries(r)) console.log(c.padEnd(9), JSON.stringify(v));
await b.close();
