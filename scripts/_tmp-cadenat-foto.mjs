// TEMPORAL — captura del cadenat (vora dreta del carril).
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1366), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const x = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
  const ww = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
  const btn = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('megaslide'));
  const x0 = btn.getBoundingClientRect();
  return { left: Math.round(x + ww) - 260, top: Math.round(x0.top) - 40, w: 300, h: 170 };
});
await p.screenshot({ path: `/tmp/cadenat-${w}x${h}.png`, clip: { x: r.left, y: Math.max(0, r.top), width: r.w, height: r.h } });
console.log(`/tmp/cadenat-${w}x${h}.png`, r);
await ctx.close(); await b.close();
