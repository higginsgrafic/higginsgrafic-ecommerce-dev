// TEMPORAL — captura del megaslide p2 amb les guies del carril enceses.
import { chromium } from '@playwright/test';

const w = Number(process.argv[2] || 1366);
const h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const r = await p.evaluate(() => {
  const panel = document.querySelector('[data-mega-panel-surface]');
  const x = panel.getBoundingClientRect();
  return { top: Math.max(0, Math.floor(x.top) - 20), bottom: Math.ceil(x.bottom) + 20 };
});
await p.screenshot({ path: `/tmp/p2-guies-${w}x${h}.png`, clip: { x: 0, y: r.top, width: w, height: Math.min(h - r.top, r.bottom - r.top) } });
console.log(`/tmp/p2-guies-${w}x${h}.png`, r);
await ctx.close(); await b.close();
