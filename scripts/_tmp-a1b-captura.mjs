// TEMPORAL — no es comiteja. A1rev: la columna de colleccions de la p2, com la
// captura de l'amo.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const q = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const ts = [...v2.querySelectorAll('[data-colleccions-targeta]')];
  const col = ts[0].parentElement;
  const r = col.getBoundingClientRect();
  const act = ts.find((x) => x.getAttribute('aria-current') === 'true') || ts[0];
  const a = act.getBoundingClientRect();
  const cs = getComputedStyle(act);
  return {
    x: Math.floor(r.left) - 6, y: Math.floor(r.top) - 6, w: Math.ceil(r.width) + 12, h: Math.ceil(r.height) + 12,
    col: { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
    act: { x: +a.left.toFixed(1), y: +a.top.toFixed(1), w: +a.width.toFixed(1), h: +a.height.toFixed(1), bg: cs.backgroundColor, border: cs.border, color: cs.color, fs: cs.fontSize, fw: cs.fontWeight },
    noms: ts.map((x) => { const s = x.getBoundingClientRect(); const c = getComputedStyle(x); return { t: (x.textContent || '').trim(), y: +s.top.toFixed(1), h: +s.height.toFixed(1), bg: c.backgroundColor, fw: c.fontWeight }; }),
  };
});
console.log(JSON.stringify(q, null, 1));
await p.screenshot({ path: '_tmp-a1rev3x.png', clip: { x: q.x, y: q.y, width: q.w, height: q.h } });
await ctx.close();
await b.close();
