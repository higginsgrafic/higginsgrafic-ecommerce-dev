// TEMPORAL — el fons de les caixes dels selectors (ha de ser transparent).
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
    const bg = (el) => (el ? getComputedStyle(el).backgroundColor : null);
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const bcn2 = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const banda = v2.querySelector('[data-colleccions-franja="1"]');
    const bcn1 = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
    const columna = v2.querySelector('[data-colleccions-targeta="1"]');
    let caixaCol = columna; while (caixaCol && getComputedStyle(caixaCol).borderTopWidth === '0px') caixaCol = caixaCol.parentElement;
    return {
      bcn2: bg(bcn2), banda: bg(banda), bcn1: bg(bcn1), columna: bg(caixaCol),
      blocP1: bg(v1.querySelector('[data-bloc-dreta-p1="1"]')),
      pastillaActiva: banda ? bg(banda.querySelector('[aria-current="true"]')) : null,
    };
  });
  console.log(`${w}x${h}`, JSON.stringify(r), 'errors=', errors.length, errors.slice(0, 1));
  await ctx.close();
}
await b.close();
