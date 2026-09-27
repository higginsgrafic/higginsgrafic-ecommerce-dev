// TEMPORAL — no es comiteja. Els clics de la franja: funcionen?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('C: ' + m.text().slice(0, 160)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);

const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const act = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => getComputedStyle(x).backgroundColor !== 'rgba(0, 0, 0, 0)');
  const cases = [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => {
    const img = t.querySelector('img');
    return `${t.getAttribute('data-stripe-tile')}:${(img?.currentSrc || '').split('/').pop().replace('-b-stripe.webp', '').slice(0, 16)}:op${getComputedStyle(t).opacity}`;
  });
  return { actiu: act ? (act.textContent || '').trim() : null, url: location.pathname + location.search, cases };
});

// Clic a la casa 5 (una samarreta ATENUADA, d'una altra colleccio).
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="5"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), src: (t.querySelector('img')?.currentSrc || '').split('/').pop() };
});
console.log('abans  :', JSON.stringify(await estat()));
console.log('clico  :', JSON.stringify(q));

// Es mira qui rep el clic en aquest punt.
const rep = await p.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y);
  return { tag: el?.tagName, cls: String(el?.className).slice(0, 40), pare: el?.parentElement?.tagName, data: el?.getAttribute?.('data-stripe-tile') || el?.parentElement?.getAttribute?.('data-stripe-tile') || null };
}, [q.x, q.y]);
console.log('rep el clic:', JSON.stringify(rep));

// Es mira si l'esdeveniment surt del panell.
await p.evaluate(() => {
  window.__hits = [];
  window.addEventListener('mega-stripe-full-hit-p2', (e) => window.__hits.push(e.detail), true);
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(2500);
console.log('esdeveniments mega-stripe-full-hit-p2:', JSON.stringify(await p.evaluate(() => window.__hits)));
console.log('despres:', JSON.stringify(await estat()));
console.log('errors:', errs.length, errs.slice(0, 3));
await b.close();
