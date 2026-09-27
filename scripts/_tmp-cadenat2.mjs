// TEMPORAL — no es comiteja. Per que no es munten el cadenat.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => {
  const surfaces = document.querySelectorAll('[data-mega-panel-surface]');
  const info = [...surfaces].map((s) => { const q = s.getBoundingClientRect(); return { n: s.getAttribute('data-mega-panel-surface'), y: +q.top.toFixed(0), h: +q.height.toFixed(0), b: +q.bottom.toFixed(0) }; });
  return {
    surfaces: info,
    megaB: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom').trim(),
    megaBAmple: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom-ample').trim(),
    cadenat: !!document.querySelector('button[aria-label="Bloca el megaslide"]'),
    bodyChildren: document.body.children.length,
    portaledButtons: [...document.querySelectorAll('body > div > div > button')].map((x) => x.getAttribute('aria-label')).filter(Boolean),
  };
}), null, 1));
await ctx.close();
await b.close();
