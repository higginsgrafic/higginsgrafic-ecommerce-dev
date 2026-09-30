#!/usr/bin/env node
/**
 * Inventari dels colors d'interficie que queden a `src/`, per a la conversio a
 * la rampa de grisos freds.
 *
 *   node scripts/_tmp-tokens-inventari.mjs            # resum
 *   node scripts/_tmp-tokens-inventari.mjs --per-fitxer
 *   node scripts/_tmp-tokens-inventari.mjs --classes  # classes de Tailwind
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARREL = dirname(dirname(fileURLToPath(import.meta.url)));
const EXTS = new Set(['.js', '.jsx', '.css']);

// Fitxers on els hex son DADES (colors de samarreta o de producte): no es toquen.
const FORA = [
  'src/dev/',
  'src/lib/mockupPaths.js',
  'src/lib/productRoutes.js',
  'src/lib/cartImage.js',
  'src/lib/pdpMockup.js',
  'src/utils/placeholders.js',
  'src/data/collections.js',
  'src/components/fullwide/CercadorTopBar.jsx',
  'src/components/ProductGallery.jsx',
  'src/components/ProductDetailPage.jsx',
  'src/pages/FulfillmentSettingsPage.jsx',
  'src/config/',
  'public/',
  // La rampa viu aqui: els hex d'aquest fitxer son llegat, no s'hi toca res.
  'src/index.css',
];

// La rampa: nom del token -> llum (%) del to 210 amb saturacio 10.
export const RAMPA = [
  ['paper', 100], ['paper-soft', 97], ['paper-tint', 94], ['line', 92],
  ['line-strong', 84], ['muted', 74], ['muted-2', 60], ['ink-soft', 45],
  ['ink-2', 33], ['ink', 16], ['ink-strong', 8], ['ink-pure', 2],
];

// Colors de producte coneguts (samarretes): mai no s'han de convertir.
const PRODUCTE = new Set([
  '#607060', '#8c8e90', '#4d5252', '#414545', '#ada7a1', '#777879', '#cbc5be',
  '#009c39', '#4f6751', '#2b2428', '#2b2422', '#0d1114', '#99afc6', '#91aec8',
  '#347dcd', '#0071d6', '#212b42', '#061431', '#49a256', '#edcc5d', '#f3c72e',
  '#e2a13b', '#f19800', '#bd2739', '#cb001d', '#332a28',
]);

function fitxers(dir, out = []) {
  for (const nom of readdirSync(dir)) {
    if (nom === 'node_modules' || nom === '.git') continue;
    const p = join(dir, nom);
    if (statSync(p).isDirectory()) fitxers(p, out);
    else if (EXTS.has(nom.slice(nom.lastIndexOf('.')))) out.push(p);
  }
  return out;
}

const exclos = (rel) => FORA.some((f) => rel.startsWith(f) || rel === f.replace(/\/$/, ''));

const fitxersSrc = fitxers(join(ARREL, 'src')).filter((f) => !exclos(relative(ARREL, f)));

function hexToHsl(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = 60 * (((g - b) / d) % 6);
    else if (max === g) hue = 60 * ((b - r) / d + 2);
    else hue = 60 * ((r - g) / d + 4);
  }
  return { h: (hue + 360) % 360, s, l: l * 100 };
}

const tokenMesProper = (llum) => RAMPA.reduce((a, b) => (Math.abs(b[1] - llum) < Math.abs(a[1] - llum) ? b : a))[0];

const mode = process.argv[2] || '';

if (mode === '--classes') {
  const patro = /\b(bg|text|border|divide|ring|from|to|via|placeholder|decoration|outline|fill|stroke|shadow|accent|caret)-((?:gray|slate|zinc|neutral|stone|white|black|red|blue|green|yellow|amber|orange|indigo|purple|pink|teal|cyan|emerald|lime|sky|violet|fuchsia|rose)(?:-\d{2,3})?(?:\/\d{1,3})?)\b/g;
  const comptes = new Map();
  for (const f of fitxersSrc) {
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(patro)) {
      const clau = `${m[1]}-${m[2]}`;
      const e = comptes.get(clau) || { n: 0, fitxers: new Set() };
      e.n += 1; e.fitxers.add(relative(ARREL, f));
      comptes.set(clau, e);
    }
  }
  const llista = [...comptes.entries()].sort((a, b) => b[1].n - a[1].n);
  let total = 0;
  for (const [clau, v] of llista) { total += v.n; console.log(`${String(v.n).padStart(5)}  ${clau.padEnd(28)} ${v.fitxers.size} fitxers`); }
  console.log(`\nTOTAL ${total} classes en ${llista.length} noms distints`);
} else {
  const perValor = new Map();
  for (const f of fitxersSrc) {
    const text = readFileSync(f, 'utf8');
    text.split('\n').forEach((linia, i) => {
      for (const m of linia.matchAll(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
        const hex = m[0].toLowerCase();
        const e = perValor.get(hex) || { n: 0, llocs: new Set(), files: new Map() };
        e.n += 1;
        e.files.set(relative(ARREL, f), (e.files.get(relative(ARREL, f)) || 0) + 1);
        e.llocs.add(`${relative(ARREL, f)}:${i + 1}`);
        perValor.set(hex, e);
      }
    });
  }
  const llista = [...perValor.entries()].sort((a, b) => b[1].n - a[1].n);
  let neutres = 0, accents = 0, producte = 0;
  for (const [hex, v] of llista) {
    const { h, s, l } = hexToHsl(hex);
    const esProducte = PRODUCTE.has(hex);
    const esNeutre = s <= 0.16 || hex === '#ffffff' || hex === '#000000' || hex === '#fff';
    const etiqueta = esProducte ? 'PRODUCTE' : esNeutre ? `neutre -> ${tokenMesProper(l)} (${l.toFixed(0)}%, h${h.toFixed(0)} s${(s * 100).toFixed(0)})` : `accent h${h.toFixed(0)} s${(s * 100).toFixed(0)}`;
    if (esProducte) producte += v.n; else if (esNeutre) neutres += v.n; else accents += v.n;
    const top = [...v.files.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${k.split('/').pop()}(${n})`).join(' ');
    console.log(`${String(v.n).padStart(5)}  ${hex.padEnd(9)} ${etiqueta.padEnd(46)} ${top}`);
  }
  console.log(`\nTOTAL ${neutres + accents + producte} usos: ${neutres} neutres, ${accents} accents, ${producte} de producte`);
  if (mode === '--per-fitxer') {
    const perFitxer = new Map();
    for (const [hex, v] of llista) for (const [f, n] of v.files) perFitxer.set(f, (perFitxer.get(f) || 0) + n);
    console.log('\n--- per fitxer');
    for (const [f, n] of [...perFitxer.entries()].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${f}`);
  }
}
