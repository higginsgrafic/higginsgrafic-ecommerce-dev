// TEMPORAL — no es comiteja. D'on surt el -1934,53: ordre real dels items i
// quin queden al mig abans i despres d'enrere.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const nums = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2?.querySelector('[data-carrusel="1"] > div');
  const pista = cont?.firstElementChild;
  const tf = pista ? getComputedStyle(pista).transform : null;
  const tx = tf && tf !== 'none' ? +tf.split(',')[4] : null;
  const boto = (i) => x0(i);
  function x0(i) {
    const bs = v2 ? [...v2.querySelectorAll('[data-carrusel="1"] button')] : [];
    const el = bs[i];
    return el ? (el.getAttribute('aria-label') || '').slice(0, 30) : null;
  }
  const n = v2 ? v2.querySelectorAll('[data-carrusel="1"] button').length : 0;
  const rb = cont?.getBoundingClientRect();
  const mig = rb ? rb.left + rb.width / 2 : 0;
  const peces = v2 ? [...v2.querySelectorAll('[data-carrusel="1"] button')] : [];
  const idxMig = peces.findIndex((x) => { const k = x.getBoundingClientRect(); return k.left <= mig && k.right >= mig; });
  return { tx: tx === null ? null : +tx.toFixed(2), n, migIdx: idxMig, migLab: x0(idxMig), c0: x0(0), c1: x0(1), c16: x0(16), c17: x0(17), c18: x0(18) };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('obert  :', JSON.stringify(await nums()));

const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(3000);
await p.goBack({ waitUntil: 'load' });
await p.waitForTimeout(2000);
console.log('enrere :', JSON.stringify(await nums()));

// Un clic a la mateixa colleccio activa ha de deixar la posicio quieta.
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => /FIRST\s*CONTACT/i.test(x.textContent || '')) || null);
if (card.asElement()) {
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1500);
  console.log('clic fc:', JSON.stringify(await nums()));
}
await b.close();
