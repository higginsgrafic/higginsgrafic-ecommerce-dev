// TEMPORAL — el coixi de la pastilla del selector B/C/N (10 px per costat).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1366, 768], [1024, 768]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(7000);
  const r = await p.evaluate(() => {
    const mesura = (caixa, pill) => {
      if (!caixa || !pill) return null;
      const c = caixa.getBoundingClientRect(), s = pill.getBoundingClientRect();
      return {
        caixa: [+c.width.toFixed(1), +c.height.toFixed(1)],
        pill: [+s.width.toFixed(1), +s.height.toFixed(1)],
        costats: [+(s.left - c.left).toFixed(1), +(c.right - s.right).toFixed(1)],
        daltBaix: [+(s.top - c.top).toFixed(1), +(c.bottom - s.bottom).toFixed(1)],
      };
    };
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const bcn2 = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const bcn1 = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
    const troba = (root, caixa) => {
      const spans = [...root.querySelectorAll('span[aria-hidden="true"]')];
      return spans.find((s) => s.getBoundingClientRect().width > 0 && caixa && s.getBoundingClientRect().width < caixa.getBoundingClientRect().width);
    };
    return {
      p2: mesura(bcn2, troba(v2, bcn2)),
      p1: mesura(bcn1, troba(v1, bcn1)),
    };
  });
  console.log(`${w}x${h}  p2 ${JSON.stringify(r.p2)}`);
  console.log(`   p1 ${JSON.stringify(r.p1)}  errors=${errors.length}`);
  await ctx.close();
}
await b.close();
