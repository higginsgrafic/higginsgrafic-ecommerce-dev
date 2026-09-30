// TEMPORAL (28/09/2026): tira de fotogrames de la cantonada on viu el selector
// BLANC/COLOR/NEGRE, just despres de clicar LOOKING FOR MY DARCY.
// Us: node scripts/_tmp-pastilla-tira.mjs [etiqueta] [x] [y] [w] [h]
import { chromium } from '@playwright/test';

const etiqueta = process.argv[2] || 'tira';
const clip = {
  x: Number(process.argv[3] ?? 0),
  y: Number(process.argv[4] ?? 100),
  width: Number(process.argv[5] ?? 300),
  height: Number(process.argv[6] ?? 240),
};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const idx = await p.evaluate(() => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
  .findIndex((x) => x.textContent.trim().toUpperCase().startsWith('LOOKING')));
console.log('clic a idx', idx, 'retall', JSON.stringify(clip));
await p.screenshot({ path: `_tmp-${etiqueta}-00.png`, clip });
await p.evaluate((i) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[i].click(), idx);
for (let k = 1; k <= 11; k += 1) await p.screenshot({ path: `_tmp-${etiqueta}-${String(k).padStart(2, '0')}.png`, clip });
await p.waitForTimeout(1800);
await p.screenshot({ path: `_tmp-${etiqueta}-99.png`, clip });
console.log('desats 13 retalls');
await b.close();
