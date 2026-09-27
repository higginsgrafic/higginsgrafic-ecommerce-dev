import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text().slice(0, 300)); });
p.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 300)));
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const boto = await p.$('button:has(svg.lucide-search)');
console.log('boto cercador:', !!boto);
await boto?.click().catch((e) => console.log('clic KO', e.message.slice(0, 80)));
await p.waitForTimeout(12000);
console.log(JSON.stringify(await p.evaluate(() => ({
  vp: [...document.querySelectorAll('[data-mega-page-viewport]')].map((x) => { const q = x.getBoundingClientRect(); return { n: x.getAttribute('data-mega-page-viewport'), x: Math.round(q.left), vis: getComputedStyle(x).visibility }; }),
  surface: !!document.querySelector('[data-mega-panel-surface="1"]'),
  cadenat: !!document.querySelector('button[aria-label="Bloca el megaslide"]'),
}))));
await ctx.close();
await b.close();
