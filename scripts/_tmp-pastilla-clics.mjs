// TEMPORAL (28/09/2026): ELS CLICS DEL SELECTOR I DE LES FLETXES DE LA P1.
//
// Despres de treure la pastilla blanca de la capa dels botons (perque quedi per
// sota de l'ombra), els TRES botons i les DUES fletxes han de seguir responent.
// Es clica amb el ratoli de debo (`mouse.click`, o sigui amb `hit-testing`) a
// les coordenades de la pantalla, amb la p1 posada al davant.
//
// La pastilla, a mes, ha de caure a la casella que toca: y216,3 (BLANC),
// y259,1 (COLOR) o y301,8 (NEGRE).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&stripeVariant=color', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);

// La p1, al davant (nomes per a la mesura: es mou el contenidor amb `transform`).
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const carril = v1?.parentElement?.parentElement;
  if (carril) carril.style.transform = 'translateX(0)';
});
await p.waitForTimeout(1000);

const estat = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const past = v1?.querySelector('[data-pastilla-p1="1"] > span[aria-hidden="true"]');
  const r = past?.getBoundingClientRect();
  const tira = v1?.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return {
    pastillaY: r ? +r.top.toFixed(1) : null,
    carrusel: tira ? getComputedStyle(tira).transform : null,
  };
});

const centre = (sel, etiqueta) => p.evaluate(({ sel, etiqueta }) => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const candidats = [...(v1?.querySelectorAll(sel) || [])];
  const el = etiqueta
    ? candidats.find((c) => (c.getAttribute('aria-label') || '') === etiqueta)
    : candidats[0];
  if (!el) return null;
  const q = el.getBoundingClientRect();
  return { x: +(q.left + q.width / 2).toFixed(1), y: +(q.top + q.height / 2).toFixed(1), etiqueta: el.getAttribute('aria-label') };
}, { sel, etiqueta });

const prova = async (etiqueta, sel, aria, comprova) => {
  const c = await centre(sel, aria);
  if (!c) { console.log(`${etiqueta.padEnd(22)} (no trobat)`); return; }
  const abans = await estat();
  await p.mouse.click(c.x, c.y);
  await p.waitForTimeout(1400);
  const despres = await estat();
  console.log(`${etiqueta.padEnd(22)} clic a (${c.x}, ${c.y})  ${JSON.stringify(abans)} -> ${JSON.stringify(despres)}  ${comprova(abans, despres) ? 'RESPON' : 'NO RESPON'}`);
};

console.log('=== ELS CLICS DE LA P1 (pastilla a y216,3 BLANC · y259,1 COLOR · y301,8 NEGRE) ===');
await prova('selector BLANC', '[data-stripe-buttonbar="bn-p1"] button', 'Blanc', (a, d) => d.pastillaY !== a.pastillaY && Math.abs(d.pastillaY - 216.3) < 1.5);
await prova('selector COLOR', '[data-stripe-buttonbar="bn-p1"] button', 'Color', (a, d) => d.pastillaY !== a.pastillaY && Math.abs(d.pastillaY - 259.1) < 1.5);
await prova('selector NEGRE', '[data-stripe-buttonbar="bn-p1"] button', 'Negre', (a, d) => d.pastillaY !== a.pastillaY && Math.abs(d.pastillaY - 301.8) < 1.5);
await prova('fletxa Següent', '#stripe-guide-right-arrow', null, (a, d) => d.carrusel !== a.carrusel);
await prova('fletxa Anterior', '[data-fletxes-p1="1"] button', 'Anterior', (a, d) => d.carrusel !== a.carrusel);
await prova('selector COLOR (2a)', '[data-stripe-buttonbar="bn-p1"] button', 'Color', (a, d) => d.pastillaY !== a.pastillaY && Math.abs(d.pastillaY - 259.1) < 1.5);

console.log('\n=== ERRORS DE CONSOLA ===');
console.log(errors.length ? errors.join('\n') : 'cap error');

await ctx.close();
await b.close();
