// TEMPORAL — on cau la silueta de l'ombra i qui es a sobre: es pinta de VERMELL.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
await p.evaluate(() => {
  const o = document.querySelector('[data-maniga-ombra="1"]');
  const intern = o.firstElementChild;
  intern.style.backgroundColor = '#ff0000';
  o.style.filter = 'none';
  o.style.zIndex = '-1';
});
await p.waitForTimeout(400);
await p.screenshot({ path: '_tmp-bec-vermell.png', clip: { x: 1300, y: 235, width: 240, height: 90 } });
console.log('desat _tmp-bec-vermell.png');
await ctx.close(); await b.close();
