// TEMPORAL — el scroll vertical mou les pagines del megaslide?
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1366), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const pos = () => p.evaluate(() => `scrollY=${Math.round(window.scrollY)} | ` + [...document.querySelectorAll('[data-mega-page-viewport]')].map((e) => `${e.getAttribute('data-mega-page-viewport')}:${Math.round(e.getBoundingClientRect().left)}`).join(' '));
console.log('inici  ', await pos());
for (let i = 1; i <= 4; i += 1) {
  await p.mouse.move(Math.round(w / 2), Math.round(h / 2));
  await p.mouse.wheel(0, 500);
  await p.waitForTimeout(2500);
  console.log(`scroll ${i}`, await pos());
  await p.screenshot({ path: `/tmp/scroll-${w}-${i}.png` });
}
await ctx.close(); await b.close();
