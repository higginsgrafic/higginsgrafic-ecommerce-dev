// TEMPORAL — la p1 amb un color de samarreta triat (la tira de colors es a la p2).
import { chromium } from '@playwright/test';
const idx = Number(process.argv[2] ?? 3);
const DSF = Number(process.argv[3] || 6);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: DSF });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const colors = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const g = v.querySelector('[data-p2-color-grid]');
  return g ? [...g.querySelectorAll('button')].map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }) : [];
});
if (colors[idx]) { await p.mouse.click(colors[idx].x, colors[idx].y); await p.waitForTimeout(1200); }
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
const info = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const franja = v1.querySelector('[data-stripe-visual-content="1"]');
  const r = franja.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
});
await p.screenshot({ path: '_tmp-p1-color.png', clip: { x: info.x, y: info.y, width: info.width, height: info.height } });
console.log(`desat _tmp-p1-color.png (color ${idx}, DSF ${DSF})`, JSON.stringify(info));
await ctx.close(); await b.close();
