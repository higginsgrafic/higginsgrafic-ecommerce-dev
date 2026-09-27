// TEMPORAL — no es comiteja. Mides de les peces clau de cada pagina durant
// l'obertura: pagina 1 (franja) vs pagina 2 (franja, graella, selector).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.evaluate(() => {
  window.__m = [];
  const mesura = () => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const g = (sel, el) => { const x = el?.querySelector(sel); if (!x) return null; const b2 = x.getBoundingClientRect(); return `${Math.round(b2.width)}x${Math.round(b2.height)}`; };
    const t = (el) => { const x = el?.querySelector('[data-stripe-tile]'); if (!x) return null; const b2 = x.getBoundingClientRect(); return `${Math.round(b2.width)}x${Math.round(b2.height)}`; };
    return {
      t: Math.round(performance.now()),
      p1_franja: t(v1),
      p2_franja: t(v2),
      p2_graella: g('[data-carrusel="1"] button', v2),
      p2_selector: g('[data-stripe-buttonbar="bn"]', v2),
    };
  };
  const id = setInterval(() => window.__m.push(mesura()), 60);
  setTimeout(() => clearInterval(id), 4200);
});
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4600);
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  const clau = `${x.p1_franja}|${x.p2_franja}|${x.p2_graella}|${x.p2_selector}`;
  if (clau !== previ) console.log(`t=${String(x.t).padStart(5)}  p1_franja=${String(x.p1_franja).padEnd(9)} p2_franja=${String(x.p2_franja).padEnd(9)} p2_graella=${String(x.p2_graella).padEnd(8)} p2_selector=${x.p2_selector}`);
  previ = clau;
}
await b.close();
