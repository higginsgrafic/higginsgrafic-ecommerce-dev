// TEMPORAL — no es comiteja. Grava l'obertura del megaslide en video.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1920, height: 946 },
  deviceScaleFactor: 1,
  recordVideo: { dir: 'scripts/_tmp-video', size: { width: 1920, height: 946 } },
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4500);
const clic = await p.evaluate(() => {
  const bot = [...document.querySelectorAll('button')].filter((b) => b.querySelector('svg.lucide-search')).map((b) => b.getBoundingClientRect()).find((x) => x.top < 60);
  return bot ? [bot.x + bot.width / 2, bot.y + bot.height / 2] : null;
});
await p.mouse.click(clic[0], clic[1]);
await p.waitForTimeout(2500);
// També: canvi de pagina 1 -> 2 dins el panell (el panell ja obert)
const pesta = await p.evaluate(() => {
  const bot = [...document.querySelectorAll('button')].filter((b) => /Cerca|cercador|Dibuix/i.test(b.getAttribute('aria-label') || b.textContent || '')).map((b) => ({ r: b.getBoundingClientRect(), t: b.textContent.trim().slice(0, 20), a: b.getAttribute('aria-label') }));
  return bot.slice(0, 6);
});
console.log('pestanyes?', JSON.stringify(pesta));
await p.waitForTimeout(1000);
await ctx.close();
await b.close();
console.log('video fet');
