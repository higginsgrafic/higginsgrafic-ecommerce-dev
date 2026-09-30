// TEMPORAL — les separacions entre els enllacos de la franja de colleccions.
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1180, 820], [1024, 768]];

const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const items = [...v2.querySelectorAll('[data-colleccions-franja-item="1"]')];
      const caixa = v2.querySelector('[data-colleccions-franja="1"]');
      const bs = items.map((el) => { const x = el.getBoundingClientRect(); return { l: +x.left.toFixed(2), r: +x.right.toFixed(2) }; });
      const gaps = bs.slice(1).map((b2, i) => +(b2.l - bs[i].r).toFixed(2));
      return {
        n: items.length,
        caixa: caixa ? [+caixa.getBoundingClientRect().left.toFixed(1), +caixa.getBoundingClientRect().right.toFixed(1)] : null,
        primer: bs.length ? bs[0].l : null,
        ultim: bs.length ? bs[bs.length - 1].r : null,
        gaps,
      };
    });
    if (!r.caixa) { console.log(`${w}x${h}  COLUMNA (composicio de sempre, sense franja)  errors=${errors.length}`); continue; }
    const min = Math.min(...r.gaps), max = Math.max(...r.gaps);
    console.log(`${w}x${h}  caixa ${r.caixa[0]}..${r.caixa[1]}  enllacos ${r.primer}..${r.ultim}  (${r.n})`);
    console.log(`     separacions: ${r.gaps.join(', ')}   -> min ${min}  max ${max}  diferencia ${(max - min).toFixed(2)}  errors=${errors.length}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
