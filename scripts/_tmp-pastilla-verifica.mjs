// TEMPORAL (28/09/2026): verificacio de la pastilla del selector. Compta les
// escriptures del seu estil (abans del canvi eren centenars, alternant) i diu on
// acaba pintada, en clicar LOOKING FOR MY DARCY i en tornar.
// Us: node scripts/_tmp-pastilla-verifica.mjs [amplada] [alcada]
import { chromium } from '@playwright/test';

const ample = Number(process.argv[2] || 768);
const alt = Number(process.argv[3] || 1024);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: ample, height: alt }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const prepara = () => p.evaluate(() => {
  const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')];
  let millor = null; let area = 0;
  bars.forEach((bar) => {
    const r = bar.getBoundingClientRect();
    if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) return;
    if (r.width * r.height > area) { area = r.width * r.height; millor = bar; }
  });
  if (!millor) return null;
  const pa = [...millor.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
  window.__bar = millor; window.__pa = pa;
  window.__escriptures = 0; window.__tops = [];
  if (window.__obs) window.__obs.disconnect();
  window.__obs = new MutationObserver(() => { window.__escriptures += 1; window.__tops.push(pa.style.top); });
  window.__obs.observe(pa, { attributes: true, attributeFilter: ['style'] });
  return { ample: millor.getBoundingClientRect().width, alcada: millor.getBoundingClientRect().height };
});

const estat = () => p.evaluate(() => {
  const rb = window.__bar.getBoundingClientRect();
  const rp = window.__pa.getBoundingClientRect();
  const dins = (rp.top - rb.top) / rb.height;
  const seleccionat = [...window.__bar.querySelectorAll('button')]
    .filter((x) => getComputedStyle(x.querySelector('span')).fontWeight === '400')
    .map((x) => x.getAttribute('aria-label'));
  return {
    pastillaPct: +(dins * 100).toFixed(2),
    pastillaCss: +(rp.top - rb.top).toFixed(2),
    seleccionat,
    desactivats: [...window.__bar.querySelectorAll('button')].filter((x) => x.disabled).map((x) => x.getAttribute('aria-label')),
    escriptures: window.__escriptures,
    topsDistints: [...new Set(window.__tops)],
  };
});

const clica = async (prefix) => {
  const i = await p.evaluate((pre) => {
    // La vertical te la columna de colleccions; l'apaisada, la filera.
    // Vertical: columna. Apaisada: filera o targetes de la filera del cercador.
    const cont = document.querySelector('[data-colleccions-caixes="1"]')
      || document.querySelector('[data-colleccions-linia="1"]')
      || document.querySelector('[data-p2-cercador-row="true"]');
    if (!cont) return -1;
    return [...cont.querySelectorAll('button')].findIndex((x) => x.textContent.trim().toUpperCase().startsWith(pre));
  }, prefix);
  if (i < 0) return { error: `no trobo l'enllac ${prefix}` };
  await p.evaluate(({ i }) => {
    window.__escriptures = 0; window.__tops = [];
    const cont = document.querySelector('[data-colleccions-caixes="1"]')
      || document.querySelector('[data-colleccions-linia="1"]')
      || document.querySelector('[data-p2-cercador-row="true"]');
    cont.querySelectorAll('button')[i].click();
  }, { i });
  await p.waitForTimeout(2000);
  return estat();
};

const info = await prepara();
console.log(`vista ${ample}x${alt} — selector ${info ? `${info.ample}x${info.alcada}` : 'NO TROBAT'}`);
if (!info) { await b.close(); process.exit(0); }
console.log('  inicial:      ', JSON.stringify(await estat()));
console.log('  clic LOOKING: ', JSON.stringify(await clica('LOOKING')));
console.log('  clic FIRST:   ', JSON.stringify(await clica('FIRST')));
console.log('  clic LOOKING: ', JSON.stringify(await clica('LOOKING')));
await b.close();
