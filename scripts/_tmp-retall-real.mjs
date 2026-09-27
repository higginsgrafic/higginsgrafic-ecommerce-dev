// TEMPORAL — no es comiteja. L'amplada real del retall de la graella (clientWidth).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w,h] of [[1920,946],[1512,900],[1440,800],[2560,1306]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(4000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(9000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const retall = v2.querySelector('[data-carrusel="1"]')?.firstElementChild;
    const scrollW = document.documentElement.clientWidth;
    return { retallClient: retall ? retall.clientWidth : null, retallRect: retall ? +retall.getBoundingClientRect().width.toFixed(2) : null, layoutW: document.body.clientWidth };
  });
  console.log(`${w}x${h} body.clientWidth=${r.layoutW} retall.clientWidth=${r.retallClient} rect=${r.retallRect}`);
  await ctx.close();
}
await b.close();
