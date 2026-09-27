// TEMPORAL — captura la franja de la p2 a alta resolucio per mirar el rombe.
import { chromium } from '@playwright/test';
const DSF = Number(process.argv[2] || 3);
const PAGINA = process.argv[3] || '2';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: DSF });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector(`[data-mega-page-viewport="${PAGINA}"]`, { timeout: 30000 });
await p.waitForTimeout(9000);
const rect = await p.evaluate((pag) => {
  const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
  const el = v.querySelector(`[data-stripe-visual-content="${pag}"]`);
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}, PAGINA);
console.log('franja CSS', JSON.stringify(rect));
await p.screenshot({
  path: `_tmp-rombe-p${PAGINA}.png`,
  clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
});
console.log(`desat _tmp-rombe-p${PAGINA}.png a DSF ${DSF} (${Math.round(rect.width * DSF)}x${Math.round(rect.height * DSF)} px)`);
await ctx.close();
await b.close();
