// TEMPORAL — la mida de la pastilla b/c/n (p2 i p1) i el contorn de la caixa,
// després de pintar la vora com una ombra interior.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 60000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const m = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const x = el.getBoundingClientRect();
    return {
      x: +x.left.toFixed(2), fi: +x.right.toFixed(2),
      w: +x.width.toFixed(2), h: +x.height.toFixed(2),
      vora: cs.borderTopWidth, ombra: cs.boxShadow === 'none' ? 'none' : 'si',
      bg: cs.backgroundColor,
    };
  };
  const pilla = (caixa) => {
    if (!caixa) return null;
    const fills = [...caixa.querySelectorAll(':scope > span[aria-hidden="true"]')];
    return m(fills[fills.length - 1]);
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const c2 = v2 ? v2.querySelector('[data-stripe-buttonbar="bn"]') : null;
  const c1 = v1 ? v1.querySelector('[data-stripe-buttonbar="bn-p1"]') : null;
  const enllacos = v2 ? [...v2.querySelectorAll('[data-colleccions-targeta="1"]')] : [];
  const columna = enllacos.length ? enllacos[0].parentElement : null;
  return {
    caixa2: m(c2), pilla2: pilla(c2),
    caixa1: m(c1), pilla1: pilla(c1),
    columna: m(columna),
  };
});
console.log(`${w}x${h}`);
console.log('  p2 caixa ', JSON.stringify(r.caixa2));
console.log('  p2 pilla ', JSON.stringify(r.pilla2));
console.log('  p1 caixa ', JSON.stringify(r.caixa1));
console.log('  p1 pilla ', JSON.stringify(r.pilla1));
console.log('  columna  ', JSON.stringify(r.columna), ' errors=', errors.length);
await b.close();
