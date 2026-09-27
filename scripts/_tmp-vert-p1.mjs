// TEMPORAL — la franja de la VISTA VERTICAL de la pagina 1 (la taula), amb la
// vista forcada. Serveix per mirar-hi el rombe (la p1 vertical porta la imatge
// de color).
import { chromium } from '@playwright/test';
const [mida, act] = process.argv.slice(2);
const [w, h] = (mida || '768x1024').split('x').map(Number);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act || 'first_contact'}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(800);
const rect = await p.evaluate(() => {
  const cand = [...document.querySelectorAll('[data-stripe-visual-content="1"]')].map((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, imgs: [...el.querySelectorAll('img')].map((i) => (i.getAttribute('src') || '').slice(0, 60)) };
  });
  return cand;
});
console.log(JSON.stringify(rect, null, 1));
const bo = rect.find((r) => r.w > 50 && r.x >= 0 && r.x < 2000);
if (bo) {
  await p.screenshot({ path: `_tmp-vertp1-${act || 'first_contact'}.png`, clip: { x: bo.x, y: bo.y, width: bo.w, height: bo.h } });
  console.log('desat _tmp-vertp1-' + (act || 'first_contact') + '.png');
}
await ctx.close();
await b.close();
