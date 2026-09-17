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

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
// Diferencies tolerades (px): el soroll de mesura i la diferencia de caixa
// entre el dibuix i el cercle.
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
  const pel = (etiqueta) => [...document.querySelectorAll('button[aria-label]')]
    .find((x) => x.getAttribute('aria-label') === etiqueta);
  const nx = pel('NX-01');
  const mz = pel('Mazinger-Z');
  const ncc = pel('NCC-1701');
  const cg = ambMida('[data-p2-color-grid]');
  const sel = ambMida('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const samarretes = document.querySelector('[data-stripe-visual-content="2"]');
  if (!nx || !mz || !ncc || !cg || !sel) return null;

  const cy = (e) => { const b = e.getBoundingClientRect(); return (b.top + b.bottom) / 2; };
  const files = (root) => [...new Set([...root.querySelectorAll('button')]
    .map((b) => +b.getBoundingClientRect().top.toFixed(1)))].sort((a, b) => a - b);

  const filesColors = files(cg);
  const grid = nx.parentElement;
  return {
    dibuix: +mz.getBoundingClientRect().width.toFixed(2),
    gapH: +((ncc.getBoundingClientRect().left - nx.getBoundingClientRect().left)
      - mz.getBoundingClientRect().width).toFixed(2),
    cercle: +cg.querySelector('button').getBoundingClientRect().width.toFixed(2),
    pasColors: filesColors.length > 1 ? +(filesColors[1] - filesColors[0]).toFixed(2) : null,
    selectorDelta: +(cy(sel) - cy(cg)).toFixed(2),
    dibuixosDelta: +(cy(grid) - cy(cg)).toFixed(2),
    samarretesH: samarretes ? +samarretes.getBoundingClientRect().height.toFixed(1) : null,
    filesDibuixos: files(grid).slice(0, 4),
    filesColors: filesColors.slice(0, 4),
  };
};

const navegador = await chromium.launch();
const resultats = {};
for (const c of CASES) {
  const ctx = await navegador.newContext({
    viewport: { width: c.ample, height: c.alt },
    hasTouch: c.touch,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?active=first_contact`, { waitUntil: 'load', timeout: 45000 });
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
  files.push(`${c.nom.padEnd(18)}  dibuix ${String(r.dibuix).padStart(6)}  gap ${String(r.gapH).padStart(6)}  cercle ${String(r.cercle).padStart(5)}  pas ${String(r.pasColors).padStart(5)}  selector ${String(r.selectorDelta).padStart(6)}  files ${String(r.dibuixosDelta).padStart(5)}  samarretes ${String(r.samarretesH).padStart(6)}`);
}

const tauletes = CASES.filter((c) => c.tauleta).map((c) => c.nom);
const referencia = tauletes[0];

// (a) Dins de cada pantalla: les files de dibuixos han de caure a les mateixes
// alcades que les de colors, i el selector ha d'estar centrat amb la graella.
for (const c of CASES) {
  const r = resultats[c.nom];
  if (!r) continue;
  const base = r.filesColors[0];
  const desviament = (arr) => arr.map((y) => +(y - base).toFixed(1));
  const a = desviament(r.filesDibuixos);
  const b = desviament(r.filesColors);
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    fallades.push(`${c.nom}: les files de dibuixos ${JSON.stringify(a)} no cauen a les de colors ${JSON.stringify(b)}`);
  }
  if (Math.abs(r.selectorDelta) > TOL_ALINEACIO) {
    fallades.push(`${c.nom}: el selector no esta centrat amb la graella de colors (${r.selectorDelta} px)`);
  }
}

// (b) Entre tauletes: les mateixes mides, el mateix patro de files i les
// mateixes alineacions.
for (const nom of tauletes.slice(1)) {
  const a = resultats[referencia];
  const b = resultats[nom];
  if (!a || !b) continue;
  for (const p of ['dibuix', 'gapH', 'cercle', 'pasColors']) {
    if (a[p] == null || b[p] == null) continue;
    const dif = Math.abs(a[p] - b[p]);
    if (dif > TOL_MIDES) fallades.push(`${p}: ${referencia} ${a[p]} vs ${nom} ${b[p]} (${dif.toFixed(2)} px)`);
  }
  for (const p of ['selectorDelta', 'dibuixosDelta']) {
    const dif = Math.abs(a[p] - b[p]);
    if (dif > TOL_ALINEACIO) fallades.push(`${p}: ${referencia} ${a[p]} vs ${nom} ${b[p]} (${dif.toFixed(2)} px)`);
  }
  // L'alcada de la stripe de samarretes ([data-stripe-visual-content="2"])
  // nomes es compara amb la referencia del mateix amplada (1024), que es la
  // pagina que el vertical ha de reproduir: a 1366 creix amb el viewport,
  // mentre que la graella de dibuixos i els colors es queden igual.
  const difFranja = Math.abs((a.samarretesH ?? 0) - (b.samarretesH ?? 0));
  if (nom === 'horitzontal 1024') {
    if (difFranja > TOL_FRANJA) fallades.push(`alcada de la stripe de samarretes: ${referencia} ${a.samarretesH} vs ${nom} ${b.samarretesH} (${difFranja.toFixed(1)} px)`);
  } else if (difFranja > TOL_FRANJA) {
    notes.push(`la stripe de samarretes fa ${b.samarretesH} px a ${nom} i ${a.samarretesH} a ${referencia}: creix amb el viewport, la resta de peces no`);
  }
  const patro = (r) => JSON.stringify(r.filesColors.map((y) => +(y - r.filesColors[0]).toFixed(1)));
  if (patro(a) !== patro(b)) fallades.push(`patro de files: ${referencia} vs ${nom} no coincideixen`);
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
  process.exit(1);
}
console.log(`OK: vertical i horitzontal donen les mateixes mides i alineacions (tolerancia ${TOL_MIDES}/${TOL_ALINEACIO} px).`);
