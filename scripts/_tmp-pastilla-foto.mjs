// TEMPORAL — retall de la pastilla de la tira de col·leccions.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1366), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const banda = v2.querySelector('[data-colleccions-franja="1"]');
  const bx = banda.getBoundingClientRect();
  return { x: Math.max(0, Math.round(bx.left) - 12), y: Math.max(0, Math.round(bx.top) - 12), width: Math.round(bx.width) + 24, height: Math.round(bx.height) + 24 };
});
await p.screenshot({ path: '/tmp/pastilla-franja.png', clip: r });
console.log('/tmp/pastilla-franja.png', r);
await ctx.close(); await b.close();
