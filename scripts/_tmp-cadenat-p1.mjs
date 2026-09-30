import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.evaluate(() => { try { window.localStorage.setItem('HG_MEGA_PAGE', '1'); } catch { /* no */ } });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const pos = () => p.evaluate(() => [...document.querySelectorAll('[data-mega-page-viewport]')].map((e) => `${e.getAttribute('data-mega-page-viewport')}:${Math.round(e.getBoundingClientRect().left)}`).join(' '));
console.log('pagines', await pos());
const info = await p.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('loca el megaslide'));
  if (!b) return null;
  const q = b.getBoundingClientRect();
  return {
    label: b.getAttribute('aria-label'),
    rect: { x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1) },
    sobre: document.elementsFromPoint(q.left + q.width / 2, q.top + q.height / 2).slice(0, 6).map((e) => `${e.tagName.toLowerCase()}.${(e.className || '').toString().slice(0, 34)} z=${getComputedStyle(e).zIndex} pe=${getComputedStyle(e).pointerEvents}`),
  };
});
console.log('cadenat', JSON.stringify(info, null, 1));
await p.locator('button[aria-label="Bloca el megaslide"]').click({ timeout: 5000 }).then(() => console.log('clic OK')).catch((e) => console.log('clic KO:', e.message.split('\n')[0].slice(0, 90)));
await p.waitForTimeout(1000);
console.log('despres', await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('loca el megaslide')); return b ? b.getAttribute('aria-label') : 'no hi es'; }));
await ctx.close(); await b.close();
