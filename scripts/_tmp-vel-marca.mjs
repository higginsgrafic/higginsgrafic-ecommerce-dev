// TEMPORAL — no es comiteja. La imatge del vel porta la mascara nova?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=miscellania', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const imgs = [...franja.querySelectorAll('img')].filter((im) => (im.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  return imgs.map((im) => {
    const s = decodeURIComponent(im.getAttribute('src'));
    return { te: s.includes('hgVelForaActives'), masks: (s.match(/<mask/g) || []).length, gs: (s.match(/<g /g) || []).length, len: s.length };
  });
});
console.log(JSON.stringify(r));
await ctx.close();
await b.close();
