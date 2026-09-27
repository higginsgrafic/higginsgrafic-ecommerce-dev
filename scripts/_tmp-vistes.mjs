// TEMPORAL — no es comita. Les xifres de les quatre vistes, amb la ruta de l'amo.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h, touch] of [[768, 1024, true], [1024, 768, true], [1366, 768, true], [1440, 900, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: touch });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const bx = (e) => { const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.top.toFixed(1), +b.right.toFixed(1), +b.bottom.toFixed(1)]; };
    const cy = (e) => { const b = e.getBoundingClientRect(); return (b.top + b.bottom) / 2; };
    const vis = (sel) => [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0) || null;
    const cg = vis('[data-p2-color-grid]');
    if (!cg) return { error: 'sense graella de colors' };
    const arrel = cg.closest('[data-mega-page-viewport="2"]') || document;
    const sel = arrel.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const carr = arrel.querySelector('[data-carrusel="1"]');
    const retall = carr.firstElementChild;
    const tira = retall.firstElementChild;
    const cs = [...tira.querySelectorAll('button')].map((x) => x.getBoundingClientRect());
    const tops = [...new Set(cs.map((x) => +x.top.toFixed(1)))].sort((a, bb) => a - bb);
    const segona = (() => { if (tops.length < 2) return null; const f = cs.filter((x) => +x.top.toFixed(1) === tops[1]); return { top: Math.min(...f.map((x) => x.top)), bottom: Math.max(...f.map((x) => x.bottom)) }; })();
    const barra = cg.querySelector('button');
    const bb = barra.getBoundingClientRect();
    const fr = arrel.querySelector('[data-stripe-visual-content="2"]');
    const frB = fr ? fr.getBoundingClientRect() : null;
    const fletxa = [...document.querySelectorAll('[data-carrusel="1"] #stripe-guide-right-arrow')].filter((e) => e.getBoundingClientRect().width > 0);
    const fila = document.querySelector('[data-capcalera-fila="1"]');
    return {
      dibuix: +cs[0].width.toFixed(2),
      files: tops.length,
      intercalat: tops.length > 1 ? +(tops[1] - tops[0]).toFixed(2) : null,
      barra: +(bb.width / bb.height).toFixed(3),
      barraMida: [+bb.width.toFixed(1), +bb.height.toFixed(1)],
      barres: cg.children.length,
      colors: bx(cg),
      retall: bx(retall),
      segona: segona ? +((segona.top + segona.bottom) / 2).toFixed(2) : null,
      selector: sel ? +cy(sel).toFixed(2) : null,
      selMarge: (sel && segona) ? +(cy(sel) - (segona.top + segona.bottom) / 2).toFixed(2) : null,
      franja: frB ? [+frB.left.toFixed(1), +frB.width.toFixed(1), +frB.height.toFixed(1)] : null,
      franjaEscala: fr ? getComputedStyle(fr).transform : null,
      carril: fila ? [+fila.getBoundingClientRect().left.toFixed(1), +fila.getBoundingClientRect().right.toFixed(1)] : null,
      fletxesR: fletxa.length ? +fletxa[fletxa.length - 1].getBoundingClientRect().right.toFixed(1) : null,
      vista: arrel.getAttribute ? arrel.getAttribute('data-mega-page-viewport') : null,
    };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
