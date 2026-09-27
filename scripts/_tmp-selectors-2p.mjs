// TEMPORAL — no es comiteja. La forma del selector de cada pagina.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const info = (el, e) => {
    if (!el) return `${e}: (no hi es)`;
    const r2 = el.getBoundingClientRect();
    return `${e}: x${r2.left.toFixed(1)} y${r2.top.toFixed(1)} ${r2.width.toFixed(1)}x${r2.height.toFixed(1)} (aspecte ${(r2.width / r2.height).toFixed(2)}) classe "${String(el.className).slice(0, 60)}"`;
  };
  const out = [];
  for (const [nom, sel] of [['P1', '[data-mega-page-viewport="1"]'], ['P2', '[data-mega-page-viewport="2"]']]) {
    const v = document.querySelector(sel);
    const bn = v?.querySelector('[data-stripe-buttonbar="bn"]');
    out.push(`=== ${nom}`);
    out.push('  ' + info(bn, 'pastilla'));
    out.push('  ' + info(bn?.querySelector('button[aria-label="Blanc"]'), '  boto Blanc'));
    out.push('  ' + info(bn?.querySelector('button[aria-label="Color"]'), '  boto Color'));
    out.push('  ' + info(bn?.querySelector('button[aria-label="Negre"]'), '  boto Negre'));
    out.push('  ' + info(bn?.parentElement, '  pare'));
    // L'estil en línia de la pastilla (el que decideix la forma)
    out.push('  style: ' + String(bn?.getAttribute('style') || '').slice(0, 260));
  }
  return out.join('\n');
});
console.log(r);
await ctx.close();
await b.close();
