#!/usr/bin/env node
/**
 * Congela la REFERENCIA de les pagines que s'han de refer.
 *
 * Fa captures de la pagina SENCERA (amplada completa, alcada completa) de cada
 * ruta i mida, i les desa a `docs/comparacio/fase0-referencia/`.
 *
 * Son el contracte de la fase 1: quan la pagina nova estigui feta, aquestes
 * captures diuen si esta a l'altura.
 *
 * Us:
 *   node scripts/captures-referencia.mjs                    # tot
 *   node scripts/captures-referencia.mjs nova               # a una carpeta nova
 *   HG_URL=http://127.0.0.1:3003 node scripts/captures-referencia.mjs
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const DESTI = process.argv[2] || 'fase0-referencia';
const OUT = path.resolve('docs/comparacio', DESTI);

/** Les rutes del cami del client que s'han de refer. */
const RUTES = [
  '/',
  '/cube',
  '/first-contact',
  '/miscellania',
  '/the-human-inside',
  '/austen',
];

/** Mides on es verifica tot. */
const MIDES = [
  { w: 768, h: 1024 },
  { w: 1024, h: 1366 },
  { w: 1440, h: 900 },
];

/** PNG 1x1 opac: una imatge neutra, perque les captures siguin deterministes
 *  sense deixar forats ni fer petar les peticions de l'aplicacio. */
const PNG_NEUTRE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

/** Substitueix les fotos de `/placeholders/` per una imatge neutra. */
async function neutralitzaPlaceholders(page) {
  await page.route('**/placeholders/**', (route) => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: PNG_NEUTRE,
  }));
}

/** Espera que la pagina hagi muntat el contingut (les rutes son mandroses). */
async function esperaMuntada(page) {
  await page
    .waitForFunction(() => document.documentElement.scrollHeight > window.innerHeight * 2, { timeout: 25000 })
    .catch(() => {});
  await page.waitForTimeout(2500);
}

const navegador = await chromium.launch();
await mkdir(OUT, { recursive: true });

const fetes = [];
for (const { w, h } of MIDES) {
  const ctx = await navegador.newContext({
    viewport: { width: w, height: h },
    hasTouch: w <= 1024,
    deviceScaleFactor: 1,
  });
  for (const ruta of RUTES) {
    const page = await ctx.newPage();
    await neutralitzaPlaceholders(page);
    await page.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    await esperaMuntada(page);

    // Alcada real de la pagina. La captura es fa amb `fullPage: true`:
    // `clip` no pot excedir la finestra i tallava la imatge a 1024 px.
    // Si Vite ha pintat la seva capa d'error, la captura no serveix.
    const teError = await page.evaluate(() => Boolean(
      document.querySelector('vite-error-overlay')
      || [...document.querySelectorAll('*')].some((e) => (e.shadowRoot && e.shadowRoot.querySelector('.message'))),
    ));
    if (teError) console.log('    AVIS: la pagina te la capa d\'error de Vite');
    const alcada = await page.evaluate(() => document.documentElement.scrollHeight);
    const nom = `${ruta === '/' ? 'inici' : ruta.replace(/^\//, '')}-${w}x${h}.png`;
    await page.screenshot({ path: path.join(OUT, nom), fullPage: true });
    fetes.push({ ruta, mida: `${w}x${h}`, alcada, fitxer: nom });
    console.log(`  ${nom.padEnd(34)} alcada=${alcada}px`);
    await page.close();
  }
  await ctx.close();
}
await navegador.close();

// Índex de la referencia, per saber que es va congelar i quan.
const index = {
  data: new Date().toISOString(),
  url: BASE,
  rutes: RUTES,
  mides: MIDES,
  captures: fetes,
};
await writeFile(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));
console.log(`\n${fetes.length} captures a docs/comparacio/${DESTI}/`);
