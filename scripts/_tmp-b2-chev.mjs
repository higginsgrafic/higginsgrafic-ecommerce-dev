import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
// Forcem la pagina 1 al davant per mesurar les fletxes.
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1="1"]');
  const sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const fl = v1.querySelector('[data-fletxes-p1="1"]');
  const svgs = [...fl.querySelectorAll('svg')].map((s) => { const q = s.getBoundingClientRect(); return { cy: +(q.top + q.height / 2).toFixed(1), cx: +(q.left + q.width / 2).toFixed(1), cls: String(s.getAttribute('class')).slice(0, 60) }; });
  const boto = (l) => { const e = fl.querySelector(`button[aria-label="${l}"]`); const q = e.getBoundingClientRect(); return { y: +q.top.toFixed(1), h: +q.height.toFixed(1), cy: +(q.top + q.height / 2).toFixed(1) }; };
  const f = v1.querySelector('[data-stripe-visual-content="1"]').getBoundingClientRect();
  return { bloc: { y: +bloc.getBoundingClientRect().top.toFixed(1), h: +bloc.getBoundingClientRect().height.toFixed(1) }, sel: { y: +sel.getBoundingClientRect().top.toFixed(1), h: +sel.getBoundingClientRect().height.toFixed(1) }, fletxes: { y: +fl.getBoundingClientRect().top.toFixed(1), h: +fl.getBoundingClientRect().height.toFixed(1) }, svgs, prev: boto('Anterior'), next: boto('Següent'), franja: { y: +f.top.toFixed(1), b: +f.bottom.toFixed(1) } };
}), null, 1));
await ctx.close();
await b.close();
