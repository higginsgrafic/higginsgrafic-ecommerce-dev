// TEMPORAL — contorns visibles (no transparents) a prop dels selectors.
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
    const vis = (el) => {
      const cs = getComputedStyle(el);
      const ample = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopColor !== 'rgba(0, 0, 0, 0)';
      const anell = cs.boxShadow.split('0px 0px 0px').length > 1 && /rgb/.test(cs.boxShadow.split(',')[0]);
      const x = el.getBoundingClientRect();
      return ample || anell ? { b: cs.borderTopWidth + ' ' + cs.borderTopColor, tag: el.tagName, box: [+x.left.toFixed(0), +x.top.toFixed(0), +x.width.toFixed(0), +x.height.toFixed(0)] } : null;
    };
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const zona = (root, sel) => [...root.querySelectorAll(sel)].map(vis).filter(Boolean);
    return {
      bcn2: zona(v2, '[data-p2-color-selector] *').concat(zona(v2, '[data-p2-color-selector]')),
      banda: zona(v2, '[data-colleccions-franja="1"] *'),
      columna: zona(v2, '[data-colleccions-targeta="1"]').concat(v2.querySelector('[data-colleccions-targeta="1"]') ? zona(v2.querySelector('[data-colleccions-targeta="1"]').parentElement, '*') : []),
      p1: zona(v1, '[data-stripe-buttonbar="bn-p1"] *').concat(zona(v1, '[data-bloc-dreta-p1="1"] *')),
    };
  });
  console.log(`${w}x${h}  bcn2=${JSON.stringify(r.bcn2)}`);
  console.log(`   banda=${JSON.stringify(r.banda)}`);
  console.log(`   columna=${JSON.stringify(r.columna)}  p1=${JSON.stringify(r.p1)}  errors=${errors.length}`);
  await ctx.close();
}
await b.close();
