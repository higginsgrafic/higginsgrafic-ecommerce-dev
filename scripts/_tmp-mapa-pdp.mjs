// TEMPORAL — no es comiteja. Genera `src/config/pdpRoutes.js`: el mapa
// colleccio + dibuix -> URL de la PDP DE DEBO (`/<colleccio>/<ruta>`).
//
// Font: el joc de dibuixos de la graella 16x4 (`dibuixosGraella16x4`) creuat
// amb el registre de la PDP (`src/data/pdpRegistry.js`), que es qui te les rutes
// que el router munta i `PdpPage` sap llegir.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const norm = (s) => String(s)
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[·’'`´&]/g, '-')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');
// El registre te variants tipografiques: "Vulcans End" -> vulcans-end.
const plega = (s) => s.replace(/-s-/g, 's-').replace(/-s$/, 's');

const COLL = {
  first_contact: 'first-contact',
  the_human_inside: 'the-human-inside',
  austen: 'austen',
  cube: 'cube',
  miscellania: 'miscellania',
};

// Els noms de dibuix que el registre anomena diferent. Cada entrada es un
// judici; cap no es pot deduir del nom sol.
const ALIES = {
  the_human_inside: {
    'r2-d2': 'r2-d2',
    // Al registre el guio de «Iron Man» no hi es: ironman-08 / ironman-68.
    'iron-man-08': 'ironman-08',
    'iron-man-68': 'ironman-68',
  },
  austen: {
    'allow-me-to-tell-you': 'quotes-you-have-bewitched-me',
    'you-must-allow-me': 'quotes-you-have-bewitched-me',
    'body-and-soul': 'quotes-i-admire-and-love-you',
    // Les cites porten el prefix «quotes-» al registre.
    'half-agony-half-hope': 'quotes-half-agony-half-hope',
    'it-is-a-truth': 'quotes-it-is-a-truth',
    'unsociable-and-taciturn': 'quotes-unsociable-and-taciturn',
    'i-prefer-to-be': 'quotes-unsociable-and-taciturn',
    // Al registre hi ha Pride And Prejudice 1..4, tots quatre.
    'looking-for-my-darcy-fuchsia-solid': 'looking-for-my-darcy-pink-solid',
    'fuchsia-solid': 'looking-for-my-darcy-pink-solid',
    'looking-for-my-darcy-yellow-blue-frame': 'looking-for-my-darcy-yellow-blue-frame',
    'blue-frame': 'looking-for-my-darcy-yellow-blue-frame',
    'looking-for-my-darcy-yellow-fuchsia-frame': 'looking-for-my-darcy-yellow-pink-frame',
    'fuchsia-frame': 'looking-for-my-darcy-yellow-pink-frame',
    // El marc groc sense color de fons: no hi es; el registre nome's te el
    // «pink-yellow-frame» i la resta de colors.
    'looking-for-my-darcy-yellow-frame': 'austen-looking-for-my-darcy-pink-yellow-frame',
    'yellow-frame': 'austen-looking-for-my-darcy-pink-yellow-frame',
  },
  cube: {
    // Al registre l'angles «Iron Cube '08» es diu ironkong (aixo es el que la
    // propia graella hi enllaça) i el '68, ironman-68.
    'iron-cube-08': 'cube-ironkong',
    'iron-kong': 'cube-ironkong',
    'iron-cube-68': 'cube-ironman-68',
    'iron-cube-68-stripe': 'cube-ironman-68',
    'cyber-cube': 'cube-cybercube',
  },
};

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(1200);

const out = await p.evaluate(async () => {
  const { dibuixosGraella16x4 } = await import('/src/components/fullwide/CercadorTextRow.jsx');
  const { PDP_REGISTRY } = await import('/src/data/pdpRegistry.js');
  return { graella: dibuixosGraella16x4(), registre: PDP_REGISTRY };
});

const files = [];
const problemes = [];
for (const g of out.graella) {
  const coll = COLL[g.collection];
  const candidats = out.registre.filter((x) => x.collectionSlug === coll);
  const clau = plega(norm(g.label));
  const clauStripe = g.stripeItem
    ? plega(norm(String(g.stripeItem).split('/').pop().replace(/-b-grid|-grid|\.webp$/g, '')))
    : null;
  let trobat = candidats.find((x) => plega(norm(x.route)) === clau)
    || (clauStripe ? candidats.find((x) => plega(norm(x.route)) === clauStripe) : null);
  if (!trobat) {
    // Segona passada: tota la ruta del dibuix hi es dins.
    if (clauStripe) trobat = candidats.find((x) => clauStripe.includes(plega(norm(x.route))));
  }
  if (!trobat) {
    const al = ALIES[g.collection] || {};
    const desti = al[clau] || al[clauStripe];
    if (desti) {
      trobat = out.registre.find((x) => x.slug === desti)
        || out.registre.find((x) => x.collectionSlug === coll && x.route === desti)
        || null;
    }
  }
  if (!trobat) { problemes.push({ ...g, clau, clauStripe, candidats: candidats.map((x) => x.route) }); continue; }
  files.push({ collection: g.collection, label: g.label, stripeItem: g.stripeItem, url: `/${trobat.collectionSlug}/${trobat.route}`, slug: trobat.slug, nom: trobat.name });
}

console.log('files:', files.length, 'de', out.graella.length, '· problemes:', problemes.length);
for (const x of problemes) {
  console.log(`  SENSE: [${x.collection}] "${x.label}" clau=${x.clau} stripe=${x.clauStripe}`);
  console.log(`         registre: ${x.candidats.join(', ')}`);
}

// Claus del mapa: el nom del dibuix (label i stripeItem) normalitzat, amb la
// forma EXACTA i tambe la normalitzada, com al fitxer actual.
const mapa = {};
const xocs = [];
for (const f of files) {
  for (const k of [f.label, f.stripeItem]) {
    if (!k) continue;
    const clau = `${f.collection}|${String(k).split('/').pop().replace(/-b-grid|-grid|\.webp$/g, '')}`;
    if (mapa[clau] && mapa[clau] !== f.url) { xocs.push([clau, mapa[clau], f.url]); continue; }
    mapa[clau] = f.url;
  }
}
console.log('claus al mapa:', Object.keys(mapa).length, '· xocs:', xocs.length);
for (const x of xocs) console.log('  XOC:', x.join('  '));

writeFileSync('scripts/_tmp-pdp-registre.json', JSON.stringify({ mapa, files, problemes }, null, 1));

// El cos del fitxer, agrupat per colleccio
const perColl = {};
for (const f of files) (perColl[f.collection] ||= []).push(f);
let cos = '';
for (const [coll, fs] of Object.entries(perColl)) {
  cos += `\n  // ${coll.toUpperCase()}\n`;
  for (const f of fs) {
    cos += `  ${JSON.stringify(`${f.collection}|${f.label}`)}: ${JSON.stringify(f.url)},\n`;
    if (f.stripeItem && f.stripeItem !== f.label) {
      const net = String(f.stripeItem).split('/').pop().replace(/-b-grid|-grid|\.webp$/g, '');
      cos += `  ${JSON.stringify(`${f.collection}|${net}`)}: ${JSON.stringify(f.url)},\n`;
    }
  }
}
writeFileSync('scripts/_tmp-pdp-cos.txt', cos);
await b.close();
