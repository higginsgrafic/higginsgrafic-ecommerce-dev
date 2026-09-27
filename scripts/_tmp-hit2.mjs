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
  const retall = carr.firstElementChild;
  const tira = retall.firstElementChild;
  const boto = [...tira.querySelectorAll('button')].find((x) => { const r = x.getBoundingClientRect(); return r.left > 700 && r.left < 900; });
  const r = boto.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const desc = (e) => `${e.tagName}${e.id ? '#' + e.id : ''} pe=${getComputedStyle(e).pointerEvents} z=${getComputedStyle(e).zIndex} cls=${String(e.className).split(' ').slice(0, 2).join('.')}`;
  return {
    boto: { label: boto.getAttribute('aria-label'), x: Math.round(x), y: Math.round(y), w: +r.width.toFixed(1) },
    stack: document.elementsFromPoint(x, y).slice(0, 6).map(desc),
  };
});
console.log(JSON.stringify(info, null, 1));
const klik = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v2.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const boto = [...tira.querySelectorAll('button')].find((x) => { const r = x.getBoundingClientRect(); return r.left > 700 && r.left < 900; });
  const r = boto.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: boto.getAttribute('aria-label') };
});
await p.mouse.click(klik.x, klik.y);
await p.waitForTimeout(2000);
console.log('colleccio activa despres del clic a', klik.label, ':', await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const a = v2.querySelector('[data-colleccions-targeta][aria-current="true"]');
  return a ? a.textContent.trim() : null;
}));
await ctx.close();
await b.close();
