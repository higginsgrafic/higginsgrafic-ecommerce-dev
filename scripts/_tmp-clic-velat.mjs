// TEMPORAL — no es comiteja. Clic en una samarreta VELADA de la franja: es mou
// el dibuix que hi ha sota el cursor? (Bloquegem la navegacio per poder mirar.)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await ctx.addInitScript(() => {
  // La PDP navega: la bloquegem per poder mesurar la franja.
  const op = history.pushState.bind(history);
  history.pushState = (...a) => { window.__push = a[2] || window.__push; };
  void op;
  window.__m = [];
  window.__marca = null;
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (v2) {
      const v = v2.getBoundingClientRect().top;
      const cel = [...v2.querySelectorAll('[data-stripe-tile]')].map((el) => ({
        i: Number(el.getAttribute('data-stripe-tile')),
        item: el.getAttribute('data-stripe-item'),
        coll: el.getAttribute('data-stripe-collection'),
        src: (el.getAttribute('data-stripe-src') || '').split('/').pop(),
        l: +el.getBoundingClientRect().left.toFixed(1),
      }));
      window.__m.push({ t: Math.round(performance.now()), cel });
    }
    if (window.__m.length < 3000) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
// Anem a la pagina 2 (el cercador), que es on es veu la franja.
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cel = [...v2.querySelectorAll('[data-stripe-tile]')];
  const velada = cel.find((el) => el.getAttribute('data-stripe-collection') && el.getAttribute('data-stripe-collection') !== 'first_contact');
  if (!velada) return null;
  const r = velada.getBoundingClientRect();
  return { i: velada.getAttribute('data-stripe-tile'), item: velada.getAttribute('data-stripe-item'), coll: velada.getAttribute('data-stripe-collection'), src: (velada.getAttribute('data-stripe-src') || '').split('/').pop(), x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
console.log('cel·la velada:', JSON.stringify(info));
if (!info) { await b.close(); process.exit(0); }
await p.evaluate(() => { window.__m = []; window.__marca = Math.round(performance.now()); });
await p.mouse.click(info.x, info.y);
await p.waitForTimeout(1500);
const r = await p.evaluate((src) => {
  const m = window.__m.filter((x) => x.cel && x.cel.length);
  const abans = m[m.length - 1] && m[0];
  const a0 = m[0].cel.find((c) => c.src === src);
  const a1 = m[m.length - 1].cel.find((c) => c.src === src);
  const index = (x, s) => x.cel.findIndex((c) => c.src === s);
  // tambe: el item que queda a la casa clicada
  const casa = m[0] ? m[0].cel.find((c) => c.i === Number(window.__casa)) : null;
  return {
    push: window.__push || null,
    abans: { cel: a0 && a0.i, l: a0 && a0.l, colls: m[0].cel.map((c) => c.coll.slice(0, 4)).join(',') },
    despres: { cel: a1 && a1.i, l: a1 && a1.l, colls: m[m.length - 1].cel.map((c) => c.coll.slice(0, 4)).join(',') },
    case0: m[0].cel[0] && m[0].cel[0].src,
    case0Fi: m[m.length - 1].cel[0] && m[m.length - 1].cel[0].src,
    index0: index(m[0], src),
    indexFi: index(m[m.length - 1], src),
    casa,
  };
}, info.src);
console.log(JSON.stringify(r, null, 2));
await b.close();
