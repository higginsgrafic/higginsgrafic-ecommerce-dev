// TEMPORAL — no es comiteja. El top de LAYOUT de la franja (sense transform).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306], [1680, 900], [2000, 1000], [1400, 900], [1366, 768], [1280, 720], [1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const panel = document.querySelector('[data-mega-panel-surface="1"]');
    const m = new DOMMatrixReadOnly(getComputedStyle(franja).transform);
    const r2 = franja.getBoundingClientRect();
    const v2r = v2.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const visualRelV2 = r2.top - v2r.top;
    const visualRelPanel = r2.top - pr.top;
    return {
      ty: +m.f.toFixed(3),
      visualRelV2: +visualRelV2.toFixed(2),
      visualRelPanel: +visualRelPanel.toFixed(2),
      layoutRelV2: +(visualRelV2 - m.f).toFixed(2),
      layoutRelPanel: +(visualRelPanel - m.f).toFixed(2),
      franjaH: +r2.height.toFixed(2),
      v2RelPanel: +(v2r.top - pr.top).toFixed(2),
    };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} ty ${String(r.ty).padStart(8)} | visualV2 ${String(r.visualRelV2).padStart(7)} visualPanel ${String(r.visualRelPanel).padStart(7)} | layoutV2 ${String(r.layoutRelV2).padStart(7)} layoutPanel ${String(r.layoutRelPanel).padStart(7)} | H ${r.franjaH} | v2Panel ${r.v2RelPanel}`);
  await ctx.close();
}
await b.close();
