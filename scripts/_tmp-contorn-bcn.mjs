// TEMPORAL — tot el que dibuixa una vora o un anell a prop del selector B/C/N.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bcn = v2.querySelector('[data-stripe-buttonbar="bn"]');
  const z = bcn.getBoundingClientRect();
  const out = [];
  const mira = (el, etiqueta) => {
    const cs = getComputedStyle(el);
    const x = el.getBoundingClientRect();
    const teVora = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
    const teAnell = /rgb/.test(cs.boxShadow) || cs.outlineStyle !== 'none';
    if (!teVora && !teAnell) return;
    out.push({
      etiqueta,
      tag: el.tagName + (el.getAttribute('data-stripe-buttonbar') ? '[' + el.getAttribute('data-stripe-buttonbar') + ']' : '') + (el.getAttribute('aria-hidden') === 'true' ? '[aria-hidden]' : ''),
      border: `${cs.borderTopWidth} ${cs.borderTopColor}`,
      shadow: cs.boxShadow.slice(0, 60),
      box: [+x.left.toFixed(1), +x.top.toFixed(1), +x.width.toFixed(1), +x.height.toFixed(1)],
    });
  };
  // el propi bcn i tot el seu entorn (pares i germans)
  mira(bcn, 'bcn');
  let el = bcn.parentElement;
  let i = 1;
  while (el && el !== v2 && i < 4) { mira(el, 'pare' + i); el = el.parentElement; i++; }
  [...bcn.querySelectorAll('*')].forEach((f) => mira(f, 'fill'));
  const wrapper = v2.querySelector('[data-p2-color-selector]');
  if (wrapper) [...wrapper.querySelectorAll('*')].forEach((f) => mira(f, 'wrapper'));
  return { z: [+z.left.toFixed(1), +z.top.toFixed(1), +z.width.toFixed(1), +z.height.toFixed(1)], out };
});
console.log('bcn box', JSON.stringify(r.z));
for (const o of r.out) console.log(' ', o.etiqueta.padEnd(9), o.tag.slice(0, 24).padEnd(24), 'border=', o.border.padEnd(30), 'shadow=', o.shadow, o.box);
await ctx.close(); await b.close();
