// TEMPORAL — no es comiteja. Estat de partida de la franja: quina colleccio te
// cada casella, quina opacitat, i quin es el desplac,ament de la tira. Es mesura
// abans i despres de canviar el centratge.
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
  const tiles = [...(v2?.querySelectorAll('[data-stripe-tile]') || [])];
  const mig = rb ? rb.left + rb.width / 2 : 0;
  const bs = v2 ? [...v2.querySelectorAll('[data-carrusel="1"] button')] : [];
  const centrat = bs.find((x) => { const k = x.getBoundingClientRect(); return k.left <= mig && k.right >= mig; });
  return {
    tx,
    finestra: rb ? +rb.width.toFixed(2) : null,
    migGraella: centrat ? centrat.getAttribute('aria-label') : null,
    franja: tiles.map((t) => {
      const img = t.querySelector('img');
      return `${t.getAttribute('data-stripe-tile')}:${getComputedStyle(t).opacity}:${(img?.currentSrc || '').split('/').pop().replace('-b-stripe.webp', '').replace('.webp', '').slice(0, 14)}`;
    }),
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
for (const col of ['FIRST CONTACT', 'THE HUMAN INSIDE', 'CUBE', 'MISCEL·LÀNIA']) {
  const card = await p.evaluateHandle((nom) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === nom) || null, col);
  if (!card.asElement()) { console.log(col, 'no trobat'); continue; }
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1200);
  const e = await estat();
  console.log('=== ' + col + ' | tx=' + e.tx + ' | mig graella=' + e.migGraella);
  console.log('   franja:', e.franja.join(' '));
}
await b.close();
