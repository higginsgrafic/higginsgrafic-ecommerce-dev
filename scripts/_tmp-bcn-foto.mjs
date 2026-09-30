// TEMPORAL — retall de la caixa i la pastilla del selector b/c/n de la p2.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1920), h = Number(process.argv[3] || 946);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const caixa = v2.querySelector('[data-stripe-buttonbar="bn"]');
  const bx = caixa.getBoundingClientRect();
  return { x: Math.max(0, Math.round(bx.left) - 6), y: Math.max(0, Math.round(bx.top) - 6), width: Math.round(bx.width) + 12, height: Math.round(bx.height) + 12 };
});
await p.screenshot({ path: `/tmp/bcn-${w}.png`, clip: r });
console.log(`/tmp/bcn-${w}.png`, r);
await ctx.close(); await b.close();
