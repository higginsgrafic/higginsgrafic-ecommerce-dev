// TEMPORAL — no es comiteja. Mostreja DES DEL CLIC: contingut pintable i caixes,
// per veure que arriba tard en obrir.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
const res = await p.evaluate(() => {
  const mostres = [];
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const c = (el) => el ? [...el.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth > 0).length + '/' + el.querySelectorAll('img').length : '-';
    const t = (el) => el ? [...el.querySelectorAll('[data-stripe-tile]')].filter((x) => x.querySelector('img')?.complete).length : 0;
    const pista = v2?.querySelector('[data-carrusel="1"] > div')?.firstElementChild;
    const tf = pista ? getComputedStyle(pista).transform : null;
    return {
      t: Math.round(performance.now()),
      p1: c(v1), p2: c(v2), tilesP2: t(v2),
      tx: tf && tf !== 'none' ? Math.round(+tf.split(',')[4]) : null,
      panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    };
  };
  const id = setInterval(() => mostres.push(foto()), 40);
  return { mostres, teBoto: !!document.querySelector('svg.lucide-search') };
});
console.log('te boto cercador:', res.teBoto);
await p.evaluate(() => { window.__m = []; });
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(1200);
const res2 = await p.evaluate(() => { window.__m2 = window.__m2 || []; return window.__m2; });
let previ = null;
for (const x of res.mostres) {
  const clau = `${x.panell}|${x.tilesP2}|${x.tx}`;
  if (clau !== previ) console.log(`t=${String(x.t).padStart(5)}  panell=${x.panell ? 'si' : 'no '}  p1_llestes=${x.p1.padEnd(7)} p2_llestes=${x.p2.padEnd(8)} tiles_p2_amb_img=${String(x.tilesP2).padStart(2)}  tx=${x.tx}`);
  previ = clau;
}
console.log('mostres:', res.length);
await b.close();
