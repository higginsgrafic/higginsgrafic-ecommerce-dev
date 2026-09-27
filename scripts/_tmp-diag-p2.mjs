// TEMPORAL — no es comiteja. Diagnosti: com s'obre el megaslide i on viu la graella.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=cube', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
console.log('botons de la capcalera:', await p.evaluate(() => [...document.querySelectorAll('header button')].map((x) => (x.textContent || x.getAttribute('aria-label') || x.className).slice(0, 30)).slice(0, 20)));
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch((e) => console.log('cercador NO', e.message.slice(0, 80)));
await p.waitForTimeout(4000);
console.log('viewports:', await p.evaluate(() => [...document.querySelectorAll('[data-mega-page-viewport]')].map((x) => x.getAttribute('data-mega-page-viewport'))));
console.log('targetes:', await p.evaluate(() => document.querySelectorAll('[data-colleccions-targeta]').length));
console.log('graella items:', await p.evaluate(() => document.querySelectorAll('[data-graella-dibuix]').length));
console.log('atributs de la graella:', await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  if (!v) return null;
  const amb = [...v.querySelectorAll('*')].filter((e) => [...e.attributes].some((a) => a.name.startsWith('data-')));
  return [...new Set(amb.flatMap((e) => [...e.attributes].map((a) => a.name)))].join(', ');
}));
await b.close();
