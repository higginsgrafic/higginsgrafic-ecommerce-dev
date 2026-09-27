// TEMPORAL — no es comiteja. Radiografia de la franja (14 cases) i de la
// graella: on cau cada casella, quants dibuixos i de quina colleccio hi ha, i
// quina es la finestra. Serveix per decidir que vol dir «centrar a dalt i a baix».
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const radiografia = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...(v2?.querySelectorAll('[data-stripe-tile]') || [])];
  const caselles = tiles.map((t) => {
    const bb = t.getBoundingClientRect();
    const img = t.querySelector('img');
    return {
      i: +t.getAttribute('data-stripe-tile'),
      x: Math.round(bb.left),
      y: Math.round(bb.top),
      w: +bb.width.toFixed(1),
      h: +bb.height.toFixed(1),
      op: getComputedStyle(t).opacity,
      src: img ? (img.currentSrc || img.src || '').split('/').pop().slice(0, 26) : null,
    };
  });
  const dibuix = v2?.querySelector('[data-stripe-drawing-layer]');
  const db = dibuix?.getBoundingClientRect();
  const cont = v2?.querySelector('[data-carrusel="1"] > div');
  const cb = cont?.getBoundingClientRect();
  const pista = cont?.firstElementChild;
  const tf = pista ? getComputedStyle(pista).transform : null;
  return {
    dibuix: db ? { x: Math.round(db.left), y: Math.round(db.top), w: +db.width.toFixed(1), h: +db.height.toFixed(1) } : null,
    carrusel: cb ? { x: Math.round(cb.left), y: Math.round(cb.top), w: +cb.width.toFixed(1), h: +cb.height.toFixed(1) } : null,
    tx: tf && tf !== 'none' ? +(+tf.split(',')[4]).toFixed(2) : null,
    caselles,
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await radiografia();
console.log('dibuix  :', JSON.stringify(r.dibuix));
console.log('carrusel:', JSON.stringify(r.carrusel), 'tx=', r.tx);
console.log('caselles (' + r.caselles.length + '):');
for (const c of r.caselles) console.log('  ', JSON.stringify(c));
await b.close();
