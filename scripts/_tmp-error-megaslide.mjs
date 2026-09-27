// TEMPORAL — no es comiteja. Reprodueix l'error del megaslide despres dels
// canvis: obre el cercador i captura el text de l'error i la pila.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e.stack || e).split('\n').slice(0, 6).join(' | ')));
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 300)); });

await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
console.log('despres de carregar, errors:', errs.length);
for (const e of errs.slice(0, 4)) console.log(' ', e);

await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('despres d\'obrir el cercador, errors:', errs.length);
for (const e of errs.slice(0, 6)) console.log(' ', e);

const estat = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...(v2?.querySelectorAll('[data-stripe-tile]') || [])];
  return { panell: !!document.querySelector('[data-mega-panel-surface="1"]'), vp2: !!v2, tiles: tiles.length };
});
console.log('estat:', JSON.stringify(estat));
await b.close();
