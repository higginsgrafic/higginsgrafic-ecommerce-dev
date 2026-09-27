// TEMPORAL — no es comiteja. B2: el pageRoot del panell de la p1.
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
  const dx = -v1.getBoundingClientRect().left;
  const b2 = (el, et) => { if (!el) return { et }; const q = el.getBoundingClientRect(); return { et, x: +(q.left + dx).toFixed(1), y: +q.top.toFixed(1), w: +(q.width).toFixed(1), h: +(q.height).toFixed(1), tr: getComputedStyle(el).transform, st: (el.getAttribute('style') || '').slice(0, 90) }; };
  const malla = v1.querySelector('.grid.grid-cols-9');
  const root = malla?.closest('div[style*="translateY"]') || malla?.parentElement?.parentElement?.parentElement;
  return {
    cadena: [malla, malla?.parentElement, malla?.parentElement?.parentElement, malla?.parentElement?.parentElement?.parentElement, malla?.parentElement?.parentElement?.parentElement?.parentElement].map((e, i) => b2(e, `nivell ${i}`)),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
