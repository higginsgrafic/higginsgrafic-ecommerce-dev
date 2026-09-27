// TEMPORAL — no es comiteja. El top del selector de la pagina 1 despres de declarar el pageLift.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [2560, 1306], [1366, 768], [1280, 720], [1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const pill = v1.querySelector('[data-stripe-buttonbar="bn"]');
    const pt = panell.getBoundingClientRect().top;
    return { pill1Top: +(pill.getBoundingClientRect().top - pt).toFixed(2) };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} pill1Top ${r.pill1Top}`);
  await ctx.close();
}
await b.close();
