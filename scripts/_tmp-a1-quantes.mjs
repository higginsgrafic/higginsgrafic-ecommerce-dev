// TEMPORAL — no es comiteja. A1: quantes linies te la columna de colleccions a
// l'escriptori i quines pastilles porten fons, amb el nom del contenidor.
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
  const taules = [...v2.querySelectorAll('[data-colleccions-targeta]')].map((x) => {
    const q = x.getBoundingClientRect();
    const cs = getComputedStyle(x);
    return { t: (x.textContent || '').trim(), x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1), bg: cs.backgroundColor };
  });
  const contenidor = v2.querySelector('[data-colleccions-targeta]')?.parentElement;
  const cb = contenidor?.getBoundingClientRect();
  const pare = contenidor?.parentElement?.getBoundingClientRect();
  return {
    contenidor: contenidor ? { cls: contenidor.className, pos: getComputedStyle(contenidor).position, x: +cb.left.toFixed(1), y: +cb.top.toFixed(1), w: +cb.width.toFixed(1), h: +cb.height.toFixed(1) } : null,
    capa: pare ? { x: +pare.left.toFixed(1), y: +pare.top.toFixed(1), w: +pare.width.toFixed(1), h: +pare.height.toFixed(1) } : null,
    taules,
    linia: document.querySelectorAll('[data-colleccions-linia="1"]').length,
    caixes: document.querySelectorAll('[data-colleccions-caixes="1"]').length,
  };
});
console.log('contenidor:', JSON.stringify(r.contenidor));
console.log('capa:', JSON.stringify(r.capa));
console.log('linia:', r.linia, 'caixes:', r.caixes);
console.table(r.taules);
await p.screenshot({ path: '_tmp-a1-abans.png', clip: { x: 1360, y: 60, width: 200, height: 520 } });
console.log('desat _tmp-a1-abans.png');
await ctx.close();
await b.close();
