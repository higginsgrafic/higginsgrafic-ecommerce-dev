// TEMPORAL — no es comiteja. Que canvia de CONTINGUT durant l'obertura, peça a
// peça: el dibuix de cada casella de la franja i les primeres de la graella.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.evaluate(() => {
  window.__m = [];
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (!v2) return null;
    const fr = [...v2.querySelectorAll('[data-stripe-tile] img')];
    const franja = fr.map((i) => (i.complete && i.naturalWidth > 0 ? '1' : '0')).join('') + ' n=' + fr.length;
    const gl = [...v2.querySelectorAll('[data-carrusel="1"] button img')];
    const graella = gl.map((i) => (i.complete && i.naturalWidth > 0 ? '1' : '0')).join('') + ' n=' + gl.length;
    const t = [...v2.querySelectorAll('[data-stripe-tile]')].map((x) => { const b2 = x.getBoundingClientRect(); return Math.round(b2.left); }).join(',');
    return { t: Math.round(performance.now()), franja, graella, t, negro: v2.querySelectorAll('[data-carrusel="1"] button').length };
  };
  const id = setInterval(() => { const f = foto(); if (f) window.__m.push(f); }, 40);
  setTimeout(() => clearInterval(id), 4000);
});
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4400);
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  const clau = `${x.franja}|${x.graella}`;
  if (clau !== previ) {
    console.log(`t=${String(x.t).padStart(5)}  graella_botons=${x.negro}`);
    console.log(`   franja : ${x.franja.slice(0, 60)}`);
    console.log(`   graella: ${x.graella.slice(0, 60)}`);
  }
  previ = clau;
}
console.log('mostres:', m.length);
await b.close();
