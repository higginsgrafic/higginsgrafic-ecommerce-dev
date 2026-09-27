// TEMPORAL — no es comiteja. En clicar una targeta de colleccio, la finestra de la
// graella ha de quedar centrada en aquella colleccio.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));

const finestra = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const retall = v2?.querySelector('[data-carrusel="1"] > div');
  if (!retall) return null;
  const tira = retall.firstElementChild;
  const rb = retall.getBoundingClientRect();
  const centre = rb.left + rb.width / 2;
  const totes = [...tira.querySelectorAll('button')];
  const n = totes.length / 2;
  const primera = totes.slice(0, n);
  const visibles = primera.filter((x) => {
    const bb = x.getBoundingClientRect();
    return bb.right > rb.left && bb.left < rb.right;
  });
  const comptes = {};
  for (const x of visibles) {
    const lab = x.getAttribute('aria-label');
    const op = getComputedStyle(x).opacity;
    const clau = (op === '1' ? 'ACTIU ' : 'atenuat ') + lab;
    comptes[clau] = (comptes[clau] || 0) + 1;
  }
  // El grup actiu, si n'hi ha
  const actius = visibles.filter((x) => getComputedStyle(x).opacity === '1');
  const caixes = actius.map((x) => x.getBoundingClientRect()).sort((a, b) => a.left - b.left);
  return {
    visiblesActius: actius.map((x) => x.getAttribute('aria-label')),
    desviament: caixes.length ? +(((caixes[0].left + caixes[caixes.length - 1].right) / 2) - centre).toFixed(1) : null,
    transform: getComputedStyle(tira).transform,
  };
});

const clicaCard = async (nom) => {
  const card = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === n) || null, nom);
  if (!card.asElement()) return false;
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(2500);
  return true;
};

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('inici   :', JSON.stringify(await finestra()));

for (const nom of ['CUBE', 'MISCEL·LÀNIA', 'THE HUMAN INSIDE']) {
  const ok = await clicaCard(nom);
  console.log(`${nom.padEnd(16)}:`, ok ? JSON.stringify(await finestra()) : 'targeta no trobada');
}
console.log('errors:', errs.length, errs.slice(0, 3));
await b.close();
