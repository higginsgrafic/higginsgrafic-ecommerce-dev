// TEMPORAL — no es comiteja. L'ordre real de la tira de 64 dibuixos: quin index
// ocupa cada colleccio (serveix per saber si el grup es contigu i quants n'hi ha).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);

// Es llegeix l'ordre de la graella (mateixa llista que la tira) recorrent les
// peces del carrusel i la seva colleccio pel color d'atenuacio no: millor, la
// llista d'items ve de dibuixosGraella16x4, que tambe pinta la capa de la tira.
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const meitat = bs.length / 2;
  const noms = bs.slice(0, meitat).map((x) => x.getAttribute('aria-label'));
  return { n: meitat, noms };
});
console.log('items a la tira:', info.n);
console.log(info.noms.join(' | '));
await b.close();
