// TEMPORAL — no es comiteja. Quins colors te cada dibuix de marc de la graella?
// (mateixa mesura que abans, pero sobre els fitxers de la graella)
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
      const top = [...comptes.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, 3);
      const total = [...comptes.values()].reduce((a, b2) => a + b2, 0) || 1;
      res(top.map(([rgb, n]) => `${rgb} ${Math.round((n / total) * 100)}%`).join(' | '));
    };
    i.onerror = () => res('ERROR');
    i.src = url;
  });
  const base = '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/';
  const out = {};
  for (const c of ['blue', 'fuchsia', 'red', 'yellow']) out[c + '-frame-grid'] = await analitza(`${base}${c}-frame-grid.webp`);
  return out;
});
for (const [k, v] of Object.entries(r)) console.log(k.padEnd(20), v);
await b.close();
