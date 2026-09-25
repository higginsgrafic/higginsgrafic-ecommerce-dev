#!/usr/bin/env node
/**
 * Compara les vistes del megaslide i canta si les de tauleta no quadren.
 *
 * La pagina 2 del vertical i la de l'horitzontal han de ser la mateixa: les
 * mateixes mides i les mateixes alineacions. Aquest script obre les quatre
 * mides de cop, mesura les xifres clau i falla (sortint amb 1) si alguna
 * divergeix mes del compte.
 *
 * Cal el preview engegat:
 *   npm run build
 *   npx vite preview --host 0.0.0.0 --port 3003
 *   node scripts/compara-vistes.mjs
 *
 * Es pot canviar la URL amb HG_URL i sortir nomes amb el resum amb HG_BREU=1.
 */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

import { FRACCIO_COSSOS_FRANJA, FRACCIO_MARGE_ESQUERRE_FRANJA } from '../src/config/stripeCalibrations.js';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
// Diferencies tolerades (px): el soroll de mesura i la diferencia de caixa
// entre el dibuix i la barra de color.
const TOL_MIDES = 0.5;
const TOL_ALINEACIO = 1.5;
const TOL_FRANJA = 3;

const CASES = [
  { nom: 'vertical 768', ample: 768, alt: 1024, touch: true, tauleta: true },
  { nom: 'horitzontal 1024', ample: 1024, alt: 768, touch: true, tauleta: true },
  { nom: 'horitzontal 1366', ample: 1366, alt: 768, touch: true, tauleta: true },
  { nom: 'desktop 1440', ample: 1440, alt: 900, touch: false, tauleta: false },
];

