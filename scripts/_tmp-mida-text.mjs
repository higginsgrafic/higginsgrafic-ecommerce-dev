// TEMPORAL — no es comiteja. La mida del text del selector i de la columna.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const selBtn = [...v2.querySelectorAll('[data-p2-color-selector] [data-stripe-buttonbar="bn"] button[aria-label]')].find((x) => x.getAttribute('aria-label') === 'Blanc');
  const selSpan = selBtn?.querySelector('span');
  const colAct = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') === 'true');
  const colSpan = colAct?.querySelector('span');
  const colAlt = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') !== 'true');
  const m = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const q = el.getBoundingClientRect();
    return { font: cs.fontFamily.slice(0, 40), size: cs.fontSize, weight: cs.fontWeight, tt: cs.textTransform, w: +q.width.toFixed(1), h: +q.height.toFixed(1), lh: cs.lineHeight };
  };
  return { selectorBlanc: m(selSpan), colActiu: m(colSpan), colAltre: m(colAlt?.querySelector('span')), colAmple: m(colAct) };
}), null, 1));
await ctx.close();
await b.close();
