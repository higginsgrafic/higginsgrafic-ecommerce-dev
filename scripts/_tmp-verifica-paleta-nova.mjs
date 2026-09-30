// TEMPORAL (29/09/2026): comprova que la paleta nova (14 colors) es coherent a
// tot arreu: la llista canonica, els fitxers de mockup i les pastilles.
// Us: node scripts/_tmp-verifica-paleta-nova.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SHIRT_COLORS, COLLECTIONS, getMockupPath, INK_BLACK, INK_WHITE } from '../src/lib/mockupPaths.js';

const ARREL = fileURLToPath(new URL('../public', import.meta.url));
// L'ORDRE BO es el de la tira de colors de l'amo (29/09/2026, vist a la seva
// captura): irish-green i military-green van ABANS de daisy i gold, i black
// tanca la filera.
const ESPERATS = [
  'white', 'light-blue', 'royal', 'navy', 'irish-green', 'military-green',
  'daisy', 'gold', 'red', 'dark-chocolate', 'ice-grey', 'rs-sport-grey',
  'charcoal', 'black',
];
const VELLS = ['purple', 'light-pink', 'kiwi', 'forest-green'];

let mals = 0;
const mal = (m) => { mals++; console.log('  MAL: ' + m); };

// 1. La llista canonica.
if (JSON.stringify(SHIRT_COLORS) !== JSON.stringify(ESPERATS)) {
  mal(`SHIRT_COLORS no es la llista esperada:\n    ${SHIRT_COLORS.join(', ')}`);
} else {
  console.log('  SHIRT_COLORS: 14/14 correctes');
}

// 2. Tots els mockups que el codi pot demanar existeixen.
let demanats = 0, absents = 0;
for (const [id, def] of Object.entries(COLLECTIONS)) {
  for (const design of def.designs) {
    for (const ink of def.inks) {
      for (const color of SHIRT_COLORS) {
        const p = getMockupPath({ collection: id, design, shirtColor: color, ink });
        if (!p) { mal(`${id}/${design}/${ink}/${color}: getMockupPath -> null`); continue; }
        demanats++;
        if (!existsSync(ARREL + p.replace('/placeholders', '/placeholders'))) {
          absents++;
          if (absents <= 20) mal(`no hi es: public${p}`);
        }
      }
    }
  }
}
console.log(`  mockups demanats: ${demanats} · absents: ${absents}`);

