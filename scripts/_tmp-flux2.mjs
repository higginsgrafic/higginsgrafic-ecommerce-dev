// TEMPORAL — no es comiteja. El flux de debò: obrir el megaslide, clicar una
// samarreta atenuada, anar a la PDP, TORNAR-HI (navegant, no amb el boto del
// navegador) i tornar a obrir el megaslide.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 200)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 200)); });

const obre = async () => {
  await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch((e) => console.log('  cercador:', e.message.slice(0, 60)));
  await p.waitForTimeout(5000);
};
const estat = () => p.evaluate(() => ({
  path: location.pathname + location.search,
  tilesP2: document.querySelectorAll('[data-mega-page-viewport="2"] [data-stripe-tile]').length,
  carrusel: !!document.querySelector('[data-carrusel="1"]'),
  franjaVisible: (() => { const f = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-visual-content="2"]'); if (!f) return null; const r = f.getBoundingClientRect(); return r.height > 5; })(),
}));

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await obre();
console.log('obert   ', JSON.stringify(await estat()));

// Clic a la samarreta atenuada
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), dibuix: (t.querySelector('img').currentSrc || '').split('/').pop() };
});
console.log('cliquem ', q.dibuix, '(atenuada)');
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(3200);
console.log('a la PDP', p.url());

// Tornar navegant: el logo
const logo = await p.$('#stripe-guide-header-logo-anchor') || await p.$('header a[href="/"], header a[href="/nova/inici"]');
if (logo) { await logo.click().catch((e) => console.log('  logo:', e.message.slice(0, 60))); }
else { await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load' }); }
await p.waitForTimeout(4000);
console.log('tornat  ', JSON.stringify(await estat()));

await obre();
console.log('reobert ', JSON.stringify(await estat()));

// I tornar a clicar
const q2 = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  if (!t) return null;
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), dibuix: (t.querySelector('img').currentSrc || '').split('/').pop(), op: getComputedStyle(t).opacity };
});
if (!q2) console.log('2n clic: casella no trobada');
else { console.log('2n clic ', q2.dibuix, '(op', q2.op + ')'); await p.mouse.click(q2.x, q2.y); await p.waitForTimeout(3200); console.log('  -> ', p.url()); }

console.log('--- errors:', errs.length);
for (const e of errs.slice(0, 6)) console.log(' ', e);
await b.close();
