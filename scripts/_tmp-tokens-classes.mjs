#!/usr/bin/env node
/**
 * Converteix les classes de color de Tailwind (les neutres) a la rampa de la
 * casa. Fa servir el MATEIX mapatge que `_tmp-tokens-converteix.mjs`: la classe
 * es resol al seu hex i el hex al seu token, aixi `text-gray-900` i `#111827`
 * acaben al mateix lloc.
 *
 *   node scripts/_tmp-tokens-classes.mjs            # dry run
 *   node scripts/_tmp-tokens-classes.mjs --aplica
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import colors from 'tailwindcss/colors.js';

const ARREL = dirname(dirname(fileURLToPath(import.meta.url)));
const EXTS = new Set(['.js', '.jsx', '.css']);
const FORA = [
  'src/dev/', 'src/lib/mockupPaths.js', 'src/lib/productRoutes.js', 'src/lib/cartImage.js',
  'src/lib/pdpMockup.js', 'src/utils/placeholders.js', 'src/data/collections.js',
  'src/components/fullwide/CercadorTopBar.jsx', 'src/components/ProductGallery.jsx',
  'src/components/ProductDetailPage.jsx', 'src/pages/ProductDetailPage.jsx',
  'src/pages/FulfillmentSettingsPage.jsx', 'src/pages/ShippingPage.jsx',
  'src/config/', 'src/index.css',
  'src/components/dev/', 'src/pages/dev/', 'src/components/RulerTool.jsx',
  'src/components/RulersGuidesOverlay.jsx', 'src/components/DebugButtonsBar.jsx',
  'src/components/GridDebugContext.jsx',
];

const RAMPA = {
  paper: 100, 'paper-soft': 97, 'paper-tint': 94, line: 92, 'line-strong': 84,
  muted: 74, 'muted-2': 60, 'ink-soft': 45, 'ink-2': 33, ink: 16,
  'ink-strong': 8, 'ink-pure': 2,
};
const CANDIDATS = {
  fons: ['paper', 'paper-soft', 'paper-tint', 'muted', 'muted-2', 'ink-soft', 'ink-2', 'ink', 'ink-strong', 'ink-pure'],
  vores: ['line', 'line-strong', 'muted-2', 'ink-soft', 'ink-2', 'ink', 'ink-strong', 'ink-pure'],
  text: ['paper', 'muted', 'muted-2', 'ink-soft', 'ink-2', 'ink', 'ink-strong', 'ink-pure'],
};
// Com es diu cada token a Tailwind (la rampa del config mes `muted-2`, que s'hi
// ha d'afegir: el 74 % ja te `muted-foreground`).
const CLASSE = {
  paper: 'paper', 'paper-soft': 'paper-soft', 'paper-tint': 'paper-tint',
  line: 'line', 'line-strong': 'line-strong',
  muted: 'muted-foreground', 'muted-2': 'muted-2',
  'ink-soft': 'ink-soft', 'ink-2': 'ink-2', ink: 'ink',
  'ink-strong': 'ink-strong', 'ink-pure': 'ink-pure',
};

const PALETA = { white: '#ffffff', black: '#000000' };
for (const familia of ['gray', 'slate', 'zinc', 'neutral', 'stone']) {
  for (const [pes, valor] of Object.entries(colors[familia])) {
    if (typeof valor === 'string') PALETA[`${familia}-${pes}`] = valor;
  }
}

function hexToLlum(hex) {
  const h = hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100;
}
const tokenMesProper = (llum, fam) => CANDIDATS[fam].reduce((a, b) => (Math.abs(RAMPA[b] - llum) < Math.abs(RAMPA[a] - llum) ? b : a));

const PREFIX_FAMILIA = [
  [/^(?:bg|from|via|to)$/, 'fons'],
  [/^(?:border|divide|ring|ring-offset|outline|decoration|shadow)$/, 'vores'],
  [/^(?:text|placeholder|fill|stroke|caret|accent)$/, 'text'],
];

const PATRO = /(^|[\s"'`])(!?)((?:[a-z-]+:)*)(bg|from|via|to|border|divide|ring|ring-offset|outline|decoration|shadow|text|placeholder|fill|stroke|caret|accent)-(white|black|(?:gray|slate|zinc|neutral|stone)-\d{2,3})(\/\d{1,3})?(?=[\s"'`]|$)/g;

const exclos = (rel) => FORA.some((f) => rel.startsWith(f));
function fitxers(dir, out = []) {
  for (const nom of readdirSync(dir)) {
    if (nom === 'node_modules' || nom === '.git') continue;
    const p = join(dir, nom);
    if (statSync(p).isDirectory()) fitxers(p, out);
    else if (EXTS.has(nom.slice(nom.lastIndexOf('.')))) out.push(p);
  }
  return out;
}

const aplica = process.argv.includes('--aplica');
const canvis = new Map();
let total = 0;

for (const f of fitxers(join(ARREL, 'src'))) {
  const rel = relative(ARREL, f);
  if (exclos(rel)) continue;
  const text = readFileSync(f, 'utf8');
  const nou = text.replace(PATRO, (sencer, pre, important, variants, utilitat, colorKey, opacitat = '') => {
    const hex = PALETA[colorKey];
    if (!hex) return sencer;
    const fam = (PREFIX_FAMILIA.find(([p]) => p.test(utilitat)) || [null, 'text'])[1];
    const token = tokenMesProper(hexToLlum(hex), fam);
    const clau = `${utilitat}-${colorKey} -> ${utilitat}-${CLASSE[token]}`;
    canvis.set(clau, (canvis.get(clau) || 0) + 1);
    total += 1;
    return `${pre}${important}${variants}${utilitat}-${CLASSE[token]}${opacitat}`;
  });
  if (nou !== text && aplica) { writeFileSync(f, nou); }
}

console.log('--- pla (classe -> classe)');
for (const [k, n] of [...canvis.entries()].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${k}`);
console.log(`\nTOTAL ${total} classes${aplica ? ' APLICADES' : ' (dry run)'}`);
