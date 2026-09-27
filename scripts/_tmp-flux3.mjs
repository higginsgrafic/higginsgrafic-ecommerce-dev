// TEMPORAL — no es comiteja. Despres de tornar de la PDP: obrir el megaslide i
// veure quina pagina surt i si la franja hi es.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));

const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const r = v2 ? v2.getBoundingClientRect() : null;
  return {
    tiles: document.querySelectorAll('[data-stripe-tile]').length,
    carrusel: !!document.querySelector('[data-carrusel="1"]'),
    panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    v2visible: r ? (r.left > -100 && r.width > 100) : false,
    v2left: r ? Math.round(r.left) : null,
    megaPageLocal: (() => { try { return window.localStorage.getItem('HG_MEGA_PAGE'); } catch { return null; } })(),
  };
});

const tanca = async () => {
  // Tanca el calaix si es obert (el boto es commutador)
  const obert = await p.evaluate(() => !!document.querySelector('[data-mega-panel-surface="1"]'));
  if (obert) { await p.click('button:has(svg.lucide-search)').catch(() => {}); await p.waitForTimeout(2000); }
};

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
await p.waitForTimeout(3000);
console.log('a la PDP:', p.url());
await p.goBack({ waitUntil: 'load' });
await p.waitForTimeout(4500);
console.log('enrere    :', JSON.stringify(await estat()));

await tanca();
console.log('tancat    :', JSON.stringify(await estat()));

await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
console.log('reobert   :', JSON.stringify(await estat()));

const q2 = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="8"]');
  if (!t) return null;
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), dibuix: (t.querySelector('img').currentSrc || '').split('/').pop() };
});
if (q2) { await p.mouse.click(q2.x, q2.y); await p.waitForTimeout(3000); console.log('2n clic   :', q2.dibuix, '->', p.url()); }
else console.log('2n clic   : casella no trobada');
console.log('errors:', errs.length, errs.slice(0, 2));
await b.close();
