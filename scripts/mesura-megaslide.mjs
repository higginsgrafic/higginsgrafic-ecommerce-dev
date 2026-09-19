#!/usr/bin/env node
/**
 * Mesura del megaslide: captura o comprova.
 *
 * Fa servir la MATEIXA funció que el mòdul de mesura única
 * (`src/utils/mesuraMegaslide.js`), així que el que comprova l'script és
 * exactament el que veurà el codi.
 *
 *   node scripts/mesura-megaslide.mjs            # comprova contra la baseline
 *   node scripts/mesura-megaslide.mjs --captura  # desa la baseline
 *   node scripts/mesura-megaslide.mjs --detall   # imprimeix totes les xifres
 *
 * Surt amb 1 si alguna xifra balla més de la tolerància. Serveix de xarxa de
 * seguretat quan es toca el sistema de mesura: si una passa no ha de moure
 * res, aquest script ho ha de dir.
 *
 * Cal el preview engegat (o l'engega sol, com el comparador).
 */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARREL = resolve(__dirname, '..');
// Es pot desar/Comparar contra una altra baseline amb `HG_BASELINE` (útil per
// comparar dues branques sense trepitjar la de referència del repositori).
const BASELINE = process.env.HG_BASELINE
  ? resolve(ARREL, process.env.HG_BASELINE)
  : resolve(ARREL, 'tests/baseline-megaslide.json');
const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';

// Tolerància en px: per sota d'això és soroll de mesura.
const TOL = 0.5;

// Les mides que cobreixen tots els camins de codi del megaslide.
const CASES = [
  { nom: 'tauleta vertical 768', ample: 768, alt: 1024, touch: true },
  { nom: 'tauleta apaisada 1024', ample: 1024, alt: 768, touch: true },
  { nom: 'banda estreta 1280x706', ample: 1280, alt: 706, touch: false },
  { nom: 'banda estreta 1280x800', ample: 1280, alt: 800, touch: false },
  { nom: 'banda estreta 1366', ample: 1366, alt: 768, touch: false },
  { nom: 'desktop 1440', ample: 1440, alt: 900, touch: false },
  { nom: 'desktop 1920', ample: 1920, alt: 1080, touch: false },
];

// --- Servidor -----------------------------------------------------------------
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
  servidor = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '3003'], { stdio: 'ignore', detached: false });
  for (let i = 0; i < 40 && !(await viu()); i++) await new Promise((r) => setTimeout(r, 500));
  if (!(await viu())) {
    console.log("No s'ha pogut engegar el preview al 3003. Fes un npm run build i torna-ho a provar.");
    process.exit(1);
  }
}
const tancar = () => { if (servidor) servidor.kill('SIGTERM'); };
process.on('exit', tancar);
process.on('SIGINT', () => { tancar(); process.exit(130); });

// --- Mesura -------------------------------------------------------------------
// El codi del mòdul s'executa DINS la pàgina, perquè és on hi ha el DOM.
const modul = readFileSync(resolve(ARREL, 'src/utils/mesuraMegaslide.js'), 'utf8');

/**
 * Espera que la posició de les peces s'estabilitzi i retorna la mesura.
 *
 * No n'hi ha prou amb un `waitForTimeout` fix: si la maquina va carregada, la
 * calibracio del megaslide triga mes i una mesura massa aviat dona xifres a mig
 * fer (fins a 30 px de diferencia). Aqui es mesura en bucle fins que dues
 * mesures seguides coincideixen.
 */
async function mesuraEstable(page, { intents = 14, espera = 400 } = {}) {
  let anterior = null;
  for (let i = 0; i < intents; i++) {
    const ara = await page.evaluate((codi) => {
      // eslint-disable-next-line no-new-func
      // El modul es ESM: per injectar-lo a la pagina cal treure'n les paraules
      // `export` (i la linea del default). Amb `export const` tambe.
      const codiNet = codi
        .replace(/export default[^\n]*/g, '')
        .replace(/export /g, '');
      const factory = new Function(`${codiNet}; return mesuraMegaslide;`);
      return factory()(document, window);
    }, modul);
    // Si encara no hi ha les peces clau (a vertical el selector viu en un altre
    // viewport i pot trigar a tenir mida), no és una mesura valida: s'espera.
    // Cal exigir TOTES les peces que entren als deltes, no nomes les posicions.
    const tePeces = ara?.selector?.p1 && ara?.selector?.p2 && ara?.colors && ara?.franja?.p1 && ara?.franja?.p2
      && ara.deltes.colorsMenysSelectorP2 !== null;
    const clau = (m) => JSON.stringify([m.deltes, m.franja.p2?.relTop, m.selector.p2?.relTop, m.colors?.relTop, m.guarda?.height]);
    if (tePeces && anterior && clau(anterior) === clau(ara)) return ara;
    anterior = ara;
    await page.waitForTimeout(espera);
  }
  return anterior;
}

