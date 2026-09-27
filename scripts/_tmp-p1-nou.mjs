// TEMPORAL — no es comiteja. La graella nova i el bloc de la dreta de la p1.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 200)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const info = (s, e) => {
    const el = v1?.querySelector(s);
    if (!el) return `${e}: (no hi es)`;
    const r2 = el.getBoundingClientRect();
    return `${e}: x${r2.left.toFixed(1)} y${r2.top.toFixed(1)} ${r2.width.toFixed(1)}x${r2.height.toFixed(1)}`;
  };
  const out = [];
  out.push(info('[data-graella-files-p1]', 'graella-p1'));
  out.push(info('[data-carrusel="1"]', 'carrusel'));
  out.push(info('[data-bloc-dreta-p1]', 'bloc dreta'));
  out.push(info('[data-stripe-buttonbar="bn-p1"]', 'selector'));
  out.push(info('[data-fletxes-p1]', 'fletxes'));
  const peces = [...(v1?.querySelectorAll('[data-carrusel="1"] button') || [])].slice(0, 4);
  peces.forEach((el, i) => { const r2 = el.getBoundingClientRect(); out.push(`  peca ${i}: x${r2.left.toFixed(1)} y${r2.top.toFixed(1)} ${r2.width.toFixed(1)}x${r2.height.toFixed(1)}`); });
  out.push(info('[data-stripe-visual-content="1"]', 'franja'));
  return out.join('\n');
});
console.log(r);
await ctx.close();
await b.close();
