// TEMPORAL: que hi ha a cada casa de la franja en clicar una subcolleccio d'austen.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const cases = () => p.evaluate(() => {
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  return [...cela.querySelectorAll('[data-stripe-tile]')]
    .sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')))
    .map((t) => ({
      idx: Number(t.getAttribute('data-stripe-tile')),
      sub: t.getAttribute('data-stripe-subcollection') || '-',
      item: (t.getAttribute('data-stripe-item') || '').slice(0, 26),
      imatge: ((t.querySelector('img') || {}).getAttribute ? (t.querySelector('img').getAttribute('src') || '') : '').split('/').pop().split('?')[0],
    }));
});
const mostra = (titol, l) => {
  console.log(`\n${titol}`);
  l.forEach((c) => console.log(`  casa ${String(c.idx).padStart(2)}  ${c.sub.padEnd(12)} dibuix=${c.imatge.slice(0, 44)}`));
};
for (const [nom, pre] of [['PEMBERLEY', 'PEMBERLEY'], ['KEEP CALM', 'KEEP'], ['CROSSWORDS', 'CROSSWORDS']]) {
  const i = await p.evaluate((x) => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
    .findIndex((b) => b.textContent.trim().toUpperCase().startsWith(x)), pre);
  await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
  await p.waitForTimeout(1500);
  mostra(`=== clic ${nom} ===`, await cases());
}
await b.close();
