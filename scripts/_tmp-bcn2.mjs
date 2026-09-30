// TEMPORAL — quina caixa es `[data-p2-color-selector]` i on cau el cul del B/C/N.
import { chromium } from '@playwright/test';
const VISTES = [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1024, 768]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { t: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), l: +x.left.toFixed(1), r: +x.right.toFixed(1) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const marc = v2.querySelector('[data-p2-color-selector]');
      const blanc = [...v2.querySelectorAll('button')].find((b) => (b.textContent || '').trim().toUpperCase() === 'BLANC');
      let el = blanc, caixa = null;
      while (el && el !== v2) {
        const cs = getComputedStyle(el);
        if (parseFloat(cs.borderTopWidth) > 0 && el.getBoundingClientRect().width > 40) { caixa = el; break; }
        el = el.parentElement;
      }
      return { marc: box(marc), marcTag: marc ? marc.tagName + '.' + (marc.className || '') : null, caixa: box(caixa), colors: box(v2.querySelector('[data-p2-color-grid]')), franjaCol: box(v2.querySelector('[data-colleccions-franja="1"]')) };
    });
    console.log(`${w}x${h} marc ${JSON.stringify(r.marc)} ${r.marcTag}`);
    console.log(`     caixa ${JSON.stringify(r.caixa)}  colors.b ${r.colors.b}  franjaCol ${JSON.stringify(r.franjaCol)}`);
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0]}`); } finally { await ctx.close(); }
}
await b.close();
