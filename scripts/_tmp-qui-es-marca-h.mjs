// TEMPORAL: a l'apaisada (1920), en clicar una subcolleccio d'austen, que surt al
// mig de la franja (cases 6 i 7) i quina queda marcada?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const estat = () => p.evaluate(() => {
  const c = document.querySelector('[data-stripe-visual-content="2"]');
  const tiles = [...c.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
  const dib = (i) => { const t = tiles.find((x) => x.getAttribute('data-stripe-tile') === String(i)); const im = t && t.querySelector('img'); return im ? (im.getAttribute('src') || '').split('/').pop().replace('-b-stripe.webp', '').replace('-stripe.webp', '') : 'buit'; };
  return { cases: tiles.map((t, i) => { const im = t.querySelector('img'); return i + ':' + (im ? (im.getAttribute('src') || '').split('/').pop().replace('-b-stripe.webp', '').replace('-stripe.webp', '').slice(0, 16) : 'buit'); }), mig: `${dib(6)} / ${dib(7)}` };
});
const clica = async (pre) => {
  const i = await p.evaluate((x) => [...document.querySelector('[data-p2-cercador-row="true"]').querySelectorAll('button')]
    .findIndex((b) => b.textContent.trim().toUpperCase().startsWith(x)), pre);
  await p.evaluate((j) => document.querySelector('[data-p2-cercador-row="true"]').querySelectorAll('button')[j].click(), i);
  await p.waitForTimeout(1300);
  const e = await estat();
  console.log(`\nclic ${pre}  ->  mig: ${e.mig}`);
  console.log('   cases: ' + e.cases.join(' '));
};
for (const q of ['PEMBERLEY', 'KEEP CALM', 'CROSSWORDS', 'QUOTES']) await clica(q);
await b.close();
