// TEMPORAL — la columna de colleccions contra el selector B/C/N (top) i la
// franja (bottom), a totes les finestres.
import { chromium } from '@playwright/test';
const VISTES = [
  ['1920x946', 1920, 946], ['1440x800', 1440, 800], ['1366x768', 1366, 768],
  ['1024x768', 1024, 768], ['2560x1306', 2560, 1306], ['768x1024', 768, 1024],
];
const b = await chromium.launch();
for (const [nom, w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const r = await p.evaluate(() => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { top: x.top, bottom: x.bottom, h: x.height }; };
    const sel = v.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const col = v.querySelector('[data-colleccions-targeta]')?.parentElement;
    const franja = v.querySelector('[data-stripe-visual-content="2"]');
    const primer = v.querySelector('[data-colleccions-targeta]');
    const tots = [...v.querySelectorAll('[data-colleccions-targeta]')];
    const ultim = tots[tots.length - 1];
    const S = q(sel); const C = q(col); const F = q(franja); const P = q(primer); const U = q(ultim);
    if (!S || !C || !F) return null;
    return {
      topCol: +C.top.toFixed(2), bottomCol: +C.bottom.toFixed(2), alcada: +C.h.toFixed(2),
      topSel: +S.top.toFixed(2), bottomFranja: +F.bottom.toFixed(2),
      topRespecteSelector: +(C.top - S.top).toFixed(2),
      baixRespecteFranja: +(C.bottom - F.bottom).toFixed(2),
      primeraTargetaRespecteSelector: +(P.top - S.top).toFixed(2),
      ultimaTargetaRespecteFranja: +(U.bottom - F.bottom).toFixed(2),
    };
  });
  console.log(nom.padEnd(10), JSON.stringify(r));
  await ctx.close();
}
await b.close();
