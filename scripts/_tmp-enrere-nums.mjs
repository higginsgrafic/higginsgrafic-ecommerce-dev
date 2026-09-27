// TEMPORAL — no es comiteja. Mesura el desplac,ament del carrusel ABANS i
// DESPRES del boto d'enrere, amb el periode i la finestra, per saber d'on surt
// el 2.360 px.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 200)));

const nums = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2?.querySelector('[data-carrusel="1"] > div');
  const pista = cont?.firstElementChild;
  const tf = pista ? getComputedStyle(pista).transform : null;
  let tx = null;
  if (tf && tf !== 'none') tx = +tf.split(',')[4];
  const rb = cont?.getBoundingClientRect();
  const peces = [...(v2?.querySelectorAll('[data-carrusel="1"] button') || [])];
  const vis = peces.filter((x) => {
    const k = x.getBoundingClientRect();
    return rb && k.right > rb.left && k.left < rb.right;
  });
  return {
    url: location.pathname + location.search,
    panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    finestra: rb ? +rb.width.toFixed(2) : null,
    scrollLeft: cont ? cont.scrollLeft : null,
    translateX: tx,
    ampladaPista: pista ? +pista.getBoundingClientRect().width.toFixed(2) : null,
    peces: peces.length,
    visibles: vis.length,
    franja: [...(v2?.querySelectorAll('[data-stripe-tile]') || [])].slice(0, 3).map((t) => (t.querySelector('img')?.currentSrc || '').split('/').pop()),
    meta: (() => { const d = document.querySelector('[data-mega-page-viewport="2"] [data-colleccions-targeta]'); return d ? document.querySelectorAll('[data-colleccions-targeta]').length : null; })(),
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('1 obert    :', JSON.stringify(await nums()));

const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), dibuix: (t.querySelector('img').currentSrc || '').split('/').pop() };
});
console.log('2 cliquem  :', q.dibuix);
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(3000);
console.log('3 a la PDP :', p.url());
console.log('   abans de marxar:', JSON.stringify(await p.evaluate(() => ({ marca: window.__marca ?? null, scroll: window.scrollY }))));

await p.evaluate(() => { window.__marca = 'hi-soc'; });
await p.goBack({ waitUntil: 'load' });
let t0 = 0;
for (const pas of [200, 400, 600, 1300, 2000]) {
  await p.waitForTimeout(pas);
  t0 += pas;
  console.log(`4 enrere +${t0} :`, JSON.stringify(await nums()));
}
console.log('errors:', errs.length, errs.slice(0, 3));
await b.close();