const navegador = await chromium.launch();
const actual = {};
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
  await page.waitForTimeout(2500);
  actual[c.nom] = await mesuraEstable(page);
  await ctx.close();
}
await navegador.close();

// --- Comparació ---------------------------------------------------------------
if (process.argv.includes('--captura')) {
  writeFileSync(BASELINE, `${JSON.stringify(actual, null, 2)}\n`);
  console.log(`Baseline desada a ${BASELINE}`);
  console.log(`  (la de referencia del repositori es tests/baseline-megaslide.json)`);
  tancar();
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.log('No hi ha baseline. Executa primer: node scripts/mesura-megaslide.mjs --captura');
  tancar();
  process.exit(1);
}
const esperat = JSON.parse(readFileSync(BASELINE, 'utf8'));

/** Aixafa l'objecte en parelles "camí: valor" per comparar-lo pla. */
function pla(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v)) pla(v, `${prefix}${k}.`, out);
    else out[`${prefix}${k}`] = v;
  }
  return out;
}

// Camps que es comparen: els que descriuen la posició i la mida de les peces.
// Les variables CSS de calibració i les mides de finestra també.
const fallades = [];
let comprovades = 0;
for (const c of CASES) {
  const a = pla(actual[c.nom]);
  const e = pla(esperat[c.nom]);
  for (const [k, va] of Object.entries(a)) {
    const ve = e[k];
    if (ve === undefined) continue;
    if (typeof va === 'number' && typeof ve === 'number') {
      comprovades += 1;
      if (Math.abs(va - ve) > TOL) fallades.push(`${c.nom}: ${k} ${ve} -> ${va} (${(va - ve).toFixed(2)} px)`);
    } else if (va !== ve) {
      comprovades += 1;
      fallades.push(`${c.nom}: ${k} "${ve}" -> "${va}"`);
    }
  }
}

if (process.argv.includes('--detall')) {
  for (const c of CASES) {
    const m = actual[c.nom];
    console.log(`\n=== ${c.nom} ===`);
    console.log(`  panell   ${JSON.stringify(m.panell)}`);
    console.log(`  guarda   ${JSON.stringify(m.guarda)}`);
    console.log(`  selector p1 ${m.selector.p1 && m.selector.p1.relTop}   p2 ${m.selector.p2 && m.selector.p2.relTop}`);
    console.log(`  colors   ${m.colors && m.colors.relTop}`);
    console.log(`  franja   p1 ${m.franja.p1 && m.franja.p1.relTop}   p2 ${m.franja.p2 && m.franja.p2.relTop}`);
    if (m.vertical && m.vertical.composicio) {
      console.log(`  vertical composicio ${JSON.stringify([m.vertical.composicio.left, m.vertical.composicio.relTop, m.vertical.composicio.width, m.vertical.composicio.height])}`);
      console.log(`           graella ${m.vertical.graella && m.vertical.graella.height}  franja ${m.vertical.franja && m.vertical.franja.height}  samarretes ${m.vertical.samarretes} (${m.vertical.samarretesAmbImatge} amb imatge) de ${m.vertical.midaSamarreta} px  files ${m.vertical.files}`);
    }
    console.log(`  deltes   ${JSON.stringify(m.deltes)}`);
    console.log(`  vars     ${JSON.stringify(m.variables)}`);
  }
}

if (fallades.length) {
  console.log(`\nLA MESURA HA CANVIAT (${fallades.length} de ${comprovades} xifres, tolerancia ${TOL} px):`);
  for (const f of fallades.slice(0, 40)) console.log(`  - ${f}`);
  if (fallades.length > 40) console.log(`  ... i ${fallades.length - 40} mes`);
  tancar();
  process.exit(1);
}
console.log(`OK: ${comprovades} xifres iguals a la baseline (tolerancia ${TOL} px) a les ${CASES.length} mides.`);
tancar();
