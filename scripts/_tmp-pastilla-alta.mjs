// TEMPORAL — la pastilla (alçada) i les vores de la tira de col·leccions.
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
    const banda = v2.querySelector('[data-colleccions-franja="1"]');
    if (!banda) return null;
    const items = [...banda.querySelectorAll('[data-colleccions-franja-item="1"]')];
    const bx = banda.getBoundingClientRect();
    const pill = items.find((i) => i.getAttribute('aria-current') === 'true');
    const ultim = items[items.length - 1];
    const primer = items[0];
    const span = (el) => el.querySelector('span').getBoundingClientRect();
    const gaps = items.slice(1).map((it, i) => +(it.getBoundingClientRect().left - items[i].getBoundingClientRect().right).toFixed(2));
    const textGaps = items.slice(1).map((it, i) => +(span(it).left - span(items[i]).right).toFixed(2));
    return {
      banda: [+bx.left.toFixed(1), +bx.right.toFixed(1), +bx.height.toFixed(2)],
      pill: pill ? [+pill.getBoundingClientRect().height.toFixed(2), +pill.getBoundingClientRect().width.toFixed(2)] : null,
      primerText: [+span(primer).left.toFixed(1), +span(primer).right.toFixed(1)],
      ultimText: [+span(ultim).left.toFixed(1), +span(ultim).right.toFixed(1)],
      gaps, textGaps,
    };
  });
  if (!r) { console.log(`${w}x${h}  COLUMNA (sense franja)  errors=${errors.length}`); await ctx.close(); continue; }
  const gmin = Math.min(...r.gaps), gmax = Math.max(...r.gaps);
  const tmin = Math.min(...r.textGaps), tmax = Math.max(...r.textGaps);
  console.log(`${w}x${h}  franja ${r.banda[0]}..${r.banda[1]} (h ${r.banda[2]})  pastilla ${r.pill ? r.pill.join(' x ') : 'n/a'}`);
  console.log(`     text FIRST ${r.primerText[0]}..${r.primerText[1]}   text MISC ${r.ultimText[0]}..${r.ultimText[1]}   (vora dreta ${r.banda[1]})`);
  console.log(`     separacions caixes ${gmin}..${gmax}  |  separacions text ${tmin}..${tmax}  errors=${errors.length}`);
  await ctx.close();
}
await b.close();
