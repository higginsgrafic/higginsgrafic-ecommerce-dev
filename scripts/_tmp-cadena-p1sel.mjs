// TEMPORAL — no es comiteja. Cadena del selector de la PAGINA 1 amb els translateY.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1366, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const panel = document.querySelector('[data-mega-panel-surface="1"]');
    const sel = v1.querySelector('button[aria-label="Color"]');
    const v1r = v1.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const rows = [];
    let el = sel;
    let n = 0;
    while (el && n < 10) {
      const c = getComputedStyle(el);
      const m = new DOMMatrixReadOnly(c.transform);
      const rr = el.getBoundingClientRect();
      rows.push(`  relV1 ${(rr.top - v1r.top).toFixed(2).padStart(8)} relPanel ${(rr.top - pr.top).toFixed(2).padStart(8)} h ${rr.height.toFixed(2).padStart(7)} mt ${c.marginTop.padStart(6)} ty ${m.f.toFixed(2).padStart(8)} scale ${m.a.toFixed(4)} | ${(el.className || '').toString().slice(0, 40)} | ${c.position}`);
      el = el.parentElement;
      n += 1;
    }
    return { rows: rows.join('\n'), v1relPanel: +(v1r.top - pr.top).toFixed(2), selText: (sel.textContent || '').slice(0, 20) };
  });
  console.log(`\n=== ${w}x${h} v1RelPanel ${r.v1relPanel} text "${r.selText}"\n${r.rows}`);
  await ctx.close();
}
await b.close();
