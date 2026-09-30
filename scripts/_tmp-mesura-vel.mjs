// TEMPORAL (28/09/2026): l'opacitat del vel de cada casa de la franja, amb la
// samarreta negra i amb la blanca. Us: node scripts/_tmp-mesura-vel.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

// Les opacitats dels grups del vel de la franja vertical, i quantes cases te cada grup.
const vel = () => p.evaluate(() => {
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const grups = [...cela.querySelectorAll('svg g')]
    .filter((g) => g.getAttribute('fill') === '#FFFFFF' && (g.getAttribute('mask') || '').includes('hgVelForaActives'));
  return grups.map((g) => ({ alfa: g.getAttribute('opacity'), cases: g.querySelectorAll('path').length }));
});
const casesAmbColleccio = () => p.evaluate(() => {
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  return [...cela.querySelectorAll('[data-stripe-tile]')]
    .sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')))
    .map((t) => `${t.getAttribute('data-stripe-tile')}:${(t.getAttribute('data-stripe-collection') || '?').slice(0, 10)}`).join(' ');
});
const samarreta = (slug) => p.evaluate((s) => {
  const els = [...document.querySelectorAll(`[data-color-barra="${s}"]`)];
  const visible = els.find((el) => { const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; }) || els[0];
  const boto = visible && (visible.tagName === 'BUTTON' ? visible : visible.querySelector('button')) || visible;
  if (!boto) return `no trobat (${els.length} candidats)`;
  boto.click();
  return `clicat (${els.length} candidats)`;
}, slug);
const clica = async (pre) => {
  const i = await p.evaluate((x) => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
    .findIndex((b) => b.textContent.trim().toUpperCase().startsWith(x)), pre);
  await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
  await p.waitForTimeout(1300);
};

console.log('### samarreta BLANCA (per defecte) ###');
await clica('CUBE');
console.log('  CUBE activa:      ', JSON.stringify(await vel()));
await clica('MISCEL');
console.log('  MISCEL activa:    ', JSON.stringify(await vel()));

console.log('### samarreta NEGRA (amb la tinta BLANCA: amb tinta negra l\'app inverteix el color) ###');
// La tinta BLANCA del selector, perque el color de la samarreta no s'inverteixi.
const blanc = await p.evaluate(() => {
  const boto = [...document.querySelectorAll('[data-taula-vertical="2"] [data-taula-cela="1"] button[aria-label="Blanc"]')][0];
  if (!boto || boto.disabled) return 'no clicable';
  boto.click(); return 'clicat';
});
console.log('  tinta BLANCA:', blanc);
await p.waitForTimeout(1200);
console.log('  ', await samarreta('black'));
await p.waitForTimeout(1500);
await clica('CUBE');
console.log('  CUBE activa:      ', JSON.stringify(await vel()));
await clica('MISCEL');
console.log('  MISCEL activa:    ', JSON.stringify(await vel()));
console.log('    cases:          ', await casesAmbColleccio());
await clica('FIRST');
console.log('  FIRST activa:     ', JSON.stringify(await vel()));
console.log('    cases:          ', await casesAmbColleccio());
// PEMBERLEY porta una casa de CUBE a la finestra: aqui s'ha de veure el tall.
await clica('PEMBERLEY');
console.log('  PEMBERLEY activa: ', JSON.stringify(await vel()));
console.log('    cases:          ', await casesAmbColleccio());
await clica('LOOKING');
console.log('  LOOKING activa:   ', JSON.stringify(await vel()));
console.log('    cases:          ', await casesAmbColleccio());
await b.close();
