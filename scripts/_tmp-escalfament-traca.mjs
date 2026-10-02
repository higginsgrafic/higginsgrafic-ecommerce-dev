// LA PROVA DEFINITIVA DE L'ESCALFAMENT (04/10/2026).
//
// Recorre la carrega FOTOGRAMA A FOTOGRAMA i, de cada instant en que el panell
// es VISIBLE (en flux, `position: relative`), en guarda l'alcada. Si l'escalfament
// funciona, totes les alcades visibles son la bona: la composicio ha convergit
// amagada i l'animacio d'obertura ja no ensenya cap rebot.
//
// Tambe comprova que la hero i les franges no es mouen un cop el panell es veu.
//
//     node scripts/_tmp-escalfament-traca.mjs [ample] [alt] [active]
import { chromium } from '@playwright/test';

const AMPLE = Number(process.argv[2] || 1376);
const ALT = Number(process.argv[3] || 954);
const ACTIVA = process.argv[4] || '';
const URL = `http://127.0.0.1:3003/nova/inici?carril=1${ACTIVA ? `&active=${ACTIVA}` : ''}`;

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: AMPLE, height: ALT }, hasTouch: true });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 100)));
await p.goto(URL, { waitUntil: 'load', timeout: 120000 });

await p.evaluate(() => {
  window.__t = [];
  const mostra = () => {
    const s = document.querySelector('[data-mega-panel-surface="1"]');
    const cs = s ? getComputedStyle(s) : null;
    const hero = document.querySelector('[data-hero-caixa="1"]');
    const fr = document.querySelector('[data-stripe-visual-content="2"]');
    window.__t.push({
      t: Math.round(performance.now()),
      h: s ? Math.round(s.getBoundingClientRect().height * 10) / 10 : null,
      pos: cs ? cs.position : null,
      vis: cs ? cs.visibility : null,
      hero: hero ? Math.round(hero.getBoundingClientRect().top * 10) / 10 : null,
      fr: fr ? Math.round(fr.getBoundingClientRect().top * 10) / 10 : null,
      flags: window.__hg || null,
    });
    requestAnimationFrame(mostra);
  };
  requestAnimationFrame(mostra);
});

await p.waitForTimeout(6000);
const t = await p.evaluate(() => window.__t);

const visibles = t.filter((x) => x.pos === 'relative' && x.vis === 'visible');
const alcades = [...new Set(visibles.map((x) => x.h))];
const primera = visibles[0];
const heroVis = [...new Set(visibles.map((x) => x.hero))];
const frVis = [...new Set(visibles.map((x) => x.fr))];
const dormant = t.filter((x) => x.pos === 'absolute');
const alcadesDormint = [...new Set(dormant.map((x) => x.h))];
const muntatge = t.find((x) => x.h != null);
const obertura = primera ? primera.t : null;

console.log(`\n=== ${AMPLE}x${ALT} ${URL}`);
console.log(`  fotogrames=${t.length}  panell muntat=${muntatge ? muntatge.t : '-'}ms  obert=${obertura}ms`);
console.log(`  alcades mentre DORMINT (hidden/absolute): ${JSON.stringify(alcadesDormint)}`);
console.log(`  alcades mentre VISIBLE (relative):        ${JSON.stringify(alcades)}`);
console.log(`  hero visible: ${JSON.stringify(heroVis)}   franja p2 visible: ${JSON.stringify(frVis)}`);
console.log(`  rebot visible: ${alcades.length <= 1 ? 'CAP (una sola alcada)' : 'SI, ' + alcades.length + ' alcades'}`);
console.log(`  hero quieta:   ${heroVis.length <= 1 ? 'SI' : 'NO (' + heroVis.length + ' valors)'}`);
console.log(`  franja quieta: ${frVis.length <= 1 ? 'SI' : 'NO (' + frVis.length + ' valors)'}`);
if (errors.length) console.log('  ERRORS: ' + errors.join(' | '));

await b.close();
