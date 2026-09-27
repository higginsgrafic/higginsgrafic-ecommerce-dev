// TEMPORAL — la p1: les peces i les alineacions, amb xifres.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(700);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { x: +x.left.toFixed(1), y: +x.top.toFixed(1), w: +x.width.toFixed(1), h: +x.height.toFixed(1), dreta: +(x.left + x.width).toFixed(1), baix: +(x.top + x.height).toFixed(1) }; };
  const franja = q(v.querySelector('[data-stripe-visual-content="1"]'));
  const bloc = q(v.querySelector('[data-bloc-dreta-p1="1"]'));
  const graella = q(v.querySelector('[data-carrusel="1"]'));
  const sel = q(v.querySelector('[data-stripe-buttonbar="bn-p1"]'));
  const fletxes = q(v.querySelector('[data-fletxes-p1="1"]'));
  return {
    graella, bloc, sel, fletxes, franja,
    // alineacions
    blocVsFranja: { top: bloc.y - franja.y, baix: bloc.baix - franja.baix, esq: bloc.x - franja.dreta },
    graellaVsBloc: { top: graella.y - bloc.y, baix: graella.baix - bloc.baix },
    blocVsCarril: { dreta: 1524 - bloc.dreta, esq: bloc.x - 381 },
  };
});
console.log(JSON.stringify(r, null, 1));
await p.screenshot({ path: '_tmp-p1-estat.png', clip: { x: 340, y: 60, width: 1240, height: 320 } });
console.log('desat _tmp-p1-estat.png');
await ctx.close(); await b.close();
