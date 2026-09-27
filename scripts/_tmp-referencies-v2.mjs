// TEMPORAL — no es comiteja. La referencia de l'alineacio: el selector de la pagina 1.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306], [1680, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const p1 = v1 ? v1.querySelector('button[aria-label="Color"]') : null;
    const p2 = v2 ? v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]') : null;
    const row = v2 ? v2.querySelector('[data-p2-cercador-row]') : null;
    const t = (el) => (el ? +el.getBoundingClientRect().top.toFixed(2) : null);
    const pt = t(panell);
    const rel = (el) => (el ? +(t(el) - pt).toFixed(2) : null);
    return { panell: pt, v1: rel(v1), v2: rel(v2), p1: rel(p1), p2: rel(p2), row: rel(row), p1H: p1 ? +p1.getBoundingClientRect().height.toFixed(2) : null, p2H: p2 ? +p2.getBoundingClientRect().height.toFixed(2) : null };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} panell ${r.panell} | v1 ${r.v1} p1 ${r.p1} (h ${r.p1H}) | v2 ${r.v2} p2 ${r.p2} (h ${r.p2H}) row ${r.row} | p1-p2 ${r.p1 != null && r.p2 != null ? (r.p1 - r.p2).toFixed(2) : '—'}`);
  await ctx.close();
}
await b.close();
