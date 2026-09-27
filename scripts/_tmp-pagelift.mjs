// TEMPORAL — no es comiteja. page1PageLift i les referencies de la franja.
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
    const pl = window.__hgPL || {};
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const p1sel = v1 ? v1.querySelector('button[aria-label="Color"]') : null;
    const pill1 = v1 ? v1.querySelector('[data-stripe-buttonbar="bn"]') : null;
    const pt = panell ? panell.getBoundingClientRect().top : 0;
    return {
      ...pl,
      pill1Top: pill1 ? +(pill1.getBoundingClientRect().top - pt).toFixed(2) : null,
      btn1Top: p1sel ? +(p1sel.getBoundingClientRect().top - pt).toFixed(2) : null,
      carril: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')) || null,
    };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} pageLift ${String(r.page1PageLift).padStart(7)} despFranja ${String(r.desplacamentFranja).padStart(6)} | pill1Top ${String(r.pill1Top).padStart(7)} btn1Top ${String(r.btn1Top).padStart(7)} | tauleta ${r.isPortraitTablet ? 'V' : (r.isLandscapeTablet ? 'H' : '-')} carril ${r.carril}`);
  await ctx.close();
}
await b.close();
