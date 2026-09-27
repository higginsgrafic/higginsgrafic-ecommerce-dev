// TEMPORAL — no es comiteja. Que es mou en clicar una casa ATENUADA de la
// graella? Es compara el dibuix que hi ha sota el cursor ABANS i DESPRES.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);

const sota = (x, y) => p.evaluate(([px, py]) => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  // El dibuix que hi ha sota el punt: el seu centre mes proper.
  let millor = null;
  for (const x2 of bs) {
    const k = x2.getBoundingClientRect();
    if (k.left <= px && k.right >= px && k.top <= py && k.bottom >= py) {
      millor = x2.getAttribute('aria-label');
      break;
    }
  }
  const pista = cont.firstElementChild;
  const tf = pista ? getComputedStyle(pista).transform : null;
  return { sota: millor, tx: tf && tf !== 'none' ? +(+tf.split(',')[4]).toFixed(1) : null, carruselEsq: Math.round(rb.left) };
}, [x, y]);

// Un dibuix ATENUAT (d'una altra colleccio) dins la finestra.
const q = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const aten = bs.find((x2) => {
    const k = x2.getBoundingClientRect();
    return getComputedStyle(x2).opacity !== '1' && k.left > rb.left && k.right < rb.right && k.top > rb.top && k.bottom < rb.bottom;
  });
  const k = aten.getBoundingClientRect();
  return { x: Math.round(k.left + k.width / 2), y: Math.round(k.top + k.height / 2), lab: aten.getAttribute('aria-label') };
});
console.log('clico la casa atenuada:', JSON.stringify(q));
console.log('abans  :', JSON.stringify(await sota(q.x, q.y)));

await p.route('**/the-human-inside/**', (route) => route.abort());
await p.route('**/first-contact/**', (route) => route.abort());
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(1500);
console.log('despres:', JSON.stringify(await sota(q.x, q.y)));
const r = await p.evaluate(() => ({ url: location.pathname + location.search, panell: !!document.querySelector('[data-mega-panel-surface="1"]') }));
console.log('estat  :', JSON.stringify(r));
await b.close();
