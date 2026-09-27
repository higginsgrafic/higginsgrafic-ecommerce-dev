// TEMPORAL — no es comiteja. Que passa despres de tornar enrere: per que el
// megaslide no torna a obrir la franja?
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 200)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(3200);
console.log('a la PDP:', p.url());

await p.goBack({ waitUntil: 'load' });
const mostres = [];
for (let i = 0; i < 12; i++) {
  await p.waitForTimeout(600);
  const s = await p.evaluate(() => ({
    path: location.pathname + location.search,
    vps: document.querySelectorAll('[data-mega-page-viewport]').length,
    panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    tiles: document.querySelectorAll('[data-stripe-tile]').length,
    tilesP2: document.querySelectorAll('[data-mega-page-viewport="2"] [data-stripe-tile]').length,
  }));
  mostres.push(s);
}
console.log('mostres despres d\'anar enrere:');
for (const [i, s] of mostres.entries()) console.log(' ', i, JSON.stringify(s));

// Clic al cercador i mostrejar
const boto = await p.$('button:has(svg.lucide-search)');
console.log('boto cercador:', !!boto);
await boto.click().catch((e) => console.log('clic:', e.message.slice(0, 60)));
for (let i = 0; i < 10; i++) {
  await p.waitForTimeout(600);
  const s = await p.evaluate(() => ({
    tilesP2: document.querySelectorAll('[data-mega-page-viewport="2"] [data-stripe-tile]').length,
    path: location.pathname + location.search,
  }));
  console.log('  clic+', i, JSON.stringify(s));
}
console.log('errors:', errs.length, errs.slice(0, 3));
await b.close();
