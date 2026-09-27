// TEMPORAL (pero es queda, com els altres _tmp): L'ANCORATGE. Mesura les peces
// clau de les DUES pagines a 1920x946 i avisa si alguna s'ha mogut mes d'1 px
// respecte dels valors de referencia. Es l'eina per tocar coses sense
// embolicar la troca: es passa abans i despres de cada canvi.
import { chromium } from '@playwright/test';
// valors de referencia (1920x946) del 26/09/2026
// (28/09/2026: tot el contingut de les dues pagines puja 23,4 px pel retall del
// coixi de dalt del panell —30 px d'aire a la pagina 2— i aixo es nota a la
// segona xifra de cada peça.)
const REF = {
  'p2 carril': [381, 1524],
  'p2 selector': [381, 88.5, 59.5, 119],
  'p2 columna': [1395.3, 88.5, 128.7, 242.6],
  'p2 graella': [450.4, 83.5, 939.4, 95.2],
  'p2 franja': [357.9, 218.1, 1055.1, 113],
  'p1 graella': [381, 74.5, 1023, 110],
  'p1 bloc dreta': [1414, 74.5, 110, 220],
  'p1 franja': [357.9, 218.1, 1055.1, 113],
  'p1 fletxes': [1414, 184.5, 110, 110],
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const m = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const d1 = -v1.getBoundingClientRect().left;
  const q = (el, dx) => { if (!el) return null; const r = el.getBoundingClientRect(); return [+(((r.left + (dx || 0)))).toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
  const cap = document.querySelector('[data-capcalera-fila="1"]');
  return {
    'p2 carril': [Math.round(cap.getBoundingClientRect().left), Math.round(cap.getBoundingClientRect().right)],
    'p2 selector': q(v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
    'p2 columna': q(v2.querySelector('[data-colleccions-targeta]').parentElement),
    'p2 graella': q(v2.querySelector('[data-carrusel="1"]')),
    'p2 franja': q(v2.querySelector('[data-stripe-visual-content="2"]')),
    'p1 graella': q(v1.querySelector('[data-carrusel="1"]'), d1),
    'p1 bloc dreta': q(v1.querySelector('[data-bloc-dreta-p1="1"]'), d1),
    'p1 fletxes': q(v1.querySelector('[data-fletxes-p1="1"]'), d1),
    'p1 franja': q(v1.querySelector('[data-stripe-visual-content="1"]'), d1),
  };
});
await ctx.close();
await b.close();
let mal = 0;
console.log('peça'.padEnd(18), 'mesurat'.padEnd(34), 'referencia'.padEnd(34), 'diferencia');
for (const [k, ref] of Object.entries(REF)) {
  const got = m[k];
  if (!got) { console.log(k.padEnd(18), '(no trobat)'); mal += 1; continue; }
  const dif = got.map((v, i) => +Math.abs(v - ref[i]).toFixed(1));
  const bad = dif.some((d, i) => d > (i < 2 ? 1 : 3));
  if (bad) mal += 1;
  console.log(k.padEnd(18), JSON.stringify(got).padEnd(34), JSON.stringify(ref).padEnd(34), bad ? 'MOGUT ' + JSON.stringify(dif) : 'ok');
}
console.log(mal ? `\n${mal} peces fora de lloc` : '\nTOT AL SEU LLOC');
