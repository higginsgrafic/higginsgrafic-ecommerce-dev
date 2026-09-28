// REFÀ EL CONFIG DEL VECTOR DE LA FRANJA DES DEL SVG (28/09/2026)
// ---------------------------------------------------------------------------
// `src/config/vectorFranja.js` porta els contorns de les catorze samarretes de
// la franja doble, i surten de `full-vector-stripe-doble.svg`. Cada cop que
// l'amo canvia aquell SVG (ho ha fet el 28/09/2026: el viewBox va passar de
// 1487x695 a 1487x643), aquests valors queden desquadrats i el `clipPath` de la
// vertical retalla amb una proporcio equivocada.
//
// Abans aixo es feia a ma. Aquest guio ho fa sempre igual:
//
//   1. Llegeix el viewBox i l'alcada del contingut (el `rect` del clip).
//   2. Agafa l'unic `<path>` del fitxer i el parteix en els seus subpaths.
//   3. Passa cada subpath a coordenades ABSOLUTES (l'SVG les porta relatives) i
//      deixa nome's M, L, C i Z, amb 4 decimals, com el config.
//   4. Calcula la caixa de cada samarreta i les ordena com el config: filera de
//      dalt (0-6) i filera de baix (7-13), sempre d'esquerra a dreta.
//   5. Escriu els quatre blocs del config i deixa la resta del fitxer intacta.
//
// Us: node scripts/vector-franja.mjs [svg] [config]
//     (sense arguments, els del projecte)
import { readFileSync, writeFileSync } from 'node:fs';

const SVG = process.argv[2] || 'public/placeholders/tablet vertical/full-vector-stripe-doble.svg';
const CONFIG = process.argv[3] || 'src/config/vectorFranja.js';

const svg = readFileSync(SVG, 'utf8');

const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
if (!vb) throw new Error(`${SVG}: no hi ha viewBox`);
const VW = Number(vb[1]);
const VH = Number(vb[2]);

const rect = svg.match(/<rect id="full-vector-stripe-doble"[^>]*height="([\d.]+)"/);
if (!rect) throw new Error(`${SVG}: no hi ha el rect del contingut`);
const CONTINGUT = Number(rect[1]);

const path = svg.match(/<path d="([^"]+)"/);
if (!path) throw new Error(`${SVG}: no hi ha cap path`);
const d = path[1];

/** Els numeros d'un tram d'atribut. */
const nums = (s) => (s.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
/** Un numero amb els 4 decimals del config. */
const n4 = (v) => {
  const r = Number(v.toFixed(4));
  return (Object.is(r, -0) ? 0 : r).toFixed(4);
};

// --- 1) El parser: parteix el `d` en subpaths ABSOLUTS ----------------------
// Cada subpath es una llista de trossos: { c: 'M'|'L'|'C', p: [x, y, ...] }.
const trossos = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
const subpaths = [];
let actual = null;
let cx = 0; let cy = 0; // el punt actual
let sx = 0; let sy = 0; // el comenc,ament del subpath
const obre = () => { actual = []; subpaths.push(actual); };

let m;
while ((m = trossos.exec(d)) !== null) {
  const cmd = m[1];
  const args = nums(m[2]);
  const rel = cmd === cmd.toLowerCase();
  const C = cmd.toUpperCase();
  if (C === 'Z') { if (actual) { actual.push({ c: 'Z', p: [] }); cx = sx; cy = sy; } continue; }
  const pas = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 }[C];
  if (!pas) throw new Error(`comanda no suportada: ${cmd}`);
  for (let i = 0; i < args.length; i += pas) {
    const a = args.slice(i, i + pas);
    if (C === 'M') {
      const x = rel ? cx + a[0] : a[0];
      const y = rel ? cy + a[1] : a[1];
      // Un `M` nou tanca el subpath anterior i n'obre un altre.
      obre();
      actual.push({ c: 'M', p: [x, y] });
      cx = x; cy = y; sx = x; sy = y;
    } else if (C === 'L') {
      const x = rel ? cx + a[0] : a[0];
      const y = rel ? cy + a[1] : a[1];
      actual.push({ c: 'L', p: [x, y] });
      cx = x; cy = y;
    } else if (C === 'H') {
      const x = rel ? cx + a[0] : a[0];
      actual.push({ c: 'L', p: [x, cy] });
      cx = x;
    } else if (C === 'V') {
      const y = rel ? cy + a[0] : a[0];
      actual.push({ c: 'L', p: [cx, y] });
      cy = y;
    } else if (C === 'C') {
      const p = rel
        ? [cx + a[0], cy + a[1], cx + a[2], cy + a[3], cx + a[4], cy + a[5]]
        : a;
      actual.push({ c: 'C', p });
      cx = p[4]; cy = p[5];
    } else if (C === 'S' || C === 'Q' || C === 'T' || C === 'A') {
      // L'SVG que passa l'amo no en fa servir cap; si un dia en surt una, val
      // mes aturar-se que escriure un path mal convertit.
      throw new Error(`comanda ${C} no contemplada: cal ampliar el guio`);
    }
  }
}

