// TEMPORAL (29/09/2026): comprova la regla de la inversio completa als 14
// colors, a les funcions de debò, dins el navegador.
//
//   clares (white, ice-grey, rs-sport-grey)      -> sobre BLANC surt NEGRE
//   fosques (black, navy, dark-chocolate, charcoal) -> sobre NEGRE surt BLANC
//   la resta (royal, red, ...)                   -> el que diu l'acabat
//
// Us: node scripts/_tmp-inversio-navy.mjs
import { chromium } from '@playwright/test';

const CLARES = ['white', 'ice-grey', 'rs-sport-grey'];
const FOSQUES = ['black', 'navy', 'dark-chocolate', 'charcoal'];
// La resta que, sense acabat, cau a tinta BLANCA per to (és el que fa
// COLORS_FOSCOS a cartImage.js). Les clares cauen a negra.
const MIG_FOSQUES = ['royal', 'irish-green', 'military-green', 'red'];
// Com s'espera la tinta segons l'acabat (BLANC->w, NEGRE->b) i el to.
const esperat = (color, finish) => {
  const base = finish === 'BLANC' ? 'w'
    : finish === 'NEGRE' ? 'b'
      : ([...FOSQUES, ...MIG_FOSQUES].includes(color) ? 'w' : 'b');
  if (base === 'w' && CLARES.includes(color)) return 'b';
  if (base === 'b' && FOSQUES.includes(color)) return 'w';
  return base;
};

const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);

const r = await p.evaluate(async (colors) => {
  const { resolveInk } = await import('/src/lib/cartImage.js');
  const out = [];
  for (const color of colors) {
    for (const finish of [null, 'BLANC', 'NEGRE']) {
      out.push({ color, finish: finish || '(cap)', ink: resolveInk('first-contact', color, finish) });
    }
  }
  return out;
}, [...CLARES, ...FOSQUES, ...MIG_FOSQUES, 'light-blue', 'daisy', 'gold']);

let mals = 0;
for (const x of r) {
  const esp = esperat(x.color, x.finish === '(cap)' ? null : x.finish);
  const ok = x.ink === esp;
  if (!ok) mals++;
  console.log(`  ${x.color.padEnd(15)} ${String(x.finish).padEnd(6)} -> tinta ${x.ink}  ${ok ? 'OK' : `MAL (esperava ${esp})`}`);
}
console.log(mals === 0 ? `\n  REGLA OK (${r.length} casos)` : `\n  ${mals} casos malament`);
await b.close();
