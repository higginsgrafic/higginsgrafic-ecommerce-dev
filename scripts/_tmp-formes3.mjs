// TEMPORAL — no es coiteja. Les caixes de les quatre formes (per saber quant
// s'haurien de desplaçar les noves per caure al mateix lloc).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const codi = readFileSync('src/config/vectorFranja.js', 'utf8');
const treu = (nom) => { const i = codi.indexOf(`${nom} = '`); return codi.slice(i + nom.length + 4, codi.indexOf("';", i)); };
const dNouT2 = /<path[^>]*\sd="([^"]+)"/.exec(readFileSync('public/placeholders/cercador/clic-area-t2-t14-(5).svg', 'utf8').replace(/\n/g, ' '))[1];
const dNouT1 = /<path[^>]*\sd="([^"]+)"/.exec(readFileSync('public/placeholders/cercador/clic-area-t1-(5).svg', 'utf8').replace(/\n/g, ' '))[1];
const info = await p.evaluate(({ dNouT1, dNouT2, S, I }) => {
  const caixa = (d) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '500'); svg.setAttribute('height', '500');
    svg.style.position = 'absolute'; svg.style.left = '-9999px';
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d); svg.appendChild(path); document.body.appendChild(svg);
    const bb = path.getBBox(); svg.remove();
    return { x: +bb.x.toFixed(1), y: +bb.y.toFixed(1), w: +bb.width.toFixed(1), h: +bb.height.toFixed(1) };
  };
  const a = caixa(dNouT2), c = caixa(S);
  const a1 = caixa(dNouT1), c1 = caixa(I);
  return {
    samarreta: { nova: a, codi: c, desplacament: { dx: +(c.x - a.x).toFixed(1), dy: +(c.y - a.y).toFixed(1), dw: +(c.w - a.w).toFixed(1), dh: +(c.h - a.h).toFixed(1) } },
    impressio: { nova: a1, codi: c1, desplacament: { dx: +(c1.x - a1.x).toFixed(1), dy: +(c1.y - a1.y).toFixed(1), dw: +(c1.w - a1.w).toFixed(1), dh: +(c1.h - a1.h).toFixed(1) } },
  };
}, { dNouT1, dNouT2, S: treu('VECTOR_FRANJA_SAMARRETA'), I: treu('VECTOR_FRANJA_IMPRESSIO') });
console.log(JSON.stringify(info, null, 1));
await ctx.close();
await b.close();
