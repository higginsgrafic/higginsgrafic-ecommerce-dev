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
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1]');
  const sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const emb = v1.querySelector('[data-pastilla-p1]');
  const pas = emb ? emb.querySelector('span[aria-hidden="true"]') : null;
  const m = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { x: +x.left.toFixed(1), fi: +x.right.toFixed(1), w: +x.width.toFixed(1), y: +x.top.toFixed(1), h: +x.height.toFixed(2) }; };
  return { bloc: m(bloc), selector: m(sel), embolcall: m(emb), pastilla: m(pas) };
});
console.log(`${w}x${h}`, JSON.stringify(r));
await p.evaluate(() => {
  const el = document.querySelector('[data-mega-page-viewport="1"]');
  let pare = el.parentElement;
  while (pare && getComputedStyle(pare).transform === 'none' && pare !== document.body) pare = pare.parentElement;
  const v1 = el.getBoundingClientRect();
  const mm = getComputedStyle(pare).transform.match(/matrix\(([^)]+)\)/);
  const tx = mm ? Number(mm[1].split(',')[4]) : 0;
  pare.style.transform = `translateX(${tx - v1.left}px)`;
});
await p.waitForTimeout(500);
const clip = await p.evaluate(() => {
  const b = document.querySelector('[data-mega-page-viewport="1"] [data-bloc-dreta-p1]').getBoundingClientRect();
  return { x: Math.max(0, Math.round(b.left) - 8), y: Math.max(0, Math.round(b.top) - 8), width: Math.round(b.width) + 16, height: Math.round(b.height) + 16 };
});
await p.screenshot({ path: `/tmp/migquadrat-${w}.png`, clip });
await ctx.close(); await b.close();
