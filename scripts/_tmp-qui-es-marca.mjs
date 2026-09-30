// TEMPORAL: en clicar una subcolleccio, quina queda marcada a la columna i que
// surt al mig de la franja?
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
  const marcada = [...col.querySelectorAll('button')].find((x) => getComputedStyle(x).backgroundColor === 'rgb(255, 255, 255)');
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const t6 = [...cela.querySelectorAll('[data-stripe-tile]')].find((x) => x.getAttribute('data-stripe-tile') === '6');
  const img6 = t6 && t6.querySelector('img');
  const tiles = [...cela.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
  return {
    marcada: marcada ? marcada.textContent.trim() : null,
    casa6: img6 ? (img6.getAttribute('src') || '').split('/').pop() : null,
    sub6: t6 && t6.getAttribute('data-stripe-subcollection'),
    cases: tiles.map((t) => { const i = t.querySelector('img'); return i ? (i.getAttribute('src') || '').split('/').pop().replace('-b-stripe.webp', '').replace('-stripe.webp', '').slice(0, 14) : 'buit'; }),
  };
});
const clica = async (pre) => {
  const i = await p.evaluate((x) => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
    .findIndex((b) => b.textContent.trim().toUpperCase().startsWith(x)), pre);
  await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
  await p.waitForTimeout(1300);
  const e = await estat();
  console.log(`\nclic ${pre}  ->  marcada: "${e.marcada}"   casa 6: ${e.sub6} / ${e.casa6}`);
  console.log('   cases: ' + e.cases.map((c, i) => `${i}:${c}`).join(' '));
};
for (const q of ['PEMBERLEY', 'KEEP CALM', 'CROSSWORDS', 'QUOTES']) await clica(q);
await b.close();
