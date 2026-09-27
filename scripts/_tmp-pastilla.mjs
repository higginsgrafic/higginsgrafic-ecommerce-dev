// TEMPORAL — no es comiteja. La pastilla del selector (p1 i p2): offset amb el
// contenidor i radi.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
console.log(JSON.stringify(await p.evaluate(() => {
  const info = (contenidor, et) => {
    if (!contenidor) return { et, hi: false };
    const cs = getComputedStyle(contenidor);
    const q = contenidor.getBoundingClientRect();
    const slider = [...contenidor.children].find((c) => c.tagName === 'SPAN');
    const sc = slider ? getComputedStyle(slider) : null;
    const sq = slider ? slider.getBoundingClientRect() : null;
    return {
      et,
      contenidor: { x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1), radius: cs.borderRadius, bg: cs.backgroundColor, border: cs.borderTopWidth + ' ' + cs.borderTopColor },
      slider: sq ? { x: +sq.left.toFixed(1), y: +sq.top.toFixed(1), w: +sq.width.toFixed(1), h: +sq.height.toFixed(1), radius: sc.borderRadius, bg: sc.backgroundColor, border: sc.borderTopWidth + ' ' + sc.borderTopColor, shadow: sc.boxShadow } : null,
      offset: sq ? { esq: +(sq.left - q.left).toFixed(1), dalt: +(sq.top - q.top).toFixed(1), dreta: +(q.right - sq.right).toFixed(1), baix: +(q.bottom - sq.bottom).toFixed(1) } : null,
    };
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const p1sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const p2sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  return { p1: info(p1sel, 'selector p1'), p2: info(p2sel, 'selector p2') };
}), null, 1));
await ctx.close();
await b.close();
