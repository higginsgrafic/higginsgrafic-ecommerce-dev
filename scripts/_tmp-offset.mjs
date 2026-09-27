// TEMPORAL — no es comiteja. Quin es el desplaçament de la tira i quin dibuix
// hauria d'ensenyar cada casa amb aquest desplaçament?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  return {
    cases: tiles.map((t) => (t.querySelector('img')?.currentSrc || '').split('/').pop()),
    // Les cases que el gestor troba amb elementFromPoint al centre de cada casa.
    sota: tiles.map((t) => {
      const bb = t.getBoundingClientRect();
      const el = document.elementFromPoint(bb.left + bb.width / 2, bb.top + bb.height / 2);
      return el?.closest?.('[data-stripe-tile]')?.getAttribute?.('data-stripe-tile') ?? 'null';
    }),
  };
});
for (let i = 0; i < r.cases.length; i++) console.log(`casa ${String(i).padStart(2)}  ensenya ${String(r.cases[i]).padEnd(32)} elementFromPoint diu casa ${r.sota[i]}`);
await b.close();
