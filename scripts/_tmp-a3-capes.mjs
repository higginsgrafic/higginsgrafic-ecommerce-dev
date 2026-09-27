// TEMPORAL — no es comiteja. A3: la maniga esquerra de la franja i la columna de
// colleccions. Captura + xifres de la zona.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const col = v2.querySelector('[data-colleccions-targeta]')?.parentElement;
  const row = v2.querySelector('[data-p2-cercador-row]');
  const z = (el) => {
    // Cadena de z-index/stacking fins a la vista.
    const out = [];
    let x = el;
    while (x && x !== document.body) {
      const cs = getComputedStyle(x);
      out.push({ tag: x.tagName.toLowerCase(), z: cs.zIndex, pos: cs.position, iso: cs.isolation, cls: String(x.className || '').slice(0, 28) });
      x = x.parentElement;
    }
    return out;
  };
  return {
    franja: franja ? franja.getBoundingClientRect().toJSON() : null,
    col: col ? col.getBoundingClientRect().toJSON() : null,
    row: row ? row.getBoundingClientRect().toJSON() : null,
    zCol: col ? z(col).slice(0, 8) : null,
    zFranja: franja ? z(franja).slice(0, 8) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
// Captura de la zona de la maniga + columna.
await p.screenshot({ path: '_tmp-a3-abans3x.png', clip: { x: 1290, y: 230, width: 320, height: 190 } });
console.log('desat _tmp-a3-abans3x.png');
await ctx.close();
await b.close();
