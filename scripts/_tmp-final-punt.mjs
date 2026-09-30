// TEMPORAL — el final de les dues pastilles, a totes les mides.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1180, 820], [1024, 768]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(8000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const bcn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const banda = v2.querySelector('[data-colleccions-franja="1"]');
    const pillBcn = [...v2.querySelectorAll('span[aria-hidden="true"]')].find((s) => s.getBoundingClientRect().width > 10 && s.getBoundingClientRect().width < bcn.getBoundingClientRect().width + 1);
    const pillBanda = banda ? banda.querySelector('[aria-current="true"]') : null;
    const c = bcn.getBoundingClientRect();
    const s = pillBcn.getBoundingClientRect();
    return {
      bcnCaixa: [+c.left.toFixed(1), +c.right.toFixed(1), +c.width.toFixed(1), +c.height.toFixed(1)],
      bcnPill: [+s.left.toFixed(1), +s.right.toFixed(1), +s.width.toFixed(1), +s.height.toFixed(1)],
      coixos: [+(s.left - c.left).toFixed(1), +(c.right - s.right).toFixed(1)],
      tiraPill: pillBanda ? [+pillBanda.getBoundingClientRect().left.toFixed(1), +pillBanda.getBoundingClientRect().right.toFixed(1), +pillBanda.getBoundingClientRect().width.toFixed(1)] : null,
    };
  });
  const dif = r.tiraPill ? (r.tiraPill[1] - r.bcnPill[1]).toFixed(1) : 'n/a';
  console.log(`${w}x${h}  caixa ${r.bcnCaixa[2]}x${r.bcnCaixa[3]}  pastillaBcn ${r.bcnPill[2]}x${r.bcnPill[3]} (coixos ${r.coixos.join('/')})  pastillaTira ${r.tiraPill ? r.tiraPill[2] : 'n/a'}  -> finals: ${r.bcnPill[1]} vs ${r.tiraPill ? r.tiraPill[1] : 'n/a'} (dif ${dif})  errors=${errors.length}`);
  await ctx.close();
}
await b.close();
