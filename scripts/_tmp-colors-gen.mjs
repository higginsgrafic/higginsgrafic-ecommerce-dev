// TEMPORAL — no es comiteja. Les generades NOVES tenen el contingut dels
// originals? Es compara el to de cada parella.
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
      const d = x.getImageData(0, 0, c.width, c.height).data;
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
      const top = [...comptes.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, 2);
      const total = [...comptes.values()].reduce((a, b2) => a + b2, 0) || 1;
      res(top.map(([rgb, n]) => `${rgb} ${Math.round((n / total) * 100)}%`).join(' | '));
    };
    i.onerror = () => res('ERROR');
    i.src = url;
  });
  const o = '/custom_logos/drawings/images_originals/stripe/austen/looking_for_my_darcy/color/frame/';
  const g = '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/';
  const out = {};
  for (const f of ['yellow-pink-frame-stripe.webp', 'yellow-red-frame-stripe.webp']) {
    out[f] = { original: await analitza(o + f), generada: await analitza(g + f) };
  }
  return out;
});
for (const [k, v] of Object.entries(r)) {
  console.log(k);
  console.log('   original:', v.original);
  console.log('   generada:', v.generada);
}
await b.close();
