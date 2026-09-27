import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);
const v2 = await p.$('[data-mega-page-viewport="2"]');
const estat = async (etiqueta) => {
  const r = await p.evaluate(() => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const retall = v.querySelector('[data-carrusel="1"] > div');
    const tira = retall.firstElementChild;
    const rb = retall.getBoundingClientRect();
    const centre = rb.left + rb.width / 2;
    const t = getComputedStyle(tira).transform;
    // Els dibuixos actius (no atenuats) i el seu centre
    const totes = [...tira.querySelectorAll('button')];
    const n = totes.length / 2;
    const peces = totes.slice(0, n).filter((x) => x.style.opacity !== '0.24');
    const caixes = peces.map((x) => x.getBoundingClientRect()).sort((a, b) => a.left - b.left);
    const primer = caixes[0]; const ultim = caixes[caixes.length - 1];
    return {
      transform: t,
      finestra: [+rb.left.toFixed(1), +rb.right.toFixed(1)],
      centreFinestra: +centre.toFixed(1),
      grup: [+primer.left.toFixed(1), +ultim.right.toFixed(1)],
      centreGrup: +((primer.left + ultim.right) / 2).toFixed(1),
      actius: peces.length,
    };
  });
  console.log(etiqueta, JSON.stringify(r));
};
await estat('inici');
for (const nom of ['CUBE', 'CROSSWORDS', 'MISCEL·LÀNIA']) {
  const boto = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-colleccions-targeta]')]
    .find((e) => (e.textContent || '').trim().toUpperCase() === n), nom);
  const el = boto.asElement();
  if (!el) { console.log(nom, 'no trobat'); continue; }
  await el.click();
  await p.waitForTimeout(900);
  await estat(`clic ${nom}`);
}
// Clic a una ICONA ATENUADA (d'una altra colleccio) tambe ha de centrar
const atenuada = await p.evaluateHandle(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v.querySelector('[data-carrusel="1"] > div').firstElementChild;
  const totes = [...tira.querySelectorAll('button')];
  return totes.slice(0, totes.length / 2).find((x) => x.style.opacity === '0.24' && x.getBoundingClientRect().width > 0);
});
const elA = atenuada.asElement();
if (elA) {
  console.log('icona atenuada:', await elA.getAttribute('title'));
  await elA.click();
  await p.waitForTimeout(900);
  await estat('clic icona atenuada');
}
await b.close();