// 2a. TOTES les llistes escrites a mà han de tenir l'ordre de la tira de l'amo.
// (El 29/09/2026 se'n va escapar l'ordre i aquesta comprovacio el caça.)
const LLISTES = [
  ['src/lib/mockupPaths.js', /SHIRT_COLORS = \[([\s\S]*?)\];/],
  ['src/components/ProductDetailTemplate.jsx', /OFFICIAL_COLORS = \[([\s\S]*?)\];/],
  ['src/pages/PdpPage.jsx', /OFFICIAL_COLORS = \[([\s\S]*?)\];/],
  ['src/pages/PdpMobile.jsx', /OFFICIAL_COLORS = \[([\s\S]*?)\];/],
  ['src/pages/ConstructorPdpPreview.jsx', /OFFICIAL_COLORS = \[([\s\S]*?)\];/],
  ['src/lib/pdpMockup.js', /SHIRT_COLOR_ORDER = \[([\s\S]*?)\];/],
  ['src/components/home/homeDrawings.js', /export const SHIRT_COLORS = \[([\s\S]*?)\];/],
  ['src/config/collectionVertical.js', /const CANON_COLORS = \[([\s\S]*?)\];/],
  ['src/lib/productRoutes.js', /export const ALL_COLORS = \[([\s\S]*?)\];/],
  ['src/pages/productRail/TambeRail.jsx', /const DEFAULT_IMAGES = \[([\s\S]*?)\];/],
];
for (const [fitxer, re] of LLISTES) {
  const txt = readFileSync(new URL('../' + fitxer, import.meta.url), 'utf8');
  const m = txt.match(re);
  if (!m) { mal(`${fitxer}: no he trobat la llista`); continue; }
  const slugs = [...m[1].matchAll(/['"]([a-z-]+)['"]/g)].map((x) => x[1]);
  const llista = slugs.filter((s) => ESPERATS.includes(s));
  const ok = JSON.stringify(llista) === JSON.stringify(ESPERATS);
  if (!ok) mal(`${fitxer}: ordre ${llista.join(', ')}`);
  else console.log(`  ${fitxer}: 14/14 en l'ordre bo`);
}

// Les graelles 4x4 (16 cel·les = els 14 + white i light-blue repetits).
const GRAELLES = [
  ['src/config/collectionVertical.js', /const TDP_GRID_COLORS = \[([\s\S]*?)\];/],
  ['src/pages/ConstructorColleccioPage.jsx', /const TDP_GRID_COLORS = \[([\s\S]*?)\];/],
];
for (const [fitxer, re] of GRAELLES) {
  const txt = readFileSync(new URL('../' + fitxer, import.meta.url), 'utf8');
  const m = txt.match(re);
  if (!m) { mal(`${fitxer}: no he trobat la graella`); continue; }
  const slugs = [...m[1].matchAll(/['"]([a-z-]+)['"]/g)].map((x) => x[1]);
  const esperatGraella = [...ESPERATS, 'white', 'light-blue'];
  const ok = JSON.stringify(slugs) === JSON.stringify(esperatGraella);
  if (!ok) mal(`${fitxer}: graella ${slugs.join(', ')}`);
  else console.log(`  ${fitxer}: graella 4x4 en l'ordre bo`);
}

// 2b. La regla de la inversio (29/09/2026): els colors clars i els foscos nous
// es tracten com el blanc i el negre. Comprova que existeixin TOTES les
// variants de tinta de linia (b i w) per als 7 colors que s'inverteixen.
const INVERTITS = ['white', 'ice-grey', 'rs-sport-grey', 'black', 'navy', 'dark-chocolate', 'charcoal'];
let invDemanats = 0, invAbsents = 0;
for (const [id, def] of Object.entries(COLLECTIONS)) {
  for (const design of def.designs) {
    for (const ink of [INK_BLACK, INK_WHITE]) {
      if (!def.inks.includes(ink)) continue;
      for (const color of INVERTITS) {
        const p = getMockupPath({ collection: id, design, shirtColor: color, ink });
        invDemanats++;
        if (!p || !existsSync(ARREL + p)) {
          invAbsents++;
          if (invAbsents <= 10) mal(`inversio: no hi es public${p}`);
        }
      }
    }
  }
}
console.log(`  variants d'inversio (b/w × white, black, navy, dark-chocolate): ${invDemanats} · absents: ${invAbsents}`);

// 2c. LA INVERSIO, PER PARELLES (29/09/2026): la tinta de linia de cada
// samarreta dels 6 colors de les parelles. Nomes comprova que el fitxer
// existeix i que la TINTA es la que toca pel nom — el contrast es una decisio
// de disseny i NO es jutja aqui.
//   b-white · b-light-blue · b-ice-grey        (tinta fosca)
//   w-black · w-navy · w-dark-chocolate        (tinta clara)
const PARELLES = [
  ['b-white', 'fosca'], ['w-black', 'clara'],
  ['b-light-blue', 'fosca'], ['w-navy', 'clara'],
  ['b-ice-grey', 'fosca'], ['w-dark-chocolate', 'clara'],
];
const MOSTRA = [
  'first_contact/first-contact-nx-01',
  'the_human_inside/the-human-inside-vader',
  'austen/cites/quotes/austen-cites-quotes-quotes-it-is-a-truth',
  'miscellania/r2d2_quote/miscellania-r2d2-quote-r2d2-quote',
  'austen/crosswords/persuasion/austen-crosswords-persuasion-persuasion-1',
];
const arrelMockups = ARREL + '/placeholders/apparel/mockups';
const { chromium } = await import('@playwright/test');
const navegador = await chromium.launch();
const pagina = await (await navegador.newContext()).newPage();
await pagina.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 120000 });
const mesura = await pagina.evaluate(async ({ casos }) => {
  const out = [];
  for (const { url, nom } of casos) {
    const img = new Image();
    img.src = url;
    try { await img.decode(); } catch { out.push({ nom, error: 'no carrega' }); continue; }
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const sx = img.naturalWidth / 800, sy = img.naturalHeight / 800;
    const valors = [];
    for (let x = 300; x < 480; x += 4) for (let y = 250; y < 330; y += 4) {
      const d = ctx.getImageData(Math.round(x * sx), Math.round(y * sy), 1, 1).data;
      valors.push(0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]);
    }
    const fons = [];
    for (let x = 320; x < 460; x += 4) for (let y = 400; y < 520; y += 4) {
      const d = ctx.getImageData(Math.round(x * sx), Math.round(y * sy), 1, 1).data;
      fons.push(0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]);
    }
    valors.sort((a, b) => a - b); fons.sort((a, b) => a - b);
    const f = fons[Math.floor(fons.length / 2)];
    const p1 = valors[Math.floor(valors.length / 100)];
    const p99 = valors[Math.floor(99 * valors.length / 100)];
    out.push({
      nom,
      tinta: Math.abs(p1 - f) > Math.abs(p99 - f) ? 'fosca' : 'clara',
    });
  }
  return out;
}, { casos: MOSTRA.flatMap((base) => PARELLES.map(([sufix]) => ({ nom: `${base}-${sufix}`, url: `/placeholders/apparel/mockups/${base}-${sufix}.webp` }))) });
await navegador.close();
let parellesMal = 0;
for (const m of mesura) {
  if (m.error) { parellesMal++; mal(`parella ${m.nom}: ${m.error}`); continue; }
  const to = PARELLES.find(([s]) => m.nom.endsWith(`-${s}`))?.[1];
  if (m.tinta !== to) {
    parellesMal++;
    mal(`parella ${m.nom}: tinta ${m.tinta} (esperava ${to})`);
  }
}
console.log(`  parelles inverses (6 fitxers × ${MOSTRA.length} dissenys): ${mesura.length} · malament: ${parellesMal}`);

// 3. Cap fitxer de mockup amb color vell.
import { readdirSync } from 'node:fs';

let vells = [];
const camina = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = dir + '/' + e.name;
    if (e.isDirectory()) { if (e.name !== 'tmp') camina(p); continue; }
    if (!e.name.endsWith('.webp')) continue;
    for (const v of VELLS) if (e.name.endsWith(`-${v}.webp`)) vells.push(p);
  }
};
camina(arrelMockups);
console.log(`  fitxers amb color vell: ${vells.length}`);
vells.slice(0, 5).forEach((v) => mal(v));

