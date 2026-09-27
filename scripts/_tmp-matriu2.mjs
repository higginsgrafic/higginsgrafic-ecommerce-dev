// TEMPORAL — no es comiteja. Matriu final: el dibuix MES PROPER al centre de la
// finestra de la graella (mesurat amb els centres, no amb el primer que conté el
// punt), la casa central de la franja, enrere i els load nous.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
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
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  const mig = rb.left + rb.width / 2;
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const prop = bs.reduce((a, x) => {
    const k = x.getBoundingClientRect();
    return Math.abs((k.left + k.right) / 2 - mig) < Math.abs(a.d - mig) ? { d: (k.left + k.right) / 2, lab: x.getAttribute('aria-label'), op: getComputedStyle(x).opacity } : a;
  }, { d: 1e9, lab: null, op: null });
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const t0 = tiles[0]?.getBoundingClientRect();
  const t13 = tiles[13]?.getBoundingClientRect();
  const cf = (t0.left + t13.right) / 2;
  const casa = tiles.find((t) => { const k = t.getBoundingClientRect(); return k.left <= cf && k.right >= cf; });
  return {
    url: location.pathname + location.search,
    panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    graellaMig: `${prop.lab}:${prop.op}`,
    franjaMig: casa ? `${casa.getAttribute('data-stripe-tile')}:${getComputedStyle(casa).opacity}` : null,
    marca: window.__marca ?? null,
  };
});

for (const nom of ['FIRST CONTACT', 'THE HUMAN INSIDE', 'CUBE', 'MISCEL·LÀNIA', 'FIRST CONTACT']) {
  const card = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === n) || null, nom);
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1200);
  const e = await estat();
  console.log(nom.padEnd(16), 'graella mig =', String(e.graellaMig).padEnd(22), 'franja mig =', e.franjaMig);
}
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
console.log('enrere         :', JSON.stringify(await estat()));
console.log('loads nous:', loads - loads0, '| errors:', errs.length, errs.slice(0, 3));
await b.close();
