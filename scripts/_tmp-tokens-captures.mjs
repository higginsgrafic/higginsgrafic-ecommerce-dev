#!/usr/bin/env node
/**
 * Captures de pantalla d'un joc de pantalles fix, per comparar abans/despres
 * de cada tanda de conversio de colors.
 *
 *   node scripts/_tmp-tokens-captures.mjs abans
 *   node scripts/_tmp-tokens-captures.mjs text-1
 *
 * Desa els PNG a `/tmp/_tmp-tokens/<etiqueta>/` i el resum a `.../resum.json`.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const ETIQUETA = process.argv[2] || 'abans';
const BASE = process.env.BASE || 'http://127.0.0.1:3003';
const DIR = `/tmp/_tmp-tokens/${ETIQUETA}`;
mkdirSync(DIR, { recursive: true });

const PANTALLES = [
  ['inici', '/', 2600],
  ['colleccio', '/austen', 2600],
  ['tdp', '/austen/quotes-it-is-a-truth', 2600],
  ['tdp-esp', '/the-human-inside/afrodita', 2600],
  ['checkout', '/checkout', 3200],
  ['legal', '/cc', 2200],
  ['cookies', '/cookies', 2200],
  ['contacte', '/contact', 2200],
  ['faq', '/faq', 2200],
  ['ofertes', '/offers', 2200],
  ['constructor', '/constructor/pdp', 2600],
  ['mega-mega', '/?active=austen', 3000],
  ['mega-cercador', '/austen/quotes-it-is-a-truth', 2600, 'cercador'],
];

const b = await chromium.launch();
const resum = [];
for (const [nom, ruta, espera, extra] of PANTALLES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  // Un article al cistell, perque /checkout no redirigeixi
  // El hero de la portada es SORTEJA a cada carrega: fem el `Math.random`
  // deterministic perque les captures siguin comparables.
  await p.addInitScript(() => {
    let llavor = 42;
    Math.random = () => { llavor = (llavor * 16807) % 2147483647; return llavor / 2147483647; };
    try {
      localStorage.setItem('cart', JSON.stringify([{
        id: 'test-1', title: 'IT IS A TRUTH', collection: 'AUSTEN', collectionSlug: 'austen-quotes',
        productRoute: 'quotes-it-is-a-truth', size: 'M', qty: 1, price: 15.5, shirtColor: 'white', variant: 'white',
      }]));
    } catch { /* ignore */ }
  });
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
  await p.goto(BASE + ruta, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(espera);
  if (extra === 'cercador') {
    const lupa = p.locator('button[aria-label="Cercador i catàleg"]').first();
    if (await lupa.count()) { await lupa.click({ force: true }); await p.waitForTimeout(2600); }
  }
  await p.screenshot({ path: `${DIR}/${nom}.png` });
  const estat = await p.evaluate(() => {
    // Empremta de la DISPOSICIO: si una tanda nome's canvia colors, aixo no es
    // mou. Es un hash de les mides i posicions de tots els elements.
    let h = 2166136261;
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      const t = `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)};`;
      for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    }
    return {
      url: location.pathname + location.search,
      alcada: Math.round(document.body.scrollHeight),
      imatgesTrencades: [...document.images].filter((i) => i.getBoundingClientRect().width > 2 && i.naturalWidth === 0).length,
      geometria: (h >>> 0).toString(16),
    };
  });
  resum.push({ nom, ...estat, errors: errors.slice(0, 3) });
  console.log(`${nom.padEnd(14)} ${estat.url.padEnd(28)} alcada=${estat.alcada} geom=${estat.geometria} trencades=${estat.imatgesTrencades} errors=${errors.length}`);
  await p.close();
}
writeFileSync(`${DIR}/resum.json`, JSON.stringify(resum, null, 1));
await b.close();
