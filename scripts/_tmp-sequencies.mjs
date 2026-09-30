// TEMPORAL: el dibuix de la casa 6 (el centre) segons la sequencia de clics.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const centre = () => p.evaluate(() => {
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const t = [...cela.querySelectorAll('[data-stripe-tile]')].find((x) => x.getAttribute('data-stripe-tile') === '6');
  const img = t && t.querySelector('img');
  return { sub: t && t.getAttribute('data-stripe-subcollection'), dibuix: img ? (img.getAttribute('src') || '').split('/').pop() : null };
});
const clica = async (pre) => {
  const i = await p.evaluate((x) => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
    .findIndex((b) => b.textContent.trim().toUpperCase().startsWith(x)), pre);
  await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
  await p.waitForTimeout(1300);
  const c = await centre();
  console.log(`  clic ${pre.padEnd(12)} -> casa 6: sub=${String(c.sub).padEnd(12)} dibuix=${c.dibuix}`);
};
console.log('SEQÜENCIA 1: directe');
for (const q of ['PEMBERLEY', 'KEEP CALM']) { await clica(q); }
console.log('SEQÜENCIA 2: passant per CROSSWORDS i QUOTES');
for (const q of ['CROSSWORDS', 'PEMBERLEY', 'QUOTES', 'KEEP CALM', 'LOOKING', 'PEMBERLEY']) { await clica(q); }
await b.close();
