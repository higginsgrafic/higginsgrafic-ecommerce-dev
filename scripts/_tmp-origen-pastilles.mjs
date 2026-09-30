// TEMPORAL — on arrenca la pastilla b/c/n i on arrenca la de la tira de
// colleccions en posicio First Contact (i on arrenca la de la columna).
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
      t: (el.textContent || '').trim().slice(0, 16),
      x: +x.left.toFixed(2), fi: +x.right.toFixed(2), w: +x.width.toFixed(2), h: +x.height.toFixed(2),
      bg: cs.backgroundColor, pad: cs.paddingLeft + '/' + cs.paddingRight, vora: cs.borderTopWidth,
    };
  };
  const mTag = (el) => { const q = m(el); return q ? `${q.t}·${el.tagName.toLowerCase()}` : null; };
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const caixa = v2.querySelector('[data-stripe-buttonbar="bn"]');
  const pilla = caixa ? [...caixa.querySelectorAll(':scope > span[aria-hidden="true"]')].pop() : null;
  const franja = v2.querySelector('[data-colleccions-franja="1"]');
  const items = franja ? [...franja.querySelectorAll('[data-colleccions-franja-item]')] : [];
  const actiu = items.find((it) => it.getAttribute('aria-current') === 'true') || items[0] || null;
  // La columna (1920/1440): el primer enllac i el seu pare.
  const targeta = v2.querySelector('[data-colleccions-targeta="1"]');
  const columna = targeta ? targeta.closest('div') : null;
  const blancs = v2 ? [...v2.querySelectorAll('*')].filter((e) => {
    const cs = getComputedStyle(e);
    return e !== pilla && cs.backgroundColor === 'rgb(255, 255, 255)' && e.getBoundingClientRect().width > 20;
  }).slice(0, 12).map((e) => ({ d: mTag(e), ...m(e) })) : [];
  return {
    caixa: m(caixa), pilla: m(pilla),
    franja: m(franja), items: items.length,
    actiu: m(actiu), actiuTag: mTag(actiu),
    columna: m(columna), targeta: m(targeta),
    blancs,
  };
});
console.log(`${w}x${h}`);
console.log('  caixa bcn ', JSON.stringify(r.caixa));
console.log('  pilla bcn ', JSON.stringify(r.pilla));
console.log('  franja    ', JSON.stringify(r.franja), `items=${r.items}`);
console.log('  item actiu', JSON.stringify(r.actiu), r.actiuTag);
console.log('  columna   ', JSON.stringify(r.columna), ' targeta', JSON.stringify(r.targeta));
console.log('  fons blanc dins la vista 2:', JSON.stringify(r.blancs));
console.log('  errors=', errors.length);
await b.close();
