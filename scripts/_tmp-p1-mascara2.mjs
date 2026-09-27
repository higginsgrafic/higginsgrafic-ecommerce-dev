import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  const cs = getComputedStyle(f);
  const m = cs.maskImage || cs.webkitMaskImage;
  return {
    mask: m.slice(0, 120),
    esData: m.includes('data:'),
    size: cs.maskSize, mode: cs.maskMode, pos: cs.maskPosition,
    // el text del data URL, si n'hi ha
    text: m.includes('data:') ? decodeURIComponent(m.replace(/^url\(["']?/, '').replace(/["']?\)$/, '').replace(/^data:image\/svg\+xml,/, '')).slice(0, 300) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
