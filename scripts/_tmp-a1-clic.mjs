// TEMPORAL — no es comiteja. A1: el selector unic canvia de colleccio al clic.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const nom = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const act = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') === 'true');
  return act ? (act.textContent || '').trim() : null;
});
console.log('actiu abans:', await nom());
const box = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const ts = [...v2.querySelectorAll('[data-colleccions-targeta]')];
  const r = ts[0].getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top, h: r.height };
});
// clic a la franja 9 (MISCEL·LÀNIA)
await p.mouse.click(box.x, box.y + box.h * 8.5);
await p.waitForTimeout(2500);
console.log('actiu despres del clic a la franja 9:', await nom());
// clic a la franja 3 (PEMBERLEY)
await p.mouse.click(box.x, box.y + box.h * 2.5);
await p.waitForTimeout(2500);
console.log('actiu despres del clic a la franja 3:', await nom());
await ctx.close();
await b.close();
