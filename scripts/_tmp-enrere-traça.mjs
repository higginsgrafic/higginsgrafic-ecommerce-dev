// TEMPORAL — no es comiteja. El desplac,ament del carrusel mostrejat cada 100 ms
// des d'abans de marxar fins despres de tornar, amb les peces del mig.
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
  const rb = cont?.getBoundingClientRect();
  const mig = rb ? rb.left + rb.width / 2 : 0;
  const boto = v2 ? [...v2.querySelectorAll('[data-carrusel="1"] button')].find((x) => {
    const k = x.getBoundingClientRect();
    return k.left <= mig && k.right >= mig;
  }) : null;
  return {
    t: Math.round(performance.now()),
    tx: tx === null ? null : +tx.toFixed(2),
    mig: boto ? (boto.getAttribute('aria-label') || '').slice(0, 26) : null,
    marca: window.__marca ?? null,
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);

await p.evaluate(() => {
  window.__m = [];
  window.__id = setInterval(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const cont = v2?.querySelector('[data-carrusel="1"] > div');
    const pista = cont?.firstElementChild;
    const tf = pista ? getComputedStyle(pista).transform : null;
    const tx = tf && tf !== 'none' ? +tf.split(',')[4] : null;
    const rb = cont?.getBoundingClientRect();
    const mig = rb ? rb.left + rb.width / 2 : 0;
    const boto = v2 ? [...v2.querySelectorAll('[data-carrusel="1"] button')].find((x) => {
      const k = x.getBoundingClientRect();
      return k.left <= mig && k.right >= mig;
    }) : null;
    window.__m.push({
      t: Math.round(performance.now()),
      tx: tx === null ? null : +tx.toFixed(2),
      mig: boto ? (boto.getAttribute('aria-label') || '').slice(0, 22) : null,
      marca: window.__marca ?? null,
    });
  }, 100);
});

const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(3000);
await p.evaluate(() => { window.__txt = window.__m.map((x) => `${x.t} tx=${x.tx} mig=${x.mig}`).join('\n'); });
await p.goBack({ waitUntil: 'load' });
await p.waitForTimeout(4000);
const txt = await p.evaluate(() => window.__m.map((x) => `${x.t} tx=${x.tx} mig=${x.mig} marca=${x.marca}`).join('\n'));
const linies = txt.split('\n');
let previ = null;
for (const l of linies) {
  const m = l.match(/tx=([-\d.]+)/);
  if (!previ || m[1] !== previ) { console.log(l); previ = m[1]; }
}
console.log('--- total mostres:', linies.length);
await b.close();