// --- 2) El text de cada subpath i la seva caixa ----------------------------
const texte = (sp) => sp.map((t) => (t.c === 'Z' ? 'Z' : `${t.c}${t.p.map(n4).join(',')}`)).join('');
// El separador dels `C` es un espai entre tripletes, com al config.
const texteBe = (sp) => sp.map((t) => {
  if (t.c === 'Z') return 'Z';
  if (t.c === 'C') {
    const [x1, y1, x2, y2, x, y] = t.p;
    return `C${n4(x1)},${n4(y1)} ${n4(x2)},${n4(y2)} ${n4(x)},${n4(y)}`;
  }
  return `${t.c}${n4(t.p[0])},${n4(t.p[1])}`;
}).join('');

const caixa = (sp) => {
  const xs = []; const ys = [];
  sp.forEach((t) => t.p.forEach((v, i) => (i % 2 === 0 ? xs.push(v) : ys.push(v))));
  return {
    x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys),
  };
};

const samarretes = subpaths
  .filter((sp) => sp.length > 1)
  .map((sp) => ({ sp, text: texteBe(sp), box: caixa(sp) }));

// --- 3) L'ordre del config: filera de dalt i filera de baix, d'esq. a dreta -
const mig = VH / 2;
const dalt = samarretes.filter((s) => (s.box.y + s.box.height / 2) < mig).sort((a, b) => a.box.x - b.box.x);
const baix = samarretes.filter((s) => (s.box.y + s.box.height / 2) >= mig).sort((a, b) => a.box.x - b.box.x);
const ordenades = [...dalt, ...baix];

if (ordenades.length !== 14) {
  throw new Error(`el SVG hauria de portar 14 samarretes i n'he trobat ${ordenades.length} (dalt ${dalt.length}, baix ${baix.length})`);
}

// --- 4) La capçalera i els quatre blocs del config -------------------------
const contingutComa = String(CONTINGUT).replace('.', ',');
const pct = ((100 * (VH - CONTINGUT)) / VH).toFixed(2).replace('.', ',');
const blocs = `/**
 * El contorn de cada samarreta de la franja, tret del full-vector-stripe-doble.svg,
 * amb un path independent per samarreta. L'index es el de la casella: 0-6 la
 * filera de dalt i 7-13 la de baix, sempre d'esquerra a dreta.
 *
 * MIDES: el viewBox del vector es ${VW} x ${VH}, pero el contingut (les samarretes)
 * arriba nomes fins a y = ${contingutComa}, que es l'alcada de la imatge. Per aixo la
 * referencia d'alcada es VECTOR_FRANJA_CONTINGUT i no el viewBox: si es pren
 * ${VH}, tot queda desquadrat un ${pct}% (uns ${Math.round(VH - CONTINGUT)} px a baix de tot).
 *
 * Aquest fitxer el refa \`scripts/vector-franja.mjs\` des del SVG: no s'hi toca a ma.
 */
export const VECTOR_FRANJA_VIEWBOX = { width: ${VW}, height: ${VH} };

/** Alcada real del contingut del vector (la de la imatge de la franja). */
export const VECTOR_FRANJA_CONTINGUT = ${CONTINGUT};

export const VECTOR_FRANJA_SAMARRETES = [
${ordenades.map((s) => `  '${s.text}',`).join('\n')}
];

/** La caixa de cada samarreta, en coordenades del vector. */
export const VECTOR_FRANJA_CAIXES = [
${ordenades.map((s) => `  { x: ${Number(s.box.x.toFixed(2))}, y: ${Number(s.box.y.toFixed(2))}, width: ${Number(s.box.width.toFixed(2))}, height: ${Number(s.box.height.toFixed(2))} },`).join('\n')}
]

/** Els mateixos paths amb coordenades 0-1 (x/${VW}, y/${String(CONTINGUT).replace('.', ',')}) per al clipPath. */
export const VECTOR_FRANJA_SAMARRETES_01 = [
${ordenades.map((s) => {
  const u = s.sp.map((t) => {
    if (t.c === 'Z') return 'Z';
    const p = [];
    for (let i = 0; i < t.p.length; i += 2) p.push(`${n4(t.p[i] / VW)},${n4(t.p[i + 1] / CONTINGUT)}`);
    return `${t.c}${p.join(t.c === 'C' ? ' ' : '')}`;
  }).join('');
  return `  '${u}',`;
}).join('\n')}
];
`;

// --- 5) Escriure nome's els quatre blocs, la resta del fitxer no es toca ----
const config = readFileSync(CONFIG, 'utf8');
const inici = config.indexOf('/**');
const marca = 'export const VECTOR_FRANJA_SAMARRETES_01 = [';
const inici01 = config.indexOf(marca);
if (inici < 0 || inici01 < 0) throw new Error(`${CONFIG}: no hi ha els blocs del vector`);
const fi = config.indexOf('\n];', inici01);
if (fi < 0) throw new Error(`${CONFIG}: no trobo el final de VECTOR_FRANJA_SAMARRETES_01`);

const nou = config.slice(0, inici) + blocs + config.slice(fi + 4);
writeFileSync(CONFIG, nou);

console.log(`viewBox ${VW}x${VH}   contingut ${CONTINGUT}   samarretes ${ordenades.length} (dalt ${dalt.length} + baix ${baix.length})`);
ordenades.forEach((s, i) => {
  const b = s.box;
  console.log(`  ${String(i).padStart(2)}  x=${b.x.toFixed(2).padStart(8)}  y=${b.y.toFixed(2).padStart(7)}  ${b.width.toFixed(2)} x ${b.height.toFixed(2)}`);
});
