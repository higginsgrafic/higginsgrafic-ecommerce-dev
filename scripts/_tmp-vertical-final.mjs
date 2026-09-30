// TEMPORAL: la franja de les dues taules verticals, contra les xifres del 23/09.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(10000);
const d = await p.evaluate(() => {
  const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; };
  const franjaDe = (pag) => {
    const cela = document.querySelector(`[data-taula-vertical="${pag}"] [data-taula-cela="${pag === 1 ? '7-9+12-14' : '8-10+13-15'}"]`);
    // El tros mes gran de dins la casella: es la franja, sigui img o el que sigui.
    let gran = null; let area = 0;
    for (const el of (cela ? cela.querySelectorAll('*') : [])) {
      const r = el.getBoundingClientRect();
      if (r.width * r.height > area) { area = r.width * r.height; gran = el; }
    }
    const src = gran ? (gran.getAttribute('src') || gran.getAttribute('href') || (getComputedStyle(gran).backgroundImage || '')).split('/').pop().slice(0, 30) : '';
    const cs = gran ? getComputedStyle(gran) : null;
    return { cela: R(cela), franja: R(gran), css: cs ? cs.height : null, src };
  };
  return {
    gridFit: getComputedStyle(document.documentElement).getPropertyValue('--hgGridFitScale'),
    p1: franjaDe(1), p2: franjaDe(2),
  };
});
console.log('  --hgGridFitScale:', d.gridFit);
for (const q of ['p1', 'p2']) {
  const v = d[q];
  console.log(`  ${q}  casella ${JSON.stringify(v.cela)}`);
  const f = v.franja; const c = v.cela;
  console.log(`      ${v.src}  ${JSON.stringify(f)}  (css height ${v.css})  -> respecte la casella: x${f.x - c.x} y${f.y - c.y}`);
}
console.log('\n  REFERENCIA 23/09 (mesurada abans):');
console.log('    p1  casella -610,296 453x236 · franja -610,316 452x214  -> respecte la casella: x0 y20');
console.log('    p2  casella  285,296 443x236 · franja  296,322 443x210  -> respecte la casella: x11 y26');
writeFileSync('_tmp-vertical-ara.png', await p.screenshot());
console.log('\n  errors:', errors.length ? errors.join(' | ') : 'cap');
await ctx.close(); await b.close();