const mesura = () => {
  const ambMida = (sel) => [...document.querySelectorAll(sel)]
    .find((e) => e.getBoundingClientRect().width > 0);
  // Les peces que mesurem son les de la PAGINA 2. Amb la vista vertical nova
  // (les taules), els dibuixos tambe son a la graella de la pagina 1, que va
  // abans al DOM: cal buscar-los dins la pagina 2 o en comptes d'ella en
  // mesurariem la graella de la taula.
  const cg0 = ambMida('[data-p2-color-grid]');
  const arrel = (cg0 && cg0.closest('[data-mega-page-viewport="2"]')) || document;
  const pel = (etiqueta) => [...arrel.querySelectorAll('button[aria-label]')]
    .find((x) => x.getAttribute('aria-label') === etiqueta);
  const nx = pel('NX-01');
  const mz = pel('Mazinger-Z');
  const ncc = pel('NCC-1701');
  const cg = cg0;
  const sel = arrel.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const carrusel = arrel.querySelector('[data-carrusel="1"]');
  const retall = carrusel ? carrusel.firstElementChild : null;
  const tira = retall ? retall.firstElementChild : null;
  // La franja de la PAGINA 2: al document n'hi ha mes d'una (la de la taula
  // vertical, que va escalada dins una casella, i la de la pagina 1). La de la
  // filera es la que viu dins la vista de la pagina 2, que es `arrel`.
  const samarretes = arrel.querySelector('[data-stripe-visual-content="2"]');
  // LA COLUMNA DE COLLECCIONS: les targetes, de la primera a l'ultima.
  const targetes = [...arrel.querySelectorAll('[data-colleccions-targeta]')];
  if (!nx || !mz || !ncc || !cg || !sel || !tira) return null;

  const cy = (e) => { const b = e.getBoundingClientRect(); return (b.top + b.bottom) / 2; };
  const files = (root) => [...new Set([...root.querySelectorAll('button')]
    .map((b) => +b.getBoundingClientRect().top.toFixed(1)))].sort((a, b) => a - b);

  const filesColors = files(cg);
  const grid = nx.parentElement;
  // EL CARRUSEL DE DUES FILES INTERCALADES (24/09/2026).
  //
  // La graella de dibuixos ja no es 16x4: son DUES files i la de baix va
  // desplac,ada MIG PAS. Per aixo el `gap` util es el de DINS d'una fila (dues
  // peces veines de la mateixa fila) i el desplac,ament de la segona fila es
  // una mesura propia: amb el criteri vell (dues peces consecutives) el gap
  // sortia NEGATIU, perque les consecutives son de files diferents.
  //
  // Les peces surten de la TIRA (retall > tira): dins del carrusel tambe hi ha
  // els botons de les fletxes, i el seu `top` no es cap fila de dibuixos.
  const caixes = [...tira.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
  const filesDibuixos = [...new Set(caixes.map((b) => +b.top.toFixed(1)))].sort((a, b) => a - b);
  const esquerres = (i) => caixes
    .filter((b) => +b.top.toFixed(1) === filesDibuixos[i])
    .map((b) => +b.left.toFixed(1))
    .sort((a, b) => a - b);
  const fila0 = esquerres(0);
  const fila1 = filesDibuixos.length > 1 ? esquerres(1) : [];
  // LA SEGONA LINIA DE DIBUIXOS: es amb qui es centra el selector, i qui puja
  // per caure-hi (24/09/2026, ho va demanar l'amo).
  const segona = filesDibuixos.length > 1
    ? (() => {
      const f = caixes.filter((b) => +b.top.toFixed(1) === filesDibuixos[1]);
      return { top: Math.min(...f.map((b) => b.top)), bottom: Math.max(...f.map((b) => b.bottom)) };
    })()
    : null;
  const ample = +mz.getBoundingClientRect().width.toFixed(2);
  const barraB = cg.querySelector('button').getBoundingClientRect();
  const cgB = cg.getBoundingClientRect();
  const retallB = retall.getBoundingClientRect();
  const samB = samarretes ? samarretes.getBoundingClientRect() : null;
  const selB = sel.getBoundingClientRect();
  const primerEnllac = targetes.length ? targetes[0].getBoundingClientRect() : null;
  const darrerEnllac = targetes.length ? targetes[targetes.length - 1].getBoundingClientRect() : null;
  return {
    dibuix: ample,
    gapH: fila0.length > 1 ? +(fila0[1] - fila0[0] - ample).toFixed(2) : null,
    intercalat: (fila0.length && fila1.length) ? +(fila1[0] - fila0[0]).toFixed(2) : null,
    filesCarrusel: filesDibuixos.length,
    // LES BARRES DE COLOR: catorze, de 7x2, que ocupen el mateix que la graella
    // de dibuixos (el retall del carrusel).
    barra: +(barraB.width / barraB.height).toFixed(2),
    barres: cg.children.length,
    colorsAmple: +cgB.width.toFixed(2),
    retallAmple: +retallB.width.toFixed(2),
    // El selector es centra amb la SEGONA LINIA de dibuixos.
    selectorDelta: segona ? +(cy(sel) - (segona.top + segona.bottom) / 2).toFixed(2) : null,
    // La columna de colleccions: del top del selector al bottom de la franja.
    enllacDalt: +(primerEnllac.top - selB.top).toFixed(2),
    enllacBaix: +((darrerEnllac.bottom - samB.bottom)).toFixed(2),
    samarretesH: samB ? +samB.height.toFixed(1) : null,
    samarretesW: samB ? +samB.width.toFixed(1) : null,
    samarretesL: samB ? +samB.left.toFixed(1) : null,
    carril: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')) || null,
    carrilL: (() => { const f = document.querySelector('[data-capcalera-fila="1"]'); return f ? +f.getBoundingClientRect().left.toFixed(1) : null; })(),
    carrilR: (() => { const f = document.querySelector('[data-capcalera-fila="1"]'); return f ? +f.getBoundingClientRect().right.toFixed(1) : null; })(),
    fletxesR: (() => { const a = [...document.querySelectorAll('[data-carrusel="1"] #stripe-guide-right-arrow')].filter((el) => el.getBoundingClientRect().width > 0); return a.length ? +a[a.length - 1].getBoundingClientRect().right.toFixed(1) : null; })(),
    filesDibuixos: filesDibuixos.slice(0, 4),
    filesColors: filesColors.slice(0, 4),
  };
};

// Mirem si ja hi ha el preview engegat; si no, l'engeguem nosaltres i el
// tanquem en acabar, aixi n'hi ha prou amb aquesta ordre.
const viu = async () => {
  try {
    const r = await fetch(BASE, { method: 'HEAD' });
    return r.ok || r.status < 500;
  } catch {
    return false;
  }
};
let servidor = null;
if (!(await viu())) {
  console.log(`Engegant el preview a ${BASE}...`);
  servidor = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '3003'], {
    stdio: 'ignore',
    detached: false,
  });
  for (let i = 0; i < 40 && !(await viu()); i++) await new Promise((r) => setTimeout(r, 500));
  if (!(await viu())) {
    console.log('No s\'ha pogut engegar el preview al 3003. Fes un npm run build i torna-ho a provar.');
    process.exit(1);
  }
}
const tancar = () => { if (servidor) servidor.kill('SIGTERM'); };
process.on('exit', tancar);
process.on('SIGINT', () => { tancar(); process.exit(130); });

