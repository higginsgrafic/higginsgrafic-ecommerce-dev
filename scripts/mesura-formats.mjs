#!/usr/bin/env node
/**
 * Mesura els formats que hem de tenir en compte, un per un.
 *
 * Els formats surten de les amplades CSS REALS dels aparells (no de suposicions):
 * la matriu de dispositius 2025 dona l'amplada CSS i el DPR de cada aparell, i
 * el que decideix la maquetacio es l'amplada CSS, no la fisica.
 *
 * Per a cada format mesura el que el desplegament s'ha de poder permetre:
 *
 *   - el tipus que li toca (`--appHeaderOffset`, alcada de capçalera, segona
 *     fila de colleccions),
 *   - L'ACCES AL CISTELL, que es el que no pot fallar mai: icona a la
 *     capçalera, pestanya a la barra inferior, o totes dues coses.
 *
 * Cal el servidor engegat (3003).   node scripts/mesura-formats.mjs
 */
import { chromium } from '@playwright/test';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';

// Amplada i alcada CSS de la PANTALLA. `chrome` es el que el navegador es
// menja d'alcada (barra de finestres + barra d'adreces), de la calibracio de
// `public/browser-overlay.html`. Alcada de finestra = h - chrome.
const FORMATS = [
  // --- Telefons, vertical (amplades CSS de la matriu 2025) ---
  { nom: 'Android 360 (Galaxy S25, Xiaomi)', tipus: 'telefon', w: 360, h: 640, chrome: 132 },
  { nom: 'iPhone SE/8', tipus: 'telefon', w: 375, h: 667, chrome: 132 },
  { nom: 'Android 384 (Galaxy S24+)', tipus: 'telefon', w: 384, h: 832, chrome: 132 },
  { nom: 'iPhone 12/13/14', tipus: 'telefon', w: 390, h: 844, chrome: 132 },
  { nom: 'iPhone 15/16', tipus: 'telefon', w: 393, h: 852, chrome: 132 },
  { nom: 'iPhone 16 Pro/17', tipus: 'telefon', w: 402, h: 874, chrome: 132 },
  { nom: 'Pixel 8/9/10', tipus: 'telefon', w: 412, h: 915, chrome: 132 },
  { nom: 'iPhone 15 Plus/Pro Max', tipus: 'telefon', w: 430, h: 932, chrome: 132 },
  { nom: 'iPhone 16/17 Pro Max', tipus: 'telefon', w: 440, h: 956, chrome: 132 },
  // --- Telefons, apaïsat (els mateixos, girats) ---
  { nom: 'Android 360 apaïsat', tipus: 'telefon-apaïsat', w: 640, h: 360, chrome: 50 },
  { nom: 'iPhone SE/8 apaïsat', tipus: 'telefon-apaïsat', w: 667, h: 375, chrome: 50 },
  { nom: 'Android 384 apaïsat', tipus: 'telefon-apaïsat', w: 832, h: 384, chrome: 50 },
  { nom: 'iPhone 12/13/14 apaïsat', tipus: 'telefon-apaïsat', w: 844, h: 390, chrome: 50 },
  { nom: 'iPhone 15/16 apaïsat', tipus: 'telefon-apaïsat', w: 852, h: 393, chrome: 50 },
  { nom: 'Pixel apaïsat', tipus: 'telefon-apaïsat', w: 915, h: 412, chrome: 50 },
  { nom: 'iPhone 15 Plus apaïsat', tipus: 'telefon-apaïsat', w: 932, h: 430, chrome: 50 },
  // --- Tauletes, vertical ---
  { nom: 'Galaxy Tab S9', tipus: 'tauleta', w: 533, h: 853, chrome: 72 },
  { nom: 'Galaxy Tab S9+', tipus: 'tauleta', w: 584, h: 934, chrome: 72 },
  { nom: 'Huawei MatePad Pro 12.2', tipus: 'tauleta', w: 613, h: 981, chrome: 72 },
  { nom: 'Galaxy Tab S9 Ultra', tipus: 'tauleta', w: 616, h: 1024, chrome: 72 },
  { nom: 'Huawei MatePad Pro 13.2', tipus: 'tauleta', w: 640, h: 1024, chrome: 72 },
  { nom: 'iPad mini 6', tipus: 'tauleta', w: 744, h: 1133, chrome: 72 },
  { nom: 'iPad 10.2', tipus: 'tauleta', w: 768, h: 1024, chrome: 72 },
  { nom: 'iPad Air 11', tipus: 'tauleta', w: 820, h: 1180, chrome: 72 },
  { nom: 'iPad Pro 11', tipus: 'tauleta', w: 834, h: 1194, chrome: 72 },
  { nom: 'iPad Air 13', tipus: 'tauleta', w: 1024, h: 1366, chrome: 72 },
  { nom: 'iPad Pro 13', tipus: 'tauleta', w: 1032, h: 1376, chrome: 72 },
  // --- Tauletes, apaïsat ---
  { nom: 'Galaxy Tab S9 apaïsada', tipus: 'tauleta-apaïsada', w: 853, h: 533, chrome: 78 },
  { nom: 'Galaxy Tab S9+ apaïsada', tipus: 'tauleta-apaïsada', w: 934, h: 584, chrome: 78 },
  { nom: 'MatePad 12.2 apaïsada', tipus: 'tauleta-apaïsada', w: 981, h: 613, chrome: 78 },
  { nom: 'Tab S9 Ultra apaïsada', tipus: 'tauleta-apaïsada', w: 1024, h: 616, chrome: 78 },
  { nom: 'MatePad 13.2 apaïsada', tipus: 'tauleta-apaïsada', w: 1024, h: 640, chrome: 78 },
  { nom: 'iPad mini apaïsada', tipus: 'tauleta-apaïsada', w: 1133, h: 744, chrome: 78 },
  { nom: 'iPad 10.2 apaïsada', tipus: 'tauleta-apaïsada', w: 1024, h: 768, chrome: 78 },
  { nom: 'iPad Air 11 apaïsada', tipus: 'tauleta-apaïsada', w: 1180, h: 820, chrome: 78 },
  { nom: 'iPad Pro 11 apaïsada', tipus: 'tauleta-apaïsada', w: 1194, h: 834, chrome: 78 },
  { nom: 'iPad Air 13 apaïsada', tipus: 'tauleta-apaïsada', w: 1366, h: 1024, chrome: 78 },
  { nom: 'iPad Pro 13 apaïsada', tipus: 'tauleta-apaïsada', w: 1376, h: 1032, chrome: 78 },
  // --- Portatils i escriptori (les alcades son les tipiques de pantalla) ---
  { nom: 'Portatil 1280 (MacBook Air 13)', tipus: 'escriptori', w: 1280, h: 800, chrome: 134 },
  { nom: 'Portatil 1366', tipus: 'escriptori', w: 1366, h: 768, chrome: 134 },
  { nom: 'Portatil 1440 (MacBook Air 15)', tipus: 'escriptori', w: 1440, h: 900, chrome: 134 },
  { nom: 'Portatil 1512 (MacBook Pro 14)', tipus: 'escriptori', w: 1512, h: 982, chrome: 134 },
  { nom: 'Portatil 1536 (Surface 7)', tipus: 'escriptori', w: 1536, h: 1024, chrome: 134 },
  { nom: 'Portatil 1728 (MacBook Pro 16)', tipus: 'escriptori', w: 1728, h: 1117, chrome: 134 },
  { nom: 'Escriptori 1920', tipus: 'escriptori', w: 1920, h: 1080, chrome: 134 },
  { nom: 'Escriptori 2560', tipus: 'escriptori', w: 2560, h: 1440, chrome: 134 },
];

