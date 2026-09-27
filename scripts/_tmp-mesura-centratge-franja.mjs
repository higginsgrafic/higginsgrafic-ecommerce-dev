// TEMPORAL — no es comiteja. El centratge de la franja i el vel de les
// samarretes inactives, mesurats: centre del grup actiu i casa del mig.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2?.querySelector('[data-carrusel="1"] > div');
  const pista = cont?.firstElementChild;
  const tf = pista ? getComputedStyle(pista).transform : null;
  const tx = tf && tf !== 'none' ? +(+tf.split(',')[4]).toFixed(2) : null;
  const rb = cont?.getBoundingClientRect();
  const mig = rb ? rb.left + rb.width / 2 : 0;
  const bs = v2 ? [...v2.querySelectorAll('[data-carrusel="1"] button')] : [];
  const centrat = bs.find((x) => { const k = x.getBoundingClientRect(); return k.left <= mig && k.right >= mig; });
  const tiles = [...(v2?.querySelectorAll('[data-stripe-tile]') || [])];
  // Centre de la franja: la primera i l'ultima casella.
  const t0 = tiles[0]?.getBoundingClientRect();
  const t13 = tiles[13]?.getBoundingClientRect();
  const centreFranja = (t0 && t13) ? (t0.left + t13.right) / 2 : null;
  // Casa activa mes propera al centre de la franja.
  let casaActiva = null;
  if (centreFranja !== null) {
    tiles.forEach((t) => {
      const k = t.getBoundingClientRect();
      const op = +getComputedStyle(t).opacity;
      if (op === 1 && k.left <= centreFranja && k.right >= centreFranja) casaActiva = t.getAttribute('data-stripe-tile');
    });
  }
  const veils = [...document.querySelectorAll('img[src^="data:image/svg+xml"]')].map((i) => ({
    w: Math.round(i.getBoundingClientRect().width),
    h: Math.round(i.getBoundingClientRect().height),
    z: getComputedStyle(i).zIndex,
  }));
  return {
    tx,
    migGraella: centrat ? centrat.getAttribute('aria-label') : null,
    casaActivaAlMig: casaActiva,
    cases: tiles.map((t) => `${t.getAttribute('data-stripe-tile')}:${getComputedStyle(t).opacity}`).join(' '),
    veils,
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
console.log('EN OBRIR      :', JSON.stringify(await estat()));

for (const col of ['THE HUMAN INSIDE', 'CUBE', 'MISCEL·LÀNIA', 'FIRST CONTACT']) {
  const card = await p.evaluateHandle((nom) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === nom) || null, col);
  if (!card.asElement()) { console.log(col, 'no trobat'); continue; }
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1300);
  const e = await estat();
  console.log(col.padEnd(16), 'casa activa al mig =', e.casaActivaAlMig, '| mig graella =', e.migGraella, '| tx =', e.tx, '| veils =', JSON.stringify(e.veils));
  console.log('   ', e.cases);
}
await b.close();
