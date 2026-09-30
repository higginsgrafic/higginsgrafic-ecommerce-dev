// TEMPORAL — una mida: mides de les pastilles dels selectors.
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
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bx = (el) => { const x = el.getBoundingClientRect(); return [+x.left.toFixed(1), +x.right.toFixed(1), +x.width.toFixed(1), +x.height.toFixed(2)]; };
  const bcn2 = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const pill2 = [...v2.querySelectorAll('span[aria-hidden="true"]')].find((s) => s.getBoundingClientRect().width > 10 && s.getBoundingClientRect().width < bcn2.getBoundingClientRect().width + 1);
  const bcn1 = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const pill1 = bcn1 ? [...v1.querySelectorAll('span[aria-hidden="true"]')].find((s) => s.getBoundingClientRect().width > 10 && s.getBoundingClientRect().width < bcn1.getBoundingClientRect().width) : null;
  const banda = v2.querySelector('[data-colleccions-franja="1"]');
  const pillBanda = banda ? banda.querySelector('[aria-current="true"]') : null;
  return {
    bcn2Caixa: bx(bcn2), bcn2Pill: pill2 ? bx(pill2) : null,
    bcn1Caixa: bcn1 ? bx(bcn1) : null, bcn1Pill: pill1 ? bx(pill1) : null,
    tira: pillBanda ? bx(pillBanda) : null,
  };
});
console.log(`${w}x${h}`);
console.log('  B/C/N p2  caixa', JSON.stringify(r.bcn2Caixa), ' pastilla', JSON.stringify(r.bcn2Pill));
console.log('  B/C/N p1  caixa', JSON.stringify(r.bcn1Caixa), ' pastilla', JSON.stringify(r.bcn1Pill));
console.log('  tira      pastilla', JSON.stringify(r.tira), r.tira && r.bcn2Pill ? `  finals ${r.bcn2Pill[1]} vs ${r.tira[1]} (dif ${(r.tira[1] - r.bcn2Pill[1]).toFixed(1)})` : '');
console.log('  errors:', errors.length, errors.slice(0, 2));
await b.close();
