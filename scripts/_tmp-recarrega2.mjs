// TEMPORAL: clicar cada colleccio, recarregar la URL i mirar si l'estat es manté.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const estat = () => p.evaluate(() => {
  const col = document.querySelector('[data-colleccions-caixes="1"]');
  const marcada = col && [...col.querySelectorAll('button')].find((x) => getComputedStyle(x).backgroundColor === 'rgb(255, 255, 255)');
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const t6 = cela && [...cela.querySelectorAll('[data-stripe-tile]')].find((x) => x.getAttribute('data-stripe-tile') === '6');
  const im = t6 && t6.querySelector('img');
  return { url: location.pathname + location.search, marcada: marcada ? marcada.textContent.trim() : null, casa6: im ? (im.getAttribute('src') || '').split('/').pop() : null };
});
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
for (const q of ['THE HUMAN', 'CUBE', 'MISCEL']) {
  const i = await p.evaluate((x) => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
    .findIndex((b) => b.textContent.trim().toUpperCase().startsWith(x)), q);
  await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
  await p.waitForTimeout(1200);
  const a = await estat();
  await p.goto('http://127.0.0.1:3003' + a.url, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(9000);
  const d = await estat();
  const igual = a.marcada === d.marcada && a.casa6 === d.casa6;
  console.log(`${igual ? 'OK  ' : 'MAL '} ${q.padEnd(10)} abans: ${String(a.marcada).padEnd(16)} ${String(a.casa6).slice(0, 22).padEnd(24)} | despres: ${String(d.marcada).padEnd(16)} ${String(d.casa6).slice(0, 22)}   url=${d.url}`);
}
await b.close();
