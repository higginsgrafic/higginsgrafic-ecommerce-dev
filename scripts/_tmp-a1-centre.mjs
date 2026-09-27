// TEMPORAL — no es comiteja. A1: on cau el text del nom actiu dins la pastilla.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const ts = [...v2.querySelectorAll('[data-colleccions-targeta]')];
  const pare = ts[0]?.parentElement;
  const cs = ts[0] ? getComputedStyle(ts[0]) : null;
  const cb = pare?.getBoundingClientRect();
  return {
    pare: cb ? { y: +cb.top.toFixed(1), h: +cb.height.toFixed(1) } : null,
    primer: (() => { const q = ts[0].getBoundingClientRect(); return { y: +q.top.toFixed(1), h: +q.height.toFixed(1), align: cs.alignItems, just: cs.justifyContent, disp: cs.display, flex: cs.flex }; })(),
    darrer: (() => { const q = ts[ts.length - 1].getBoundingClientRect(); return { y: +q.top.toFixed(1), h: +q.height.toFixed(1) }; })(),
    fills: [...(pare?.children || [])].map((x) => {
      const q = x.getBoundingClientRect();
      const c2 = getComputedStyle(x);
      return { t: (x.textContent || '').trim().slice(0, 12), y: +q.top.toFixed(1), h: +q.height.toFixed(1), align: c2.alignItems, fw: c2.fontWeight };
    }),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
