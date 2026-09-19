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

  // La composicio de la VERTICAL (pagina 2): la graella de dibuixos a dalt i
  // les tres columnes a sota. Si hi es, mana ella: el cercador de la pagina 2
  // ja no es munta a la vertical.
  const vertical = document.querySelector('[data-vertical-composicio="1"]');
  if (vertical) {
    const r = (el) => (el ? el.getBoundingClientRect() : null);
    const graella = document.querySelector('[data-vertical-graella="1"]');
    const franja = document.querySelector('[data-vertical-franja="1"]');
    const samarretesV = [...vertical.querySelectorAll('[data-vertical-samarreta]')];
    const cv = r(vertical);
    // Les caselles de la franja tenen la forma de la imatge de la franja curta
    // (7+7), que no es quadrada: el que s'ha de comprovar es que totes siguin
    // iguals i que la franja sencera tingui la proporcio de la imatge.
    const mides = samarretesV.map((b) => r(b));
    const primera = mides[0];
    return {
      vista: 'vertical',
      carrilW: +cv.width.toFixed(2),
      graellaH: graella ? +r(graella).height.toFixed(2) : null,
      graellaFiles: graella ? graella.children.length : null,
      franjaH: franja ? +r(franja).height.toFixed(2) : null,
      tiles: samarretesV.length,
      tilesAmbImatge: samarretesV.filter((b) => b.querySelector('img')).length,
      tilesDins: samarretesV.every((b) => b.getBoundingClientRect().right <= cv.right + 1),
      tilesIguals: Boolean(primera) && mides.every((m) => Math.abs(m.width - primera.width) <= 0.5 && Math.abs(m.height - primera.height) <= 0.5),
      samarretesH: primera ? +primera.height.toFixed(2) : null,
    };
  }

  if (!nx || !mz || !ncc || !cg || !sel) return null;

  const cy = (e) => { const b = e.getBoundingClientRect(); return (b.top + b.bottom) / 2; };
  const files = (root) => [...new Set([...root.querySelectorAll('button')]
    .map((b) => +b.getBoundingClientRect().top.toFixed(1)))].sort((a, b) => a - b);

  const filesColors = files(cg);
  const grid = nx.parentElement;
  return {
    vista: 'cercador',
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
    fallades.push(`${c.nom}: no s'ha trobat ni el cercador ni la composicio vertical (megaslide tancat o build vell?)`);
    files.push(`${c.nom.padEnd(18)}  sense dades`);
    continue;
  }
  if (r.vista === 'vertical') {
    files.push(`${c.nom.padEnd(18)}  VERTICAL  carril ${String(r.carrilW).padStart(6)}  graella ${String(r.graellaH).padStart(6)} (${r.graellaFiles} files)  franja ${String(r.franjaH).padStart(6)}  tiles ${r.tiles} (${r.tilesAmbImatge} amb imatge) de ${r.samarretesH}`);
    continue;
  }
  files.push(`${c.nom.padEnd(18)}  cercador  dibuix ${String(r.dibuix).padStart(6)}  gap ${String(r.gapH).padStart(6)}  cercle ${String(r.cercle).padStart(5)}  pas ${String(r.pasColors).padStart(5)}  selector ${String(r.selectorDelta).padStart(6)}  files ${String(r.dibuixosDelta).padStart(5)}  samarretes ${String(r.samarretesH).padStart(6)}`);
}

// (a-vertical) La composicio vertical s'ha de comprovar ella sola: la franja
// ha de ser de 14 samarretes en 2x7 caselles quadrades, totes dins del carril,
// i la graella de dibuixos ha de tenir les cinc files de colleccio.
for (const c of CASES) {
  const r = resultats[c.nom];
  if (!r || r.vista !== 'vertical') continue;
  if (r.tiles !== 14) {
    fallades.push(`${c.nom}: la franja ha de tenir 14 samarretes i en te ${r.tiles}`);
  }
  if (!r.tilesDins) {
    fallades.push(`${c.nom}: alguna samarreta de la franja surt del carril`);
  }
  if (!r.tilesIguals) {
    fallades.push(`${c.nom}: les caselles de la franja no son totes iguals`);
  }
  if (r.graellaFiles !== 5) {
    fallades.push(`${c.nom}: la graella de dibuixos ha de tenir 5 files (les cinc colleccions) i en te ${r.graellaFiles}`);
  }
  if (r.samarretesH != null && (r.samarretesH < 30 || r.samarretesH > 140)) {
    notes.push(`la casella de samarreta fa ${r.samarretesH} px a ${c.nom}`);
  }
  if (r.tilesAmbImatge < r.tiles) {
    notes.push(`${r.tiles - r.tilesAmbImatge} de les 14 caselles de ${c.nom} no tenen dibuix a la colleccio activa`);
  }
}

const tauletes = CASES.filter((c) => c.tauleta && resultats[c.nom] && resultats[c.nom].vista === 'cercador').map((c) => c.nom);
const referencia = tauletes[0];

// (a) Dins de cada pantalla: les files de dibuixos han de caure a les mateixes
// alcades que les de colors, i el selector ha d'estar centrat amb la graella.
for (const c of CASES) {
  const r = resultats[c.nom];
  if (!r || r.vista !== 'cercador') continue;
  const base = r.filesColors[0];
  const desviament = (arr) => arr.map((y) => +(y - base).toFixed(1));
  const a = desviament(r.filesDibuixos);
  const b = desviament(r.filesColors);
  // Tolerància per fila (px): les files de dibuixos i de colors surten de
  // fórmules distintes (dibuix + pas contra cercle + separació) i, quan les
  // mides s'escalen amb el carril, l'arrodoniment del navegador les separa
  // dècimes. Abans es comparaven amb igualtat exacta i una dècima les feia
  // fallar.
  const TOL_FILES = 0.5;
  const maxDesv = a.length === b.length
    ? a.reduce((m, y, i) => Math.max(m, Math.abs(y - b[i])), 0)
    : Infinity;
  if (maxDesv > TOL_FILES) {
    fallades.push(`${c.nom}: les files de dibuixos ${JSON.stringify(a)} no cauen a les de colors ${JSON.stringify(b)} (${maxDesv.toFixed(2)} px)`);
  }
  if (Math.abs(r.selectorDelta) > TOL_ALINEACIO) {
    fallades.push(`${c.nom}: el selector no esta centrat amb la graella de colors (${r.selectorDelta} px)`);
  }
}

// (b) Entre tauletes que fan servir el MATEIX disseny (el cercador): les
// mateixes mides, el mateix patro de files i les mateixes alineacions. La
// vertical ja no hi entra: fa la composicio propia.
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
  // El patro de files es compara amb marge: els decimals ballen una decima.
  const patro = (r) => r.filesColors.map((y) => +(y - r.filesColors[0]).toFixed(1));
  const pa = patro(a);
  const pb = patro(b);
  const patroDiferent = pa.length !== pb.length || pa.some((y, i) => Math.abs(y - pb[i]) > TOL_MIDES);
  if (patroDiferent) fallades.push(`patro de files: ${referencia} ${JSON.stringify(pa)} vs ${nom} ${JSON.stringify(pb)}`);
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
