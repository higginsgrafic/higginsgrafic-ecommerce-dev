// TEMPORAL — no es comiteja. B1: quina pagina es veu i on cau cada peca.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.screenshot({ path: '_tmp-b1-tancat.png' });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
await p.screenshot({ path: '_tmp-b1-obert.png' });
const r = await p.evaluate(() => {
  const el = document.querySelector('input[type="checkbox"][id]');
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const par = v1?.parentElement;
  return {
    scrollX: window.scrollX,
    contenidorScroll: (() => {
      let x = v1; const out = [];
      while (x && x !== document.body) { if (x.scrollLeft) out.push({ cls: String(x.className).slice(0, 30), sl: x.scrollLeft, sw: x.scrollWidth, cw: x.clientWidth }); x = x.parentElement; }
      return out;
    })(),
    v1: v1?.getBoundingClientRect().toJSON(),
    v2: v2?.getBoundingClientRect().toJSON(),
    pare: par?.getBoundingClientRect().toJSON(),
    pareCls: String(par?.className || '').slice(0, 60),
    visibles: [...document.querySelectorAll('[data-mega-page-viewport]')].map((x) => {
      const q = x.getBoundingClientRect();
      return { vp: x.getAttribute('data-mega-page-viewport'), x: +q.left.toFixed(1), w: +q.width.toFixed(1), visible: q.right > 0 && q.left < window.innerWidth };
    }),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
