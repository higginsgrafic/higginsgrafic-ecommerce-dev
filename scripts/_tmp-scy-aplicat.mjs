// TEMPORAL — no es comiteja. El centratge APLICAT del selector (tV + scy) i el top aplicat.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1366, 768], [1280, 720], [1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const cont = v2.querySelector('[data-p2-color-selector]');
    const wrap = cont?.firstElementChild;
    const m = wrap ? new DOMMatrixReadOnly(getComputedStyle(wrap).transform) : null;
    const row = v2.querySelector('[data-p2-cercador-row]');
    const bar = row?.parentElement;
    const num = (s) => Number.parseFloat(String(s || '').replace(/.*\+\s*(-?[\d.]+)px.*/, '$1'));
    return {
      tVmesScy: m ? +m.f.toFixed(3) : null,
      barInline: bar?.style?.top || null,
      contH: cont ? +cont.getBoundingClientRect().height.toFixed(2) : null,
      contW: cont ? +cont.getBoundingClientRect().width.toFixed(2) : null,
      pillH: (() => { const bt = cont?.querySelector('button[aria-label="Color"]'); return bt ? +bt.getBoundingClientRect().height.toFixed(2) : null; })(),
      pillW: (() => { const bt = cont?.querySelector('button[aria-label="Color"]'); return bt ? +bt.getBoundingClientRect().width.toFixed(2) : null; })(),
    };
  });
  const banda = w >= 768 && w <= 1366 && w >= h;
  const extra = (w >= 768 && w <= 1366 && w >= h && h > 768) ? 20 : (banda ? 45 : 20);
  console.log(`${String(w + 'x' + h).padEnd(10)} barInline ${String(r.barInline).padStart(60)} | tV+scy ${r.tVmesScy} | cont ${r.contW}x${r.contH} pill ${r.pillW}x${r.pillH}`);
  await ctx.close();
}
await b.close();
