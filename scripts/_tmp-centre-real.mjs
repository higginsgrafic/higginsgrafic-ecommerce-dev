// TEMPORAL — no es comiteja. Quin es el centre que TOCA per a cada colleccio, i
// quantes peces se'n veuen a la finestra (mesura de la repro de l'amo).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const nums = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2?.querySelector('[data-carrusel="1"] > div');
  const pista = cont?.firstElementChild;
  const tf = pista ? getComputedStyle(pista).transform : null;
  const tx = tf && tf !== 'none' ? +tf.split(',')[4] : null;
  const rb = cont?.getBoundingClientRect();
  const bs = v2 ? [...v2.querySelectorAll('[data-carrusel="1"] button')] : [];
  const marcats = bs.map((x) => ({ lab: x.getAttribute('aria-label'), op: getComputedStyle(x).opacity }));
  const vis = bs.map((x, i) => ({ i, lab: x.getAttribute('aria-label'), bb: x.getBoundingClientRect() }))
    .filter((x) => rb && x.bb.right > rb.left && x.bb.left < rb.right);
  // Indexos de cada colleccio, per la capa de dibuixos (mateixa llista).
  const perCol = {};
  marcats.forEach((x, i) => { if (x.op === '1') perCol[(perCol._u = perCol._u || []) && 'actiu'] = (perCol.actiu || 0) + 1; });
  return {
    tx: tx === null ? null : +tx.toFixed(2),
    finestra: rb ? +rb.width.toFixed(2) : null,
    visibles: vis.length,
    primeres: vis.slice(0, 3).map((x) => `${x.i}:${x.lab}`),
    ultimes: vis.slice(-3).map((x) => `${x.i}:${x.lab}`),
    mig: (() => { const m = rb.left + rb.width / 2; const x = vis.find((y) => y.bb.left <= m && y.bb.right >= m); return x ? `${x.i}:${x.lab}` : null; })(),
    blancaCentre: (() => { const m = rb.left + rb.width / 2; const x = bs.map((y, i) => ({ i, lab: y.getAttribute('aria-label'), bb: y.getBoundingClientRect() })).find((y) => y.bb.left <= m && y.bb.right >= m); return x ? x.i : null; })(),
    pas: (() => { const a = bs[0].getBoundingClientRect(); const c = bs[1].getBoundingClientRect(); return +(c.left - a.left).toFixed(4); })(),
    total: bs.length,
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);

// Centre que TOCA per a cada colleccio, amb l'ordre real de la tira.
const centres = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const meitat = bs.length / 2;
  const a = bs[0].getBoundingClientRect();
  const c = bs[1].getBoundingClientRect();
  const pas = c.left - a.left;
  // La capa de dibuixos porta la colleccio a cada casella (mateixa llista).
  const capa = v2.querySelector('[data-stripe-drawing-layer]');
  const t = [...capa.querySelectorAll('[data-stripe-tile]')];
  return { pas, meitat, caselles: t.length };
});
console.log('geometria:', JSON.stringify(centres));

for (const col of ['FIRST CONTACT', 'THE HUMAN INSIDE', 'AUSTEN', 'CUBE', 'MISCEL·LÀNIA']) {
  const card = await p.evaluateHandle((nom) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === nom) || null, col);
  if (!card.asElement()) { console.log(col, 'no trobat'); continue; }
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1200);
  console.log(col.padEnd(18), JSON.stringify(await nums()));
}
await b.close();
