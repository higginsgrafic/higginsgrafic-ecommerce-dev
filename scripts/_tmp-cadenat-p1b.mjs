import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
// Obrim el megaslide des d'un enllac de colleccio del header (posa megaPage=1).
await p.locator('nav button', { hasText: 'CUBE' }).first().click({ timeout: 8000 }).catch((e) => console.log('clic nav KO', e.message.slice(0, 60)));
await p.waitForTimeout(8000);
const pos = await p.evaluate(() => [...document.querySelectorAll('[data-mega-page-viewport]')].map((e) => `${e.getAttribute('data-mega-page-viewport')}:${Math.round(e.getBoundingClientRect().left)}`).join(' '));
console.log('pagines', pos);
const info = await p.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('loca el megaslide'));
  if (!b) return null;
  const q = b.getBoundingClientRect();
  return {
    rect: { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) },
    visible: q.width > 0 && q.height > 0 && q.top < window.innerHeight && q.top > 0,
    sobre: document.elementsFromPoint(q.left + q.width / 2, q.top + q.height / 2).slice(0, 6).map((e) => `${e.tagName.toLowerCase()}.${(e.className || '').toString().slice(0, 30)} z=${getComputedStyle(e).zIndex} pe=${getComputedStyle(e).pointerEvents}`),
  };
});
console.log('cadenat', JSON.stringify(info, null, 1));
await p.locator('button[aria-label="Bloca el megaslide"]').click({ timeout: 5000 }).then(() => console.log('clic OK')).catch((e) => console.log('clic KO:', e.message.split('\n')[0].slice(0, 90)));
await p.waitForTimeout(1000);
console.log('despres', await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('loca el megaslide')); return b ? b.getAttribute('aria-label') : 'no hi es'; }));
await ctx.close(); await b.close();
