#!/usr/bin/env node
/**
 * Converteix els colors d'interficie de `src/` a la rampa de grisos freds.
 *
 *   node scripts/_tmp-tokens-converteix.mjs                 # DRY RUN (tot)
 *   node scripts/_tmp-tokens-converteix.mjs --familia=fons  # nomes una familia
 *   node scripts/_tmp-tokens-converteix.mjs --familia=fons --aplica
 *
 * Families (l'ordre acordat: dels tons suaus cap a les tintes):
 *   fons     backgrounds i gradients       -> paper / paper-soft / paper-tint / inks
 *   vores    borders, outlines, dividers   -> line / line-strong
 *   text     color, fill, stroke           -> ink* / muted*
 *
 * Regles:
 *  - Mai s'hi posa un token cru: sempre `hsl(var(--grey-*))`.
 *  - Els colors de producte (samarretes), les dades de palette, `src/dev/`,
 *    `src/config/` i `src/index.css` no es toquen.
 *  - Nomes es converteixen grisos: saturacio <= 0,16 o be un dels grisos
 *    d'interficie de la llista LLISTA (slate/gray de Tailwind i el #dfebed).
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARREL = dirname(dirname(fileURLToPath(import.meta.url)));
const EXTS = new Set(['.js', '.jsx', '.css']);

const FORA = [
  'src/dev/', 'src/lib/mockupPaths.js', 'src/lib/productRoutes.js', 'src/lib/cartImage.js',
  'src/lib/pdpMockup.js', 'src/utils/placeholders.js', 'src/data/collections.js',
  'src/components/fullwide/CercadorTopBar.jsx', 'src/components/ProductGallery.jsx',
  'src/components/ProductDetailPage.jsx', 'src/pages/ProductDetailPage.jsx', 'src/pages/FulfillmentSettingsPage.jsx',
  // Les banderes dels metodes de pagament (SVG amb `fill="#..."`) i els seus
  // grisos: son dibuixos, no interficie. `#F1F2F1` hi es 48 vegades i es el
  // BLANC de la bandera, no un fons.
  'src/pages/ShippingPage.jsx',
  'src/config/', 'src/index.css',
  // EINES DE MESURA I PANTALLES DE DESENVOLUPAMENT: els seus colors fan una
  // feina (regles, guies, contorns de depuracio) i no son la interficie.
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
  // Per a text no hi ha passos de VORA ni de PAPER SUAU: un text no es una
  // linia. Els grisos clars de text (desactivats) cauen a `muted`.
  text: ['paper', 'muted', 'muted-2', 'ink-soft', 'ink-2', 'ink', 'ink-strong', 'ink-pure'],
};

// Colors de producte (samarretes): mai no es converteixen.
const PRODUCTE = new Set([
  '#607060', '#8c8e90', '#4d5252', '#414545', '#ada7a1', '#777879', '#cbc5be',
  '#009c39', '#4f6751', '#2b2428', '#2b2422', '#0d1114', '#99afc6', '#91aec8',
  '#347dcd', '#0071d6', '#212b42', '#061431', '#49a256', '#edcc5d', '#f3c72e',
  '#e2a13b', '#f19800', '#bd2739', '#cb001d', '#332a28',
  // Banderes dels metodes de pagament (ShippingPage): son dibuixos, no interficie.
  '#012169', '#c8102e', '#ce1126', '#0d5eaf',
]);
// Grisos d'interficie de Tailwind (slate/gray) i el #dfebed de les pagines legals.
const LLISTA = new Set([
  '#f9fafb', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b',
  '#475569', '#334155', '#1e293b', '#0f172a', '#111827', '#0b0d10', '#dfebed',
  '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937',
  '#f3f4f6', '#e4e7eb', '#98a2b4', '#667085', '#475059', '#4a5057',
]);

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

function hexToHsl(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length > 6) h = h.slice(0, 6);
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = 60 * (((g - b) / d) % 6);
    else if (max === g) hue = 60 * ((b - r) / d + 2);
    else hue = 60 * ((r - g) / d + 4);
  }
  return { h: (hue + 360) % 360, s, l: l * 100 };
}

// Com es decideix la FAMILIA del token mirant enrere des del hex.
//
// Les classes arbitratries de Tailwind (`border-[#DFEBED]`) son les primeres:
// la finestra acaba just abans del hex, aixi que `$` hi encaixa exactament.
const REGLES = [
  [/(?:bg|background)-\[[^\]]*$/i, 'fons'],
  [/(?:text|fill|stroke|decoration|caret)-\[[^\]]*$/i, 'text'],
  [/(?:border|divide|ring|outline|shadow)-\[[^\]]*$/i, 'vores'],
  [/(?:background(?:Color|-color|-image)?|boxShadow)\s*[:=]/i, 'fons'],
  [/(?:^|[^A-Za-z])(?:border|outline|divide)(?:-(?:top|bottom|left|right|inline|block|color|width|style))?\s*[:=]/i, 'vores'],
  [/(?:^|[^A-Za-z-])(?:color|caretColor|textDecorationColor)\s*[:=]/i, 'text'],
  [/(?:fill|stroke)\s*[:=]/i, 'text'],
];

function familia(linia, posHex) {
  const tros = linia.slice(Math.max(0, posHex - 70), posHex);
  let triada = null;
  for (const [patro, nom] of REGLES) {
    const m = [...tros.matchAll(new RegExp(patro.source, 'gi'))].pop();
    if (!m) continue;
    const final = m.index + m[0].length;
    if (!triada || final > triada.final || (final === triada.final && m[0].length > triada.llarg)) {
      triada = { nom, final, llarg: m[0].length };
    }
  }
  if (triada) return triada.nom;
  // Variables de CSS (`--pauta-line: #E6E8EC`): mana el nom.
  const variable = tros.match(/--([A-Za-z0-9_-]+)\s*:\s*[^;]*$/);
  if (variable) {
    const nom = variable[1].toLowerCase();
    if (/line|vora|border|rule/.test(nom)) return 'vores';
    if (/bg|fons|paper|fons/.test(nom)) return 'fons';
  }
  return 'text';
}

const tokenMesProper = (llum, fam) => CANDIDATS[fam].reduce((a, b) => (Math.abs(RAMPA[b] - llum) < Math.abs(RAMPA[a] - llum) ? b : a));

const args = process.argv.slice(2);
const familiaFiltre = (args.find((a) => a.startsWith('--familia=')) || '').split('=')[1] || null;
const aplica = args.includes('--aplica');

const canvis = new Map();
let totalCanvis = 0;
const detall = [];

for (const f of fitxers(join(ARREL, 'src'))) {
  const rel = relative(ARREL, f);
  if (exclos(rel)) continue;
  const text = readFileSync(f, 'utf8');
  let nou = '';
  let ultim = 0;
  let tocat = false;
  for (const m of text.matchAll(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
    const hex = m[0].toLowerCase();
    const { s, l, h } = hexToHsl(hex);
    const esProducte = PRODUCTE.has(hex);
    const esGris = s <= 0.16 || LLISTA.has(hex);
    if (esProducte || !esGris) continue;
    // GUARDA: una linia amb tres colors o mes es una PALETA o un gradient de
    // dades; convertir-ne nome's un deixa la llista coixa.
    const liniaSencera = text.slice(text.lastIndexOf('\n', m.index) + 1, text.indexOf('\n', m.index) === -1 ? text.length : text.indexOf('\n', m.index));
    if ((liniaSencera.match(/#[0-9a-fA-F]{3,8}/g) || []).length > 2) continue;
    // GUARDA: un color dins d'un SVG que s'entrega com a DATA-URI no pot ser un
    // token. L'SVG del data-URI no hereta el CSS de la pagina, aixi que
    // `var(--grey-*)` no hi existeix i la mascara queda buida (01/10/2026: va
    // fer desaparèixer la franja de samarretes del megaslide).
    const seguent = text.slice(m.index, m.index + 400);
    if (/data:image\/svg\+xml/.test(seguent) && /fill=|stroke=|fill:|stroke:/.test(liniaSencera)) continue;
    // I encara mes clar: `setAttribute('fill'|'stroke', ...)` es SEMPRE SVG
    // generat (mascares i vels que s'entregen com a data-URI). Alla un token no
    // hi pot anar mai.
    if (/setAttribute\(['"](fill|stroke)['"]/.test(liniaSencera)) continue;
    // GUARDA: un hex dins d'una COMPARACIO o d'una llista de dades no es un
    // color. `const border = bg === '#ffffff' ? ...` no s'ha de tocar.
    const abans = text.slice(Math.max(0, m.index - 26), m.index);
    if (/[=!]==?\s*['"`]?$/.test(abans)) continue;
    if (/(?:includes|indexOf|Set|Map|Array|push|has)\s*\(?\s*[[(]?[^)\]]{0,12}['"`]?$/.test(abans)) continue;
    const linia = text.slice(text.lastIndexOf('\n', m.index) + 1, text.indexOf('\n', m.index) === -1 ? text.length : text.indexOf('\n', m.index));
    const fam = familia(linia, m.index - (text.lastIndexOf('\n', m.index) + 1));
    if (familiaFiltre && fam !== familiaFiltre) continue;
    const token = tokenMesProper(l, fam);
    const substitucio = `hsl(var(--grey-${token}))`;
    nou += text.slice(ultim, m.index) + substitucio;
    ultim = m.index + m[0].length;
    tocat = true;
    totalCanvis += 1;
    const clau = `${hex} -> ${token} (${fam})`;
    canvis.set(clau, (canvis.get(clau) || 0) + 1);
    if (detall.length < 40 || args.includes('--detall')) {
      const liniaNum = text.slice(0, m.index).split('\n').length;
      detall.push(`${rel}:${liniaNum} ${hex} -> ${token} [${fam}] l=${l.toFixed(0)}% :: ${linia.trim().slice(0, 110)}`);
    }
  }
  if (tocat) {
    nou += text.slice(ultim);
    if (aplica) {
      writeFileSync(f, nou);
      console.log(`ESCRIT ${rel}`);
    }
  }
}

console.log('\n--- pla (hex -> token)');
for (const [k, n] of [...canvis.entries()].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${k}`);
console.log(`\nTOTAL ${totalCanvis} substitucions${aplica ? ' APLICADES' : ' (dry run)'}${familiaFiltre ? ` [familia=${familiaFiltre}]` : ''}`);
if (!aplica && detall.length) { console.log('\n--- detall'); for (const d of detall) console.log(d); }
