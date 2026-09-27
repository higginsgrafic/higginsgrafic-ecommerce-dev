// TEMPORAL — no es comiteja. La referencia vertical de la pagina 1 (topVisualAlignmentY).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h, escenari] of [[1920, 946, 'desktop'], [1440, 800, 'desktop'], [2560, 1306, 'desktop'], [1512, 900, 'desktop'], [1680, 900, 'desktop'], [1400, 900, 'desktop'], [1366, 768, 'land'], [1280, 720, 'land'], [1024, 768, 'land'], [768, 1024, 'port']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const r = await p.evaluate(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const p1sel = v1.querySelector('button[aria-label="Color"]');
    const p2sel = v2.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
    const row = v2.querySelector('[data-p2-cercador-row]');
    const bar = row?.parentElement;
    const v1r = v1.getBoundingClientRect();
    const v2r = v2.getBoundingClientRect();
    const par = Number.parseFloat((bar?.style?.top || '').replace(/.*\+\s*(-?[\d.]+)px.*/, '$1'));
    return {
      // aplicat
      topAplicat: +par.toFixed(2),
      barTopRelV2: bar ? +(bar.getBoundingClientRect().top - v2r.top).toFixed(2) : null,
      barExtra: getComputedStyle(document.documentElement).getPropertyValue('--hg-cercador-bar-top').trim(),
      v1TopRelV2: +(v1r.top - v2r.top).toFixed(2),
      p1selRelV1: +(p1sel.getBoundingClientRect().top - v1r.top).toFixed(2),
      p1selRelV2: +(p1sel.getBoundingClientRect().top - v2r.top).toFixed(2),
      p2selRelV2: +(p2sel.getBoundingClientRect().top - v2r.top).toFixed(2),
      p2selRelBar: bar ? +(p2sel.getBoundingClientRect().top - bar.getBoundingClientRect().top).toFixed(2) : null,
      rowRelBar: row && bar ? +(row.getBoundingClientRect().top - bar.getBoundingClientRect().top).toFixed(2) : null,
      rowRelV2: row ? +(row.getBoundingClientRect().top - v2r.top).toFixed(2) : null,
      selContRelBar: (() => {
        const c = v2.querySelector('[data-p2-color-selector]');
        return c && bar ? +(c.getBoundingClientRect().top - bar.getBoundingClientRect().top).toFixed(2) : null;
      })(),
    };
  });
  // extra declarat
  const banda = w >= 768 && w <= 1366 && w >= h;
  const esLand = escenari === 'land';
  const extra = esLand ? 5 : (banda ? 45 : 20);
  const offset = banda ? 10 : 0;
  const tV = r.topAplicat - extra;
  console.log(`${String(w + 'x' + h).padEnd(10)} ${escenari.padEnd(7)} tV ${String(tV.toFixed(2)).padStart(8)} (inline ${r.topAplicat}, extra ${extra}) | v1RelV2 ${String(r.v1TopRelV2).padStart(7)} p1selRelV1 ${String(r.p1selRelV1).padStart(7)} p1selRelV2 ${String(r.p1selRelV2).padStart(7)} | p2selRelV2 ${String(r.p2selRelV2).padStart(7)} p2selRelBar ${String(r.p2selRelBar).padStart(7)} rowRelBar ${String(r.rowRelBar).padStart(7)} selCont ${String(r.selContRelBar).padStart(7)} | barTop ${r.barTopRelV2} | diff ${(r.p2selRelV2 - (r.p1selRelV2 + offset)).toFixed(3)}`);
  await ctx.close();
}
await b.close();
