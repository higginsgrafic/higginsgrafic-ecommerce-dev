// TEMPORAL — no es comiteja. B2: on cau el panell de la p1 i el pageLift.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const dx = -v1.getBoundingClientRect().left;
  const b2 = (el) => { if (!el) return null; const q = el.getBoundingClientRect(); return { x: +(q.left + dx).toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1) }; };
  const panell = document.querySelector('[data-mega-panel-surface="1"]');
  const rootDiv = v1.querySelector(':scope > div');
  return {
    panell: b2(panell),
    pageRoot: b2(rootDiv),
    pageRootTransform: rootDiv ? getComputedStyle(rootDiv).transform : null,
    pageRootStyle: rootDiv ? rootDiv.getAttribute('style') : null,
    carrilLane40: (() => { const w = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')) || 1143; return +(w * 40 / 1350).toFixed(1); })(),
    carrilLane20: (() => { const w = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')) || 1143; return +(w * 20 / 1350).toFixed(1); })(),
    carrilLane25: (() => { const w = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')) || 1143; return +(w * 25 / 1350).toFixed(1); })(),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
