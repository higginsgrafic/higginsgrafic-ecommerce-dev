#!/usr/bin/env node
/**
 * Captures de referencia de les cinc colleccions, per comparar abans/despres de
 * cada pas de la fusio (Etapa B) i de la resta de canvis de layout.
 *
 *   node scripts/captures-colleccions.mjs                 # etiqueta per defecte
 *   node scripts/captures-colleccions.mjs abans-etapa-b   # etiqueta propia
 *   HG_URL=http://127.0.0.1:3203 node scripts/captures-colleccions.mjs ...
 *
 * Desa les imatges a docs/comparacio/<etiqueta>/<slug>-<ample>.png (aquesta
 * carpeta es gitignored: son referencies locals, no es versionen).
 *
 * Que captura: la part de dalt de cada pagina (hero, franges, icones i el
 * començament de la graella), a les cinc amplades de treball. NO es una captura
 * de pagina sencera a posta: el que es compara entre passos es el layout de
 * dalt, que es on viuen les mesures, i una captura sencera arrossega imatges
 * carregades de manera mandrosa i fa el diff sorollos.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const ETIQUETA = process.argv[2] || 'referencia';
const ALCADA_CAPTURA = 1000;

const CASES = [
  { nom: '768x1024', ample: 768, alt: 1024, touch: true },
  { nom: '1024x1366', ample: 1024, alt: 1366, touch: true },
  { nom: '1280x800', ample: 1280, alt: 800, touch: false },
  { nom: '1440x900', ample: 1440, alt: 900, touch: false },
  { nom: '1920x1080', ample: 1920, alt: 1080, touch: false },
];

const RUTES = [
  { slug: 'cube', ruta: '/cube' },
  { slug: 'first-contact', ruta: '/first-contact' },
  { slug: 'miscellania', ruta: '/miscellania' },
  { slug: 'the-human-inside', ruta: '/the-human-inside' },
  { slug: 'austen', ruta: '/austen' },
];

const dir = `docs/comparacio/${ETIQUETA}`;
mkdirSync(dir, { recursive: true });

const navegador = await chromium.launch();
let fetes = 0;

for (const c of CASES) {
  const ctx = await navegador.newContext({
    viewport: { width: c.ample, height: c.alt },
    hasTouch: c.touch,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  for (const { slug, ruta } of RUTES) {
    await page.goto(`${BASE}${ruta}`, { waitUntil: 'networkidle', timeout: 60000 });
    // El logo i la graella arriben amb el chunk de la capcalera (~1,1 s): esperem
    // tambe que existeixin, perque la captura els inclogui.
    await page.waitForSelector('[data-pauta-grid]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: `${dir}/${slug}-${c.nom}.png`,
      clip: { x: 0, y: 0, width: c.ample, height: Math.min(c.alt, ALCADA_CAPTURA) },
    });
    fetes++;
  }
  await ctx.close();
}

await navegador.close();
console.log(`${fetes} captures a ${dir}/ (${RUTES.length} colleccions x ${CASES.length} amplades)`);
