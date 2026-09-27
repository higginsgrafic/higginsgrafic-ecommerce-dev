// TEMPORAL — no es comiteja. Al selector, un acabat que la colleccio no te surt
// desactivat (visible) o amagat?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const estat = () => p.evaluate(() => {
  const sel = document.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  if (!sel) return null;
  return [...sel.querySelectorAll('button')].map((x) => ({
    nom: x.getAttribute('aria-label'),
    desactivat: x.disabled,
    aria: x.getAttribute('aria-disabled'),
    color: getComputedStyle(x.querySelector('span')).color,
    cursor: getComputedStyle(x).cursor,
  }));
});
for (const col of ['FIRST CONTACT', 'CUBE']) {
  if (col !== 'FIRST CONTACT') {
    const t = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === n) || null, col);
    const bb = await t.asElement().boundingBox();
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await p.waitForTimeout(1500);
  }
  console.log('---', col);
  for (const x of await estat()) console.log(`   ${String(x.nom).padEnd(7)} desactivat=${String(x.desactivat).padEnd(6)} aria=${String(x.aria).padEnd(5)} color=${x.color.padEnd(20)} cursor=${x.cursor}`);
}
await b.close();