// El mobil es decideix per amplada de finestra, pero el navegador tambe en
// menja: la finestra util es `w` i `h - chrome`.
const mesura = () => {
  const root = getComputedStyle(document.documentElement);
  const cap = document.querySelector('header');
  const visible = (e) => {
    if (!e) return false;
    const b = e.getBoundingClientRect();
    return b.width > 0 && b.height > 0 && b.top < window.innerHeight && getComputedStyle(e).display !== 'none';
  };
  const cistells = [...document.querySelectorAll('[aria-label]')]
    .filter((e) => /cistell/i.test(e.getAttribute('aria-label') || '') && !/afegir/i.test(e.getAttribute('aria-label')) && visible(e));
  const barra = [...document.querySelectorAll('nav')]
    .filter((e) => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().bottom > window.innerHeight - 20 && e.getBoundingClientRect().height > 20);
  const navs = cap ? [...cap.querySelectorAll('nav')].filter(visible).length : 0;
  const segona = cap ? [...cap.querySelectorAll('div')].some((d) => getComputedStyle(d).borderTopWidth === '1px' && Math.round(d.getBoundingClientRect().height) === 62) : false;
  const icones = document.querySelector('[data-icons-wrap="true"]');
  return {
    finestra: window.innerHeight,
    offset: parseInt(root.getPropertyValue('--appHeaderOffset'), 10) || 0,
    capcalera: cap ? Math.round(cap.getBoundingClientRect().height) : 0,
    segona,
    navs,
    iconesCapcalera: icones ? Math.round(icones.getBoundingClientRect().width) : 0,
    cistellCapcalera: cistells.length,
    barraInferior: barra.length,
    desborda: document.documentElement.scrollWidth > window.innerWidth + 1,
    zona: !!document.querySelector('[data-taula-inici="1"]'),
    misstatgeMobil: document.body.innerText.includes('encara no té la vista mòbil'),
  };
};

