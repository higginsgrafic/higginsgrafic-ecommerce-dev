// TEMPORAL — no es comiteja. La matriu sencera: cada colleccio (graella i
// franja), el boto d'enrere, els errors i els load nous.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
let loads = 0;
p.on('load', () => { loads += 1; });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
await p.evaluate(() => { window.__marca = 'hi-soc'; });
const loads0 = loads;

const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...(v2?.querySelectorAll('[data-stripe-tile]') || [])];
  const cont = v2?.querySelector('[data-carrusel="1"] > div');
  const pista = cont?.firstElementChild;
  const tf = pista ? getComputedStyle(pista).transform : null;
  const tx = tf && tf !== 'none' ? +(+tf.split(',')[4]).toFixed(1) : null;
  const mig = cont ? cont.getBoundingClientRect().left + cont.getBoundingClientRect().width / 2 : 0;
  const bs = v2 ? [...v2.querySelectorAll('[data-carrusel="1"] button')] : [];
  const centrat = bs.find((x) => { const k = x.getBoundingClientRect(); return k.left <= mig && k.right >= mig; });
  const casaMig = (() => {
    const t0 = tiles[0]?.getBoundingClientRect();
    const t13 = tiles[13]?.getBoundingClientRect();
    if (!t0 || !t13) return null;
    const c = (t0.left + t13.right) / 2;
    const casa = tiles.find((t) => { const k = t.getBoundingClientRect(); return k.left <= c && k.right >= c; });
    return casa ? { casa: casa.getAttribute('data-stripe-tile'), op: getComputedStyle(casa).opacity } : null;
  })();
  return {
    url: location.pathname + location.search,
    panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    tx,
    migGraella: centrat ? centrat.getAttribute('aria-label') : null,
    casaMig,
    marca: window.__marca ?? null,
  };
});

const clicaTargeta = async (nom) => {
  const card = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === n) || null, nom);
  if (!card.asElement()) return false;
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1300);
  return true;
};

for (const col of ['THE HUMAN INSIDE', 'CUBE', 'MISCEL·LÀNIA', 'FIRST CONTACT']) {
  await clicaTargeta(col);
  const e = await estat();
  console.log(`${col.padEnd(16)} graella=${String(e.migGraella).padEnd(16)} franja casa=${e.casaMig?.casa}/${e.casaMig?.op} tx=${e.tx}`);
}

// Un clic de franja + enrere
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="5"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(3500);
console.log('franja clicada :', (await estat()).url);
await p.goBack({ waitUntil: 'commit' });
await p.waitForTimeout(3000);
const e2 = await estat();
console.log('enrere         :', JSON.stringify(e2));
console.log('loads nous:', loads - loads0, '| errors:', errs.length, errs.slice(0, 3));
await b.close();
