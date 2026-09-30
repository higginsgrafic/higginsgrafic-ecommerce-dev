// TEMPORAL: clicar PEMBERLEY, mirar la URL, i recarregar-la: que surt al mig?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const estat = () => p.evaluate(() => {
  const col = document.querySelector('[data-colleccions-caixes="1"]');
  const marcada = col ? [...col.querySelectorAll('button')].find((x) => getComputedStyle(x).backgroundColor === 'rgb(255, 255, 255)') : null;
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const tiles = [...cela.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
  const dib = (i) => { const t = tiles.find((x) => x.getAttribute('data-stripe-tile') === String(i)); const im = t && t.querySelector('img'); return im ? (im.getAttribute('src') || '').split('/').pop().replace('-b-stripe.webp', '').replace('-stripe.webp', '') : 'buit'; };
  return { url: location.pathname + location.search, marcada: marcada ? marcada.textContent.trim() : null, casa6: dib(6), cases: tiles.map((t, i) => i + ':' + dib(i).slice(0, 14)) };
});
const i = await p.evaluate(() => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
  .findIndex((b) => b.textContent.trim().toUpperCase().startsWith('PEMBERLEY')));
await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
await p.waitForTimeout(1500);
const a1 = await estat();
console.log(`despres de clicar PEMBERLEY:  url=${a1.url}  marcada=${a1.marcada}  casa 6=${a1.casa6}`);
console.log('  cases: ' + a1.cases.join(' '));

// Ara es recarrega la mateixa URL.
await p.goto('http://127.0.0.1:3003' + a1.url, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(9000);
const a2 = await estat();
console.log(`\ndespres de RECARREGAR:        url=${a2.url}  marcada=${a2.marcada}  casa 6=${a2.casa6}`);
console.log('  cases: ' + a2.cases.join(' '));
await b.close();
