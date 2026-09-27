// TEMPORAL — les fletxes de la p2: qui rep el clic i si la FRANJA es mou.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const carr = v2.querySelector('[data-carrusel="1"]');
  const fletxes = [...carr.querySelectorAll('button[aria-label="Anterior"], button[aria-label="Següent"]')].map((e) => {
    const r = e.getBoundingClientRect();
    const x = Math.round(r.left + r.width / 2); const y = Math.round(r.top + r.height / 2);
    const qui = document.elementFromPoint(x, y);
    return { label: e.getAttribute('aria-label'), x, y, w: Math.round(r.width), h: Math.round(r.height), qui: qui ? `${qui.tagName}.${String(qui.className || '').slice(0, 24)}` : null, esLaFletxa: qui === e || e.contains(qui) };
  });
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  return { fletxes, srcs: tiles.map((t) => t.getAttribute('data-stripe-src')) };
});
console.log('fletxes p2:', JSON.stringify(info.fletxes, null, 1));
console.log('cases abans:', JSON.stringify(info.srcs.slice(0, 3)));
const f = info.fletxes.find((x) => x.label === 'Següent');
if (f) { await p.mouse.click(f.x, f.y); await p.waitForTimeout(1200); }
const desp = await p.evaluate(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-stripe-tile]')].map((t) => t.getAttribute('data-stripe-src')));
console.log('cases despres:', JSON.stringify(desp.slice(0, 3)));
await ctx.close();
await b.close();
