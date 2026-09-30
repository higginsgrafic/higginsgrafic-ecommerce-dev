// TEMPORAL (28/09/2026): comprova que el filtre dels 5 % mes clar cau NOME'S als
// dibuixos de LOOKING FOR MY DARCY, i que els altres (incloent-hi CUBE, que
// tambe va sense variant negra) es queden com estaven.
// Us: node scripts/_tmp-filtres.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 4 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const files = () => p.evaluate(() => {
  const c = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  return [...c.querySelectorAll('[data-stripe-tile]')].map((t) => {
    const im = t.querySelector('img');
    const src = im ? (im.getAttribute('src') || '') : '';
    return {
      sub: t.getAttribute('data-stripe-subcollection') || t.getAttribute('data-stripe-collection'),
      lfmd: src.toLowerCase().includes('/looking_for_my_darcy/'),
      negre: /-b-stripe\.webp$/i.test(src),
      filtre: im ? getComputedStyle(im).filter : null,
      barreja: im ? getComputedStyle(im).mixBlendMode : null,
      frame: /\/frame\/|-frame-/i.test(src),
    };
  });
});
const arrossega = async (dx) => {
  const r = await p.evaluate(() => {
    const el = document.querySelector('#stripe-guide-stripe-row');
    const bb = el.getBoundingClientRect();
    return { x: bb.left + bb.width / 2, y: bb.top + bb.height / 2 };
  });
  await p.mouse.move(r.x, r.y);
  await p.mouse.down();
  for (let i = 1; i <= 6; i += 1) { await p.mouse.move(r.x + (dx * i) / 6, r.y); await p.waitForTimeout(25); }
  await p.mouse.up();
  await p.waitForTimeout(400);
};

const vist = new Map();
let capturat = false;
for (let pas = 0; pas < 20; pas += 1) {
  const fs = await files();
  for (const f of fs) {
    const mena = f.frame ? 'LFMD frame' : (f.lfmd ? 'LFMD solid' : (f.negre ? 'variant negra' : 'color (CUBE i semblants)'));
    const clau = `${mena}|${f.filtre}|${f.barreja}`;
    vist.set(clau, (vist.get(clau) || 0) + 1);
  }
  const idxFrame = fs.findIndex((f) => f.frame);
  if (!capturat && idxFrame >= 0) {
    const el = (await p.$$('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"] [data-stripe-tile]'))[idxFrame];
    await el.screenshot({ path: '_tmp-frame-sense-fons.png' });
    console.log('(capturada la casa ' + idxFrame + ', que es una frame)');
    capturat = true;
  }
  await arrossega(-90);
}
console.log('combinacions vistes (mena de dibuix | filtre | vegades):');
for (const [k, n] of [...vist.entries()].sort()) console.log(`  ${k}  x${n}`);
await b.close();