// 4. Les pastilles (hex) als dos llocs.
for (const fitxer of ['src/components/fullwide/CercadorTopBar.jsx', 'src/data/collections.js']) {
  const txt = readFileSync(new URL('../' + fitxer, import.meta.url), 'utf8');
  const blocs = [...txt.matchAll(/slug:\s*'([^']+)'[^}]*hex:\s*'(#[0-9A-Fa-f]{6})'[^}]*overlayHex:\s*'(#[0-9A-Fa-f]{6})'/g)]
    .map((m) => ({ slug: m[1], hex: m[2], overlayHex: m[3] }));
  const slugs = blocs.map((b) => b.slug);
  if (JSON.stringify(slugs) !== JSON.stringify(ESPERATS)) {
    mal(`${fitxer}: slugs ${slugs.length} -> ${slugs.join(', ')}`);
  } else if (blocs.some((b) => !/^#[0-9A-F]{6}$/.test(b.hex) || !/^#[0-9A-F]{6}$/.test(b.overlayHex))) {
    mal(`${fitxer}: algun hex no te 6 digits`);
  } else {
    console.log(`  ${fitxer}: ${blocs.length} pastilles (slug + hex + overlayHex)`);
  }
}

// 5. Els jocs de color fosc no poden tenir cap color vell.
const FOSCOS_ESPERATS = ['royal', 'navy', 'red', 'irish-green', 'military-green', 'black', 'charcoal', 'dark-chocolate'];
const fitxersFoscos = [
  ['src/lib/cartImage.js', /COLORS_FOSCOS = new Set\(\[([^\]]*)\]\)/],
  ['src/lib/drawingPaths.js', /DARK_COLORS = new Set\(\[([^\]]*)\]\)/],
  ['src/lib/pdpMockup.js', /DARK_COLORS = new Set\(\[([^\]]*)\]\)/],
  ['src/components/home/homeDrawings.js', /DARK_COLORS = new Set\(\[([^\]]*)\]\)/],
  ['src/lib/productRoutes.js', /DARK_COLORS = \[([^\]]*)\]/],
  ['src/components/fullwide/CheckoutContent.jsx', /DARK_COLORS = new Set\(\[([^\]]*)\]\)/],
];
for (const [fitxer, re] of fitxersFoscos) {
  const txt = readFileSync(new URL('../' + fitxer, import.meta.url), 'utf8');
  const m = txt.match(re);
  if (!m) { mal(`${fitxer}: no he trobat el joc de foscos`); continue; }
  const llista = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  const vell = llista.filter((c) => VELLS.includes(c));
  const falt = FOSCOS_ESPERATS.filter((c) => !llista.includes(c));
  if (vell.length || falt.length) {
    mal(`${fitxer}: vells=[${vell}] falt=[${falt}]`);
  } else {
    console.log(`  ${fitxer}: ${llista.length} foscos (${llista.join(', ')})`);
  }
}

console.log();
console.log(mals === 0 ? '  TOT BE' : `  ${mals} PROBLEMES`);
process.exit(mals === 0 ? 0 : 1);
