// TEMPORAL — no es comiteja. B2: la filera nova de la p1 i el bloc de la dreta.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const dx1 = -v1.getBoundingClientRect().left;
  const dx2 = -v2.getBoundingClientRect().left;
  const b2 = (el, et) => { if (!el) return { et }; const q = el.getBoundingClientRect(); return { et, x: +(q.left + (et.startsWith('p1') ? dx1 : dx2)).toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1) }; };
  const filera = v1.querySelector('[data-filera-p1="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1="1"]');
  const graella = v1.querySelector('[data-graella-files-p1="1"]');
  const carr = v1.querySelector('[data-carrusel="1"]');
  const sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const fl = v1.querySelector('[data-fletxes-p1="1"]');
  const scroll = { x: window.scrollX, y: window.scrollY };
  return {
    scroll,
    p1: {
      panel: b2(document.querySelector('[data-mega-panel-surface="1"]'), 'p1 panel'),
      filera: b2(filera, 'p1 filera'),
      graellaWrap: b2(graella, 'p1 graellaWrap'),
      carrusel: b2(carr, 'p1 carrusel'),
      retall: b2(carr?.firstElementChild, 'p1 retall'),
      bloc: b2(bloc, 'p1 bloc'),
      selector: b2(sel, 'p1 selector'),
      fletxes: b2(fl, 'p1 fletxes'),
      franja: b2(v1.querySelector('[data-stripe-visual-content="1"]'), 'p1 franja'),
      fileraTop: filera ? getComputedStyle(filera).marginTop : null,
      blocW: bloc ? getComputedStyle(bloc).width : null,
      carruselH: (() => { const c = v1.querySelector('[data-carrusel="1"]'); return c ? getComputedStyle(c).height : null; })(),
      peces: [...(v1.querySelectorAll('[data-carrusel="1"] [title]') || [])].slice(0, 3).map((x) => { const q = x.getBoundingClientRect(); return { x: +(q.left + dx1).toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1) }; }),
    },
    p2: {
      carrusel: b2(v2.querySelector('[data-carrusel="1"]'), 'p2 carrusel'),
      selector: b2(v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'), 'p2 selector'),
      franja: b2(v2.querySelector('[data-stripe-visual-content="2"]'), 'p2 franja'),
    },
  };
});
console.log(JSON.stringify(r, null, 1));
await p.screenshot({ path: '_tmp-b2-nou.png' });
await ctx.close();
await b.close();