const navegador = await chromium.launch();
const files = [];
for (const f of FORMATS) {
  const alcadaFinestra = f.h - f.chrome;
  const page = await (await navegador.newContext({
    viewport: { width: f.w, height: alcadaFinestra },
    hasTouch: f.tipus !== 'escriptori',
    deviceScaleFactor: 1,
  })).newPage();
  const rutes = {};
  for (const ruta of ['/', '/nova/inici']) {
    await page.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 45000 });
    // Esperar el header NO es opcional: sense aixo, en arrencar en fred el
    // React encara no ha pintat i es mesura una pagina buida, que dona un
    // fals "no hi ha cap manera d'obrir el cistell".
    await page.waitForSelector('header', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1200);
    rutes[ruta] = await page.evaluate(mesura);
  }
  if (rutes['/'].capcalera === 0) {
    console.log(`  ! ${f.nom}: no s'ha pogut mesurar el header, es torna a provar`);
    await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 45000 });
    await page.waitForSelector('header', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
    rutes['/'] = await page.evaluate(mesura);
  }
  const a = rutes['/'];
  const n = rutes['/nova/inici'];
  const senseCistell = a.cistellCapcalera === 0 && a.barraInferior === 0;
  files.push({
    ...f, alcadaFinestra,
    offset: a.offset, capcalera: a.capcalera, segona: a.segona,
    icones: a.iconesCapcalera, cistellCap: a.cistellCapcalera, barra: a.barraInferior,
    zonaNova: n.zona, desborda: a.desborda || n.desborda,
    senseCistell,
    // Un format es "buit" si la pagina nova no hi pot pintar res
    novaPendent: !n.zona,
  });
  await page.context().close();
}
await navegador.close();

const ample = (s, n) => String(s ?? '').padEnd(n);
console.log('\nFORMATS DEL DESPLEGAMENT (mesurat al 3003)\n');
console.log(`${ample('format', 34)}${ample('finestra', 12)}${ample('offset', 8)}${ample('capç.', 7)}${ample('2a fila', 9)}${ample('icones', 8)}${ample('cistell', 9)}${ample('barra', 7)}${ample('cistell?', 10)}${ample('nova', 8)}desborda`);
for (const f of files) {
  console.log(
    ample(f.nom, 34)
    + ample(`${f.w}x${f.alcadaFinestra}`, 12)
    + ample(f.offset, 8)
    + ample(f.capcalera, 7)
    + ample(f.segona ? 'si' : 'no', 9)
    + ample(f.icones, 8)
    + ample(f.cistellCap, 9)
    + ample(f.barra, 7)
    + ample(f.senseCistell ? 'NO' : 'si', 10)
    + ample(f.novaPendent ? 'buit' : 'contingut', 8)
    + (f.desborda ? 'SI' : '')
  );
}
const forats = files.filter((f) => f.senseCistell);
console.log(`\nSENSE CAP MANERA D'OBRIR EL CISTELL (${forats.length} formats):`);
for (const f of forats) console.log(`  - ${f.nom}  (${f.w}x${f.h} CSS, finestra ${f.w}x${f.alcadaFinestra}, offset ${f.offset})`);
const desborden = files.filter((f) => f.desborda);
if (desborden.length) {
  console.log(`\nDESBORDEN HORITZONTALMENT (${desborden.length}):`);
  for (const f of desborden) console.log(`  - ${f.nom} (${f.w})`);
}
