// 03/10/2026 — On cau el centre de cada samarreta de la franja: es llegeix la
// imatge de la franja i es busquen les 14 clavilles del coll (la punxa del perfil
// de dalt). Serveix per comparar-ho amb el centre de cada casella de dibuix.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1376, height: 954 }, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(8000);
const r = await p.evaluate(async () => {
  const cont = document.querySelector('[data-stripe-visual-content="2"]');
  const imgs = [...cont.querySelectorAll('img')].filter((e) => e.getBoundingClientRect().width > 300);
  const out = {};
  for (const img of imgs.slice(0, 2)) {
    const im = new Image(); im.src = img.src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    // Perfil de dalt: la primera fila amb alfa > 24 de cada columna.
    const perfil = [];
    for (let x = 0; x < c.width; x++) {
      let y = -1;
      for (let yy = 0; yy < c.height; yy++) if (d[(yy * c.width + x) * 4 + 3] > 24) { y = yy; break; }
      perfil.push(y);
    }
    // Les clavilles: maxims locals del perfil (el coll cau mes avall).
    const pics = [];
    for (let x = 4; x < c.width - 4; x++) {
      const y = perfil[x];
      if (y < 0) continue;
      if (y >= perfil[x - 1] && y >= perfil[x + 1] && y > (perfil[x - 3] ?? y) && y > (perfil[x + 3] ?? y)) pics.push(x);
    }
    // Ajuntar pics veins (un coll dona uns quants px).
    const grups = [];
    for (const x of pics) {
      const ultim = grups[grups.length - 1];
      if (ultim && x - ultim[ultim.length - 1] <= 12) ultim.push(x); else grups.push([x]);
    }
    const colls = grups.map((g2) => g2.reduce((a, x) => a + x, 0) / g2.length);
    const r0 = img.getBoundingClientRect();
    out[img.src.split('/').pop().slice(0, 30)] = {
      natural: [c.width, c.height],
      collsPct: colls.map((x) => +((x / c.width) * 100).toFixed(2)),
      collsPx: colls.map((x) => Math.round(r0.left + (x / c.width) * r0.width)),
    };
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
