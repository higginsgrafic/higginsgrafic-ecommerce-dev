// TEMPORAL (28/09/2026): ON CAU LA HERO I ON CAU EL BLOC DE LA PDP.
//
// En Marc: «La pdp està situada a 50 px del bottom del viewport, si no recordo
// malament. Posa la hero a la mateixa posició.»
//
// Aquest guio mesura, a 1920x946, el baix del bloc de la PDP
// (`[data-page-band="product"]`) i el baix de la hero de l'inici
// (`[data-hero-caixa="1"]`), i diu quants px queden fins al bottom del viewport
// en cada cas. Serveix d'abans i despres.
//
// Us: node scripts/_tmp-hero-pdp-situacio.mjs
import { chromium } from '@playwright/test';

const VIEWPORT = { width: 1920, height: 946 };
const PDP = 'http://127.0.0.1:3003/first-contact/ncc-1701';
const INICI = 'http://127.0.0.1:3003/nova/inici?active=first_contact';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

const situa = async (etiqueta, sel) => {
  const d = await p.evaluate((sel) => {
    const el = document.querySelector(sel);
    const r = el ? el.getBoundingClientRect() : null;
    return {
      rect: r ? {
        top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1),
        left: +r.left.toFixed(1), right: +r.right.toFixed(1),
        width: +r.width.toFixed(1), height: +r.height.toFixed(1),
      } : null,
      vh: window.innerHeight,
    };
  }, sel);
  if (!d.rect) { console.log(`${etiqueta.padEnd(24)} (no trobat: ${sel})`); return d; }
  console.log(`${etiqueta.padEnd(24)} x${d.rect.left}..${d.rect.right}  y${d.rect.top}..${d.rect.bottom}  ${d.rect.width}x${d.rect.height}`);
  console.log(`${''.padEnd(24)}   -> el baix queda a ${(d.vh - d.rect.bottom).toFixed(1)} px del bottom del viewport (vh ${d.vh})`);
  return d;
};

// ─────────── LA PDP ───────────
console.log('═══ LA PDP · ' + PDP + ' ═══');
await p.goto(PDP, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(1200);
await situa('capcalera', 'header');
await situa('banda product (bloc)', '[data-page-band="product"]');
await situa('banda related', '[data-page-band="related"]');
const pdpAlt = await p.evaluate(() => ({
  scrollY: window.scrollY,
  alcadaDocument: document.documentElement.scrollHeight,
  vh: window.innerHeight,
}));
console.log('  document:', JSON.stringify(pdpAlt));

// ─────────── L'INICI NOU ───────────
console.log('\n═══ L\'INICI NOU · ' + INICI + ' ═══');
await p.goto(INICI, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(1200);
await situa('capcalera', 'header');
await situa('marc', '[data-inici-nou="1"]');
await situa('seccio icones', '[data-seccio="icones"]');
await situa('hero (envolcall)', '[data-hero-inici="1"]');
await situa('hero (caixa)', '[data-hero-caixa="1"]');
const iniciAlt = await p.evaluate(() => {
  const caixa = document.querySelector('[data-hero-caixa="1"]');
  const cs = caixa ? getComputedStyle(caixa) : null;
  const root = document.querySelector('[data-inici-nou="1"]');
  return {
    scrollY: window.scrollY,
    alcadaDocument: document.documentElement.scrollHeight,
    vh: window.innerHeight,
    caixaAspectRatio: cs?.aspectRatio ?? null,
    caixaAlcada: caixa ? +caixa.getBoundingClientRect().height.toFixed(1) : null,
    carril: root ? getComputedStyle(root).getPropertyValue('--contenut-max') || getComputedStyle(root).getPropertyValue('--contingut-max') : null,
  };
});
console.log('  caixa:', JSON.stringify(iniciAlt));

console.log('\n=== ERRORS DE CONSOLA ===');
console.log(errors.length ? errors.join('\n') : 'cap error');

await ctx.close();
await b.close();
