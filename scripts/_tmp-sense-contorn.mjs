// TEMPORAL — els selectors: sense fons ni contorn, i la pastilla intacta.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1366, 768], [1920, 946]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(7000);
  const r = await p.evaluate(() => {
    const s = (el) => { if (!el) return null; const cs = getComputedStyle(el); const x = el.getBoundingClientRect(); return { bg: cs.backgroundColor, border: cs.borderTopWidth, shadow: cs.boxShadow, w: +x.width.toFixed(1), h: +x.height.toFixed(1) }; };
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const banda = v2.querySelector('[data-colleccions-franja="1"]');
    const pill = banda ? banda.querySelector('[aria-current="true"]') : null;
    const columna = (() => { let el = v2.querySelector('[data-colleccions-targeta="1"]'); while (el && getComputedStyle(el).borderTopStyle !== 'solid') el = el.parentElement; return el; })();
    const pillCol = columna ? columna.querySelector('[aria-current="true"]') : null;
    return {
      bcn2: s(v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
      banda: s(banda), pill: s(pill),
      columna: s(columna), pillCol: s(pillCol),
      bcn1: s(v1.querySelector('[data-stripe-buttonbar="bn-p1"]')),
      blocP1: s(v1.querySelector('[data-bloc-dreta-p1="1"]')),
    };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  console.log('   errors=', errors.length, errors.slice(0, 1));
  await ctx.close();
}
await b.close();
