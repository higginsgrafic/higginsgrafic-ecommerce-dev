import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const bloc = document.querySelector('[data-mega-page-viewport="1"] [data-bloc-dreta-p1]');
  const capa = bloc.querySelector('div[aria-hidden="true"]');
  const cs = getComputedStyle(capa);
  const x = bloc.getBoundingClientRect();
  return { fons: cs.backgroundColor, radi: cs.borderRadius, ombra: cs.boxShadow === 'none' ? 'none' : 'si', vora: cs.borderTopWidth, clip: x.toJSON() };
});
await p.evaluate(() => {
  const el = document.querySelector('[data-mega-page-viewport="1"]');
  let pare = el.parentElement;
  while (pare && getComputedStyle(pare).transform === 'none' && pare !== document.body) pare = pare.parentElement;
  const v1 = el.getBoundingClientRect();
  const m = getComputedStyle(pare).transform.match(/matrix\(([^)]+)\)/);
  const tx = m ? Number(m[1].split(',')[4]) : 0;
  pare.style.transform = `translateX(${tx - v1.left}px)`;
});
await p.waitForTimeout(500);
const clip = await p.evaluate(() => {
  const b = document.querySelector('[data-mega-page-viewport="1"] [data-bloc-dreta-p1]').getBoundingClientRect();
  return { x: Math.max(0, Math.round(b.left) - 8), y: Math.max(0, Math.round(b.top) - 8), width: Math.round(b.width) + 16, height: Math.round(b.height) + 16 };
});
await p.screenshot({ path: `/tmp/quadrat-${w}.png`, clip });
console.log(`${w}x${h} fons=${r.fons} radi=${r.radi} ombra=${r.ombra} vora=${r.vora} -> /tmp/quadrat-${w}.png`);
await ctx.close(); await b.close();
