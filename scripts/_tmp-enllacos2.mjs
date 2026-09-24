// TEMPORAL — no es comita. Les Y dels enllacos i del selector.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const mida of ['2560x1440', '1920x946', '1440x900', '1366x768']) {
  const [w, h] = mida.split('x').map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w <= 1366 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?carril=1', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => {
    const v = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [+b.top.toFixed(1), +b.bottom.toFixed(1), +b.height.toFixed(1)]; };
    const linia = document.querySelector('[data-colleccions-linia="1"]');
    const sel = document.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const tira = [...document.querySelectorAll('div')].find((d) => d.style && d.style.width && d.style.width.endsWith('px') && d.querySelectorAll('button').length > 8 && getComputedStyle(d).transform.startsWith('matrix'));
    const retall = tira ? tira.parentElement : null;
    const graella = linia ? linia.closest('div[style*="grid"]') : null;
    return { linia: v(linia), selector: v(sel), retall: v(retall), graella: v(graella), llista: v(document.querySelector('[data-colleccions-caixes="1"]')) };
  });
  const dif = r.selector && r.linia ? +(r.selector[1] - r.linia[1]).toFixed(1) : null;
  console.log(mida, JSON.stringify({ ...r, selector_menys_linia: dif }));
  await ctx.close();
}
await b.close();
