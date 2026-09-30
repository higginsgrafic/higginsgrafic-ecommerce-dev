// CAPTURA DE TOT EL MEGASLIDE AMB LA PAGINA 1 AL DAVANT (02/10/2026).
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1024), h = Number(process.argv[3] || 768);
const etiqueta = process.argv[4] || 'abans';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
await p.click('button[aria-label="Anterior"]').catch(() => {});
await p.waitForTimeout(6000);
const v1 = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const q = v1.getBoundingClientRect();
  return { x: q.left, y: q.top, w: q.width, h: q.height };
});
await p.screenshot({
  path: `_tmp-mega-p1-${etiqueta}-${w}.png`,
  clip: { x: Math.max(0, v1.x), y: Math.max(0, v1.y), width: Math.min(w, v1.w), height: Math.min(h - Math.max(0, v1.y), v1.h) },
});
console.log(`_tmp-mega-p1-${etiqueta}-${w}.png`, JSON.stringify(v1));
await ctx.close();
await b.close();
