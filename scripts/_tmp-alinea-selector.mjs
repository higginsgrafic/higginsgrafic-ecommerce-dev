// TEMPORAL (28/09/2026): alinea les TRES bandes de la casella de la graella
// (fila 1 de dibuixos, fila 2 de dibuixos, tira de colors) amb els TRES botons
// del selector (BLANC, COLOR, NEGRE), a la vertical de la p2.
// Us: node scripts/_tmp-alinea-selector.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const r = await p.evaluate(() => {
  const Y = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.top * 10) / 10, Math.round(r.height * 10) / 10]; };
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const celaSel = taula?.querySelector('[data-taula-cela="1"]');
  const celaGraella = taula?.querySelector('[data-taula-cela="2-5"]');
  const out = { selector: [], dibuixos: [], colors: [] };
  if (celaSel) {
    celaSel.querySelectorAll('button, [role="button"]').forEach((el) => out.selector.push({ text: (el.textContent || '').trim().slice(0, 12), yh: Y(el) }));
    if (out.selector.length === 0) [...celaSel.querySelectorAll('*')].slice(0, 12).forEach((el) => out.selector.push({ text: (el.textContent || '').trim().slice(0, 12), yh: Y(el) }));
  }
  if (celaGraella) {
    celaGraella.querySelectorAll('img').forEach((el) => out.dibuixos.push({ src: (el.getAttribute('src') || '').split('/').pop().slice(0, 16), yh: Y(el) }));
    const bandes = [...celaGraella.children];
    bandes.forEach((b, i) => { out.colors.push({ bg: `banda ${i}`, yh: Y(b) }); [...b.children].forEach((f, j) => out.colors.push({ bg: `  filla ${i}.${j}`, yh: Y(f) })); });
  }
  return out;
});

// Agrupa els dibuixos per bandes de y (les dues files).
const bandes = {};
r.dibuixos.forEach((d) => { const k = Math.round(d.yh[0] / 10) * 10; bandes[k] = bandes[k] || { n: 0, y: d.yh[0], h: d.yh[1] }; bandes[k].n++; });
console.log('\n===== SELECTOR (botons)');
r.selector.forEach((s) => console.log(`  ${s.text.padEnd(14)} y=${s.yh[0]}  h=${s.yh[1]}`));
console.log('\n===== FILES DE DIBUIXOS (agrupades per y)');
Object.values(bandes).sort((a, b2) => a.y - b2.y).forEach((x) => console.log(`  ${x.n} dibuixos   y=${x.y}  h=${x.h}  (y+h=${Math.round((x.y + x.h) * 10) / 10})`));
console.log('\n===== TIRA DE COLORS');
const ys = [...new Set(r.colors.map((c) => c.yh[0]))].sort((a, b2) => a - b2);
ys.slice(0, 6).forEach((y) => console.log(`  y=${y}  h=${r.colors.find((c) => c.yh[0] === y).yh[1]}  (${r.colors.filter((c) => c.yh[0] === y).length} barres)`));
await b.close();
