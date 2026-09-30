import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('console', (m) => { const t = m.text(); if (t.includes("bucle franja") || t.includes("marge franja") || m.type() === "error") console.log(m.type(), t.slice(0, 200)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(12000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const box = (el) => el ? [+el.getBoundingClientRect().top.toFixed(1), +el.getBoundingClientRect().bottom.toFixed(1)] : null;
  return { banda: box(v2.querySelector('[data-colleccions-franja="1"]')), stripe: box(v2.querySelector('[data-stripe-visual-content="2"]')) };
});
console.log('FINAL', JSON.stringify(r));
await ctx.close(); await b.close();
