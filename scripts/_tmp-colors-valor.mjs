// TEMPORAL — no es comiteja. El desnivellColors aplicat (marginTop negat).
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
    const colors = v2.querySelector('[data-p2-color-grid]');
    const crop = v2.querySelector('[data-carrusel="1"] > div');
    const cs = getComputedStyle(document.documentElement);
    return {
      mt: +Number.parseFloat(getComputedStyle(colors).marginTop).toFixed(3),
      stripW: +colors.getBoundingClientRect().width.toFixed(3),
      stripH: +colors.getBoundingClientRect().height.toFixed(3),
      cropW: +crop.getBoundingClientRect().width.toFixed(3),
      carril: Number.parseFloat(cs.getPropertyValue('--hg-mega-w')) || null,
      escala: Number.parseFloat(cs.getPropertyValue('--hg-escala-mega')) || null,
    };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} desnivellColors ${String(-r.mt).padStart(8)} | stripW ${r.stripW} stripH ${r.stripH} cropW ${r.cropW} | carril ${r.carril} escala ${r.escala && r.escala.toFixed(4)}`);
  await ctx.close();
}
await b.close();
