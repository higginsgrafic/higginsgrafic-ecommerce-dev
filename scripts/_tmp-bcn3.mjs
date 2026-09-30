import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1366, 768], [1024, 768], [1920, 946]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(8000);
  const r = await p.evaluate(() => {
    const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [+x.top.toFixed(1), +(x.top + x.height).toFixed(1), +x.left.toFixed(1), +x.right.toFixed(1)]; };
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    return {
      perMarcador: box(v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
      tots: [...v2.querySelectorAll('[data-stripe-buttonbar="bn"]')].map(box),
      colors: box(v2.querySelector('[data-p2-color-grid]')),
      franja: box(v2.querySelector('[data-colleccions-franja="1"]')),
      tinta: box(v2.querySelector('[data-stripe-visual-content="2"]')),
    };
  });
  console.log(`${w}x${h} marcador ${JSON.stringify(r.perMarcador)} tots ${JSON.stringify(r.tots)}`);
  console.log(`     colors ${JSON.stringify(r.colors)} franja ${JSON.stringify(r.franja)} franjaSamarretes ${JSON.stringify(r.tinta)}`);
  await ctx.close();
}
await b.close();
