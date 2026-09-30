// TEMPORAL — fons/vora/ombra de les caixes i les pastilles, per mida.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 150)); });
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 150)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 60000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const s = (el) => { if (!el) return null; const cs = getComputedStyle(el); return { bg: cs.backgroundColor, vora: cs.borderTopWidth + ' ' + cs.borderTopColor, ombra: cs.boxShadow === 'none' ? 'none' : 'si' }; };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bcn2 = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const pill2 = [...v2.querySelectorAll('span[aria-hidden="true"]')].find((x) => x.getBoundingClientRect().width > 10 && x.getBoundingClientRect().width < bcn2.getBoundingClientRect().width + 1);
  let col = v2.querySelector('[data-colleccions-targeta="1"]'); while (col && getComputedStyle(col).borderTopStyle !== 'solid') col = col.parentElement;
  return { bcn2: s(bcn2), pill2: s(pill2), columna: s(col), blocP1: s(v1.querySelector('[data-bloc-dreta-p1="1"]')), bcn1: s(v1.querySelector('[data-stripe-buttonbar="bn-p1"]')) };
});
console.log(`${w}x${h}`);
for (const [k, v] of Object.entries(r)) console.log('  ', k.padEnd(9), JSON.stringify(v));
console.log('   errors:', errors.length, errors.slice(0, 1));
await b.close();
