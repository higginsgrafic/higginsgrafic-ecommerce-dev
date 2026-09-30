// TEMPORAL: a l'apaisada (una sola filera de 14), el grup ha de seguir CENTRAT.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const cases = () => p.evaluate(() => {
  const c = document.querySelector('[data-stripe-visual-content="2"]');
  return [...c.querySelectorAll('[data-stripe-tile]')]
    .sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')))
    .map((t) => ({ idx: Number(t.getAttribute('data-stripe-tile')), coll: t.getAttribute('data-stripe-collection') }));
});
const mostra = (titol, l) => console.log(`${titol}: ` + l.map((c) => `${c.idx}:${(c.coll || '?').slice(0, 6)}`).join(' '));
mostra('inicial (first_contact)', await cases());
// Clic a MISCEL·LANIA des de la filera de targetes.
const i = await p.evaluate(() => [...document.querySelector('[data-p2-cercador-row="true"]').querySelectorAll('button')]
  .findIndex((x) => x.textContent.trim().toUpperCase().startsWith('MISCEL')));
await p.evaluate((j) => document.querySelector('[data-p2-cercador-row="true"]').querySelectorAll('button')[j].click(), i);
await p.waitForTimeout(1500);
mostra('clic MISCEL·LANIA', await cases());
await b.close();
