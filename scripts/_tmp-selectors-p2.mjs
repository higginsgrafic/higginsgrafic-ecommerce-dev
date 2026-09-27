// TEMPORAL — els dos selectors de la p2: la caixa de cadascun i les seves peces.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [+x.left.toFixed(1), +x.top.toFixed(1), +x.width.toFixed(1), +x.height.toFixed(1)]; };
  const colors = v.querySelector('[data-p2-color-selector]');
  const bn = v.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const col = v.querySelector('[data-colleccions-targeta]')?.parentElement;
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  const files = col ? [...col.querySelectorAll('[data-colleccions-targeta]')] : [];
  return {
    colorSelector: q(colors),
    bn: q(bn),
    columna: q(col),
    franja: q(franja),
    files: files.map((f) => ({ nom: (f.textContent || '').trim().slice(0, 14), capsa: q(f) })),
  };
});
console.log(JSON.stringify(r, null, 1));
await p.screenshot({ path: '_tmp-p2-selectors.png', clip: { x: 340, y: 80, width: 1220, height: 300 } });
console.log('desat _tmp-p2-selectors.png');
await ctx.close(); await b.close();
