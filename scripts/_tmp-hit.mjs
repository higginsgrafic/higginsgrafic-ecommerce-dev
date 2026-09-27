import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
// Prova de clic REAL amb Playwright sobre una barra de color, comprovant
// abans i despres, i amb el log d'accions.
const bar = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cg = v2.querySelector('[data-p2-color-grid]');
  const b = cg.querySelectorAll('button')[2];
  const r = b.getBoundingClientRect();
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, slug: b.getAttribute('data-color-barra'), top: top ? top.tagName + '.' + String(top.className).split(' ')[0] : null, topEsBarra: !!(top && top.getAttribute && top.getAttribute('data-color-barra')) };
});
console.log('barra', JSON.stringify(bar));
try {
  await p.click('[data-color-barra="royal"]', { timeout: 5000 });
  console.log('click OK');
} catch (e) { console.log('click KO:', e.message.split('\n')[0]); }
await p.waitForTimeout(1000);
console.log('triat despres:', await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const m = [...v2.querySelectorAll('[data-p2-color-grid] button')].find((x) => getComputedStyle(x).outlineStyle === 'solid');
  return m ? m.getAttribute('data-color-barra') : null;
}));
await ctx.close();
await b.close();
