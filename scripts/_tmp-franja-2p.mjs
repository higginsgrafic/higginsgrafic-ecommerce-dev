// TEMPORAL — no es comiteja. Les posicions de les dues pagines, en text compacte.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
console.log('finestra   panell | sel1   sel2   | tile1  retall2 | flet1  flet2  | fr1    fr2');
for (const [w, h] of [[1920, 946], [1440, 800], [2560, 1306], [1366, 768], [1024, 768]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => {
    const t = (s, arrel) => {
      const el = (arrel || document).querySelector(s);
      if (!el) return '   -  ';
      const r2 = el.getBoundingClientRect();
      return (r2.top + r2.height / 2).toFixed(1).padStart(6);
    };
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    return [
      panell.getBoundingClientRect().height.toFixed(1).padStart(6),
      t('button[aria-label="Color"]', v1),
      t('[data-p2-color-selector] button[aria-label="Color"]', v2),
      t('[data-mega-tile]', v1),
      t('[data-carrusel="1"]', v2),
      t('#stripe-guide-right-anchor', v1),
      t('#stripe-guide-right-anchor', v2),
      t('[data-stripe-visual-content="1"]', v1),
      t('[data-stripe-visual-content="2"]', v2),
    ].join(' ');
  });
  console.log(`${String(w).padStart(4)}x${String(h).padEnd(4)} ${r}`);
  await ctx.close();
}
await b.close();
