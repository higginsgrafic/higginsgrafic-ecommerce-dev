// TEMPORAL — no es coiteja. La p1: els elements VISIBLES de la graella i del
// bloc de la dreta, i qui els tapa (nomes compten els de dins la finestra).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const dinsFinestra = (q) => q.width > 0 && q.height > 0 && q.left >= 0 && q.right <= window.innerWidth && q.top >= 0 && q.bottom <= window.innerHeight;
  const grups = [
    ['graella', [...v1.querySelectorAll('[data-carrusel="1"] button')]],
    ['selector', [...v1.querySelectorAll('[data-stripe-buttonbar="bn-p1"] button')]],
    ['fletxes', [...v1.querySelectorAll('[data-fletxes-p1="1"] button')]],
  ];
  const out = [];
  for (const [nom, els] of grups) {
    let visibles = 0, tapats = 0;
    const exemples = [];
    for (const el of els) {
      const q = el.getBoundingClientRect();
      if (!dinsFinestra(q)) continue;
      if (q.left < 381 || q.right > 1524) continue;
      visibles += 1;
      const x = q.left + q.width / 2, y = q.top + q.height / 2;
      const top = document.elementFromPoint(x, y);
      const esMeu = el === top || el.contains(top) || (top && top.contains(el));
      if (!esMeu) {
        tapats += 1;
        if (exemples.length < 6) { const tq = top.getBoundingClientRect(); exemples.push({ qui: top ? `${top.tagName}${top.id ? '#' + top.id : ''}.${String(top.className).split(' ').slice(0, 3).join('.')} pe=${getComputedStyle(top).pointerEvents} z=${getComputedStyle(top).zIndex}` : 'FORA', capa: [Math.round(tq.left), Math.round(tq.top), Math.round(tq.width), Math.round(tq.height)], x: Math.round(x), y: Math.round(y), el: (el.getAttribute('aria-label') || el.getAttribute('title') || '').slice(0, 20) }); }
      }
    }
    out.push({ nom, visibles, tapats, exemples });
  }
  return out;
}), null, 1));
await ctx.close();
await b.close();