const navegador = await chromium.launch();
const resultats = {};
for (const c of CASES) {
  const ctx = await navegador.newContext({
    viewport: { width: c.ample, height: c.alt },
    hasTouch: c.touch,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  // LA RUTA QUE MIRA L'AMO (24/09/2026), i SENSE parametres: amb
  // `?active=first_contact` la franja de la pagina 2 es quedava sense ajustar a
  // 1440 i 1920 (mesurada a 2268x243 en comptes de fer el carril) i la
  // comparacio donava una falsa fallada. El megaslide s'obre amb el clic al
  // cercador, com a la resta d'estris.
  await page.goto(`${BASE}/nova/inici`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(2500);
  await page.click('button:has(svg.lucide-search)').catch(() => {});
  await page.waitForTimeout(4000);
  resultats[c.nom] = await page.evaluate(mesura);
  await ctx.close();
}
await navegador.close();

// --- Informe -----------------------------------------------------------------
const fallades = [];
const notes = [];
const files = [];
for (const c of CASES) {
  const r = resultats[c.nom];
  if (!r) {
    fallades.push(`${c.nom}: no s'ha trobat la graella (megaslide tancat o build vell?)`);
    files.push(`${c.nom.padEnd(18)}  sense dades`);
    continue;
  }
  files.push(`${c.nom.padEnd(18)}  dibuix ${String(r.dibuix).padStart(6)}  gap ${String(r.gapH).padStart(6)}  intercalat ${String(r.intercalat).padStart(6)}  barra ${String(r.barra).padStart(5)}  barres ${String(r.barres).padStart(2)}  selector ${String(r.selectorDelta).padStart(6)}  enllacs ${String(r.enllacDalt).padStart(6)}/${String(r.enllacBaix).padStart(6)}  samarretes ${String(r.samarretesH).padStart(6)}`);
}

const tauletes = CASES.filter((c) => c.tauleta).map((c) => c.nom);
const referencia = tauletes[0];

// (a) Dins de cada pantalla, les regles del CARRUSEL:
//   - DUES files de dibuixos;
//   - la de baix desplac,ada MIG PAS (es el que les intercala);
//   - el selector centrat amb la graella de colors.
//
// ABANS tambe s'exigia que les files de dibuixos caiguessin sobre les de colors.
// Aixo era la regla del disseny vell (una graella de 16x4 alineada amb el 4x4 de
// colors) i amb el carrusel de dues files grans ja no es certa ni es el que es
// vol: la peca fa 1,5 cops i les files dels dibuixos i dels colors son
// deliberadament diferents.
for (const c of CASES) {
  const r = resultats[c.nom];
  if (!r) continue;
  if (r.filesCarrusel !== 2) {
    fallades.push(`${c.nom}: el carrusel ha de tenir DUES files de dibuixos i en te ${r.filesCarrusel}`);
  }
  if (r.intercalat == null || r.gapH == null) {
    fallades.push(`${c.nom}: no s'ha pogut mesurar el carrusel (intercalat o gap)`);
  } else {
    const migPas = (r.dibuix + r.gapH) / 2;
    if (Math.abs(r.intercalat - migPas) > TOL_ALINEACIO) {
      fallades.push(`${c.nom}: la segona fila va ${r.intercalat} px desplac,ada i el mig pas es ${migPas.toFixed(2)} px`);
    }
  }
  // El selector Blanc/Color/Negre es centra amb la SEGONA LINIA de dibuixos.
  if (r.selectorDelta == null || Math.abs(r.selectorDelta) > TOL_ALINEACIO) {
    fallades.push(`${c.nom}: el selector no esta centrat amb la segona linia de dibuixos (${r.selectorDelta} px)`);
  }
  // Les barres de color: catorze, de 7x2 (3,50), i la fila ocupa el mateix que
  // la graella de dibuixos (el retall del carrusel).
  if (Math.abs(r.barra - 3.5) > 0.05) {
    fallades.push(`${c.nom}: les barres de color fan ${r.barra} i han de fer 7x2 (3,50)`);
  }
  if (r.barres !== 14) {
    fallades.push(`${c.nom}: la fila de colors ha de tenir 14 barres i en te ${r.barres}`);
  }
  if (Math.abs(r.colorsAmple - r.retallAmple) > TOL_MIDES) {
    fallades.push(`${c.nom}: la fila de colors fa ${r.colorsAmple} px i la graella de dibuixos ${r.retallAmple} px`);
  }
  // La columna de colleccions: les targetes, del top del selector al bottom de
  // la franja.
  if (Math.abs(r.enllacDalt) > TOL_ALINEACIO) {
    fallades.push(`${c.nom}: la primera targeta de colleccions cau ${r.enllacDalt} px del top del selector`);
  }
  if (Math.abs(r.enllacBaix) > TOL_ALINEACIO) {
    fallades.push(`${c.nom}: l'ultima targeta de colleccions cau ${r.enllacBaix} px del bottom de la franja`);
  }
}

// (b) Entre tauletes: les mateixes mides, el mateix patro de files i les
// mateixes alineacions.
for (const nom of tauletes.slice(1)) {
  const a = resultats[referencia];
  const b = resultats[nom];
  if (!a || !b) continue;
  for (const p of ['dibuix', 'gapH', 'barra']) {
    if (a[p] == null || b[p] == null) continue;
    const dif = Math.abs(a[p] - b[p]);
    if (dif > TOL_MIDES) fallades.push(`${p}: ${referencia} ${a[p]} vs ${nom} ${b[p]} (${dif.toFixed(2)} px)`);
  }
  for (const p of ['selectorDelta', 'enllacDalt', 'enllacBaix']) {
    const dif = Math.abs(a[p] - b[p]);
    if (dif > TOL_ALINEACIO) fallades.push(`${p}: ${referencia} ${a[p]} vs ${nom} ${b[p]} (${dif.toFixed(2)} px)`);
  }
  // L'alcada de la franja de samarretes NO es compara entre tauletes (24/09):
  // la franja s'ajusta a l'amplada del carril i el carril no fa el mateix a
  // 768 de peu que a 1024 estirat. El que s'ha de complir es la regla del
  // carril, i es comprova mes avall amb samarretesW.
  // El patro de files es compara amb marge: els decimals ballen una decima.
  const patro = (r) => r.filesColors.map((y) => +(y - r.filesColors[0]).toFixed(1));
  const pa = patro(a);
  const pb = patro(b);
  const patroDiferent = pa.length !== pb.length || pa.some((y, i) => Math.abs(y - pb[i]) > TOL_MIDES);
  if (patroDiferent) fallades.push(`patro de files: ${referencia} ${JSON.stringify(pa)} vs ${nom} ${JSON.stringify(pb)}`);
}

// (c) LA FRANJA DE SAMARRETES: les cintures de la primera i de l'ultima
// samarreta han de caure a la vora ESQUERRA DEL CARRIL i a la DRETA DEL BLOC DE
// FLETXES (o a la vora dreta del carril si no hi ha fletxes, com a les
// tauletes). Aixi les manigues, que son el que queda del dibuix, surten a fora.
// Ho calcula `useEscalaFranjaCarril`.
//
// A la vista vertical no s'hi aplica: alla la franja no va dins del carril,
// va dins d'una casella de la taula i amb una escala propia.
for (const c of CASES) {
  const r = resultats[c.nom];
  if (!r || r.samarretesW == null || r.samarretesL == null || r.carrilL == null) continue;
  if (c.ample < c.alt) continue;
  const esq = r.samarretesL + r.samarretesW * FRACCIO_MARGE_ESQUERRE_FRANJA;
  const dret = esq + r.samarretesW * FRACCIO_COSSOS_FRANJA;
  const objectiuDret = r.fletxesR ?? r.carrilR;
  const difEsq = Math.abs(esq - r.carrilL);
  const difDret = Math.abs(dret - objectiuDret);
  if (difEsq > TOL_FRANJA || difDret > TOL_FRANJA) {
    fallades.push(`franja: a ${c.nom} les cintures cauen a ${esq.toFixed(1)}..${dret.toFixed(1)} i han de caurre a ${r.carrilL}..${objectiuDret} (${difEsq.toFixed(1)} i ${difDret.toFixed(1)} px)`);
  } else {
    notes.push(`franja a ${c.nom}: cintures ${esq.toFixed(1)}..${dret.toFixed(1)} = carril ${r.carrilL}..${objectiuDret}`);
  }
}

if (!process.env.HG_BREU) {
  console.log('\nMesures del megaslide (pagina 2):\n');
  for (const l of files) console.log('  ' + l);
  console.log('');
}
if (notes.length) {
  console.log('Notes (no son errors):');
  for (const n of notes) console.log('  - ' + n);
  console.log('');
}
if (fallades.length) {
  console.log('LES VISTES NO QUADREN:');
  for (const f of fallades) console.log('  - ' + f);
  tancar();
  process.exit(1);
}
console.log(`OK: vertical i horitzontal donen les mateixes mides i alineacions (tolerancia ${TOL_MIDES}/${TOL_ALINEACIO} px).`);
tancar();
