// TEMPORAL — no es comiteja. Comprova que `findPdpSlug` encerta els 64 dibuixos
// de la graella, i que la PDP de cada slug es de debò.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(1200);

const r = await p.evaluate(async () => {
  const { dibuixosGraella16x4 } = await import('/src/components/fullwide/CercadorTextRow.jsx');
  const { findPdpSlug } = await import('/src/config/pdpRoutes.js');
  const files = dibuixosGraella16x4().map((g) => ({
    collection: g.collection,
    label: g.label,
    stripeItem: g.stripeItem,
    slugLabel: findPdpSlug(g.collection, g.label),
    slugStripe: g.stripeItem ? findPdpSlug(g.collection, g.stripeItem) : null,
  }));
  const vuits = [];
  for (let i = 0; i < 64; i++) vuits.push(findPdpSlug('cube', `no-existeix-${i}`));
  return {
    files,
    nuls: vuits.filter(Boolean).length,
    // El selector de la franja passa el nom amb accents i cometes: proves.
    proves: [
      findPdpSlug('the_human_inside', "Cylon '03"),
      findPdpSlug('the_human_inside', 'Cylon 03'),
      findPdpSlug('cube', 'RoboCube'),
      findPdpSlug('austen', '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/fuchsia-solid-grid.webp'),
      findPdpSlug('miscellania', 'Death staR2D2'),
    ],
  };
});

let sense = 0;
for (const f of r.files) {
  const ok = f.slugLabel && (!f.stripeItem || f.slugStripe);
  if (!ok) { sense++; console.log('  SENSE:', f.collection, '|', f.label, '|', f.stripeItem, '->', f.slugLabel, '/', f.slugStripe); }
}
console.log('dibuixos:', r.files.length, '· sense slug:', sense);
console.log('claus inexistents que han tornat algo (ha de ser 0):', r.nuls);
console.log('proves:', JSON.stringify(r.proves));
console.log('errors de pagina:', errors.length, errors.slice(0, 3));

const slugs = [...new Set(r.files.map((f) => f.slugLabel).filter(Boolean))];
console.log('slugs distints:', slugs.length);
await b.close();
