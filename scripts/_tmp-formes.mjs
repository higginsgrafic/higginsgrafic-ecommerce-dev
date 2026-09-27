// TEMPORAL — no es coiteja. Compara les formes dels fitxers nous de l'amo amb
// les que fa servir el codi (traçades): caixa, area i dibuix una al costat de
// l'altra (vermell = nova, blau = la del codi).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1400, height: 760 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const nouT1 = readFileSync('public/placeholders/cercador/clic-area-t1-(5).svg', 'utf8');
const nouT2 = readFileSync('public/placeholders/cercador/clic-area-t2-t14-(5).svg', 'utf8');
const codi = readFileSync('src/config/vectorFranja.js', 'utf8');
const treu = (nom) => {
  const i = codi.indexOf(`${nom} = '`);
  const j = codi.indexOf("';", i);
  return codi.slice(i + nom.length + 4, j);
};
const SAMARRETA = treu('VECTOR_FRANJA_SAMARRETA');
const IMPRESSIO = treu('VECTOR_FRANJA_IMPRESSIO');
const dNouT2 = /<path[^>]*\sd="([^"]+)"/.exec(nouT2.replace(/\n/g, ' '))[1];
const dNouT1 = /<path[^>]*\sd="([^"]+)"/.exec(nouT1.replace(/\n/g, ' '))[1];
// Calcular les caixes de cada path amb getBBox a la propia pagina
const info = await p.evaluate(({ dNouT1, dNouT2, SAMARRETA, IMPRESSIO }) => {
  const caixa = (d) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '10'); svg.setAttribute('height', '10');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path); document.body.appendChild(svg);
    const bb = path.getBBox();
    return { x: +bb.x.toFixed(1), y: +bb.y.toFixed(1), w: +bb.width.toFixed(1), h: +bb.height.toFixed(1) };
  };
  return {
    'nou t1 (area impressio)': caixa(dNouT1),
    'codi area impressio': caixa(IMPRESSIO),
    'nou t2 (samarreta)': caixa(dNouT2),
    'codi samarreta': caixa(SAMARRETA),
  };
}, { dNouT1, dNouT2, SAMARRETA, IMPRESSIO });
console.log(JSON.stringify(info, null, 1));
await ctx.close();
await b.close();
