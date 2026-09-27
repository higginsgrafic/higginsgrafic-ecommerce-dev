import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const res = {};
  for (const [nom, sel] of [['anterior', 'button[aria-label="Anterior"]'], ['seguent', 'button[aria-label="Següent"]']]) {
    const el = v1.querySelector(sel);
    const q = el.getBoundingClientRect();
    const x = q.left + q.width / 2, y = q.top + q.height / 2;
    const top = document.elementFromPoint(x, y);
    const stack = document.elementsFromPoint(x, y).slice(0, 6).map((e) => `${e.tagName}${e.id ? '#' + e.id : ''}${e.className ? '.' + String(e.className).split(' ')[0].slice(0, 22) : ''}`);
    res[nom] = { x: +x.toFixed(0), y: +y.toFixed(0), top: top ? (top.id || top.tagName + '.' + String(top.className).split(' ')[0]) : null, stack };
  }
  const tira = v1.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  res.abans = getComputedStyle(tira).transform;
  return res;
}), null, 1));
// clic a "seguent" (baix)
const pos = await p.evaluate(() => {
  const el = document.querySelector('[data-mega-page-viewport="1"] button[aria-label="Següent"]');
  const q = el.getBoundingClientRect();
  return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
});
await p.mouse.click(pos.x, pos.y);
await p.waitForTimeout(1200);
console.log('despres del clic a SEGUENT', await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  return getComputedStyle(v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild).transform;
}));
await ctx.close();
await b.close();
