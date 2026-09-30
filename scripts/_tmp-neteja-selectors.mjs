// TEMPORAL — els selectors: fons, vora i ombra de la CAIXA (la pastilla en te de pròpia).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1366, 768], [1920, 946]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(7000);
  const r = await p.evaluate(() => {
    const s = (el) => { if (!el) return null; const cs = getComputedStyle(el); return { bg: cs.backgroundColor, vora: cs.borderTopWidth + ' ' + cs.borderTopColor, ombra: cs.boxShadow === 'none' ? 'none' : cs.boxShadow.slice(0, 40) }; };
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const banda = v2.querySelector('[data-colleccions-franja="1"]');
    const pill = banda ? banda.querySelector('[aria-current="true"]') : null;
    return {
      caixaBcn2: s(v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
      pastillaBcn2: s(v2.querySelector('[data-p2-color-selector] span[aria-hidden="true"]')),
      caixaBanda: s(banda), pastillaBanda: s(pill),
      caixaBcn1: s(v1.querySelector('[data-stripe-buttonbar="bn-p1"]')),
      pastillaBcn1: s(v1.querySelector('[data-stripe-buttonbar="bn-p1"] ~ span[aria-hidden="true"], [data-stripe-buttonbar="bn-p1"] span[aria-hidden="true"]')),
      blocP1: s(v1.querySelector('[data-bloc-dreta-p1="1"]')),
    };
  });
  console.log(`${w}x${h}`);
  for (const [k, v] of Object.entries(r)) console.log('   ', k.padEnd(14), JSON.stringify(v));
  console.log('    errors=', errors.length);
  await ctx.close();
}
await b.close();
