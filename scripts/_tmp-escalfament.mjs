// L'ESCALFAMENT DEL PANELL, MESURAT (04/10/2026).
//
// Que fa: carrega `/nova/inici` amb el megaslide TANCAT, espera que el panell
// dormint s'escalfi, clica la icona de la lupa (que obre el megaslide) i mesura
// les peces de la obertura a cada fotograma clau. Tambe mesura l'estat tancat
// ABANS del clic, que es on es veuria si el panell dormint ha mogut res.
//
//     node scripts/_tmp-escalfament.mjs [ample] [alt]
import { chromium } from '@playwright/test';

const AMPLE = Number(process.argv[2] || 1376);
const ALT = Number(process.argv[3] || 954);
const ACTIVA = process.argv[4] || '';
const URL = `http://127.0.0.1:3003/nova/inici?carril=1${ACTIVA ? `&active=${ACTIVA}` : ''}`;
const MESURA = () => {
  const rd = (n) => Math.round(n * 10) / 10;
  const q = (sel) => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return [rd(r.top), rd(r.height)];
  };
  const surface = document.querySelector('[data-mega-panel-surface="1"]');
  const cs = surface ? getComputedStyle(surface) : null;
  const capcalera = document.querySelector('header');
  return {
    vis: cs ? cs.visibility : '-',
    pos: cs ? cs.position : '-',
    fons: capcalera ? getComputedStyle(capcalera).backgroundColor : '-',
    vora: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom').trim() || '-',
    panell: q('[data-mega-panel-surface="1"]'),
    hero: q('[data-hero-caixa="1"]'),
    franja: q('[data-stripe-visual-content="2"]'),
    sel: q('[data-p2-color-selector] [data-stripe-buttonbar="bn-p1"],[data-p2-color-selector] [data-stripe-buttonbar="bn"]'),
    cad: q('img[src*="cadenat"]'),
  };
};

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: AMPLE, height: ALT }, hasTouch: true });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));

await p.goto(URL, { waitUntil: 'load', timeout: 120000 });

// La linia de base del pintat: la mida de la hero al primer fotograma.
await p.waitForTimeout(120);
console.log('pintat inicial ', JSON.stringify(await p.evaluate(MESURA)));

// El panell s'ha d'haver escalfat (1,2 s) i convergit (fins a ~2,5 s).
for (const t of [1500, 3000, 4500]) {
  await p.waitForTimeout(t === 1500 ? 1380 : 1500);
  console.log(`tancat  +${String(t).padEnd(5)}ms`, JSON.stringify(await p.evaluate(MESURA)));
}

// L'OBERTURA DE DEBO: el clic (o la carrega, si la URL ja porta la colleccio).
if (!ACTIVA) await p.click('button:has(svg.lucide-search)').catch(() => {});
const marques = ACTIVA ? [0, 150, 400, 800, 1500, 2500] : [150, 400, 800, 1500, 2500];
let previ = 0;
for (const t of marques) {
  await p.waitForTimeout(t - previ);
  previ = t;
  console.log(`OBERT   +${String(t).padEnd(5)}ms`, JSON.stringify(await p.evaluate(MESURA)));
}

// I el tancament: la hero no s'ha de moure.
if (!ACTIVA) {
  await p.keyboard.press('Escape');
  await p.waitForTimeout(800);
  console.log('tancat despres ', JSON.stringify(await p.evaluate(MESURA)));
}

if (errors.length) console.log('ERRORS DE PAGINA:', errors.join(' | '));
await b.close();
