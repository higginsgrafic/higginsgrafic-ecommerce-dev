// TEMPORAL — captura la franja de la P1 (forçant la vista 1) amb les capes
// separades: 'ple' (tot), 'tinta' (nomes la imatge), 'vel' (nomes el vel),
// 'dibuix' (nomes els dibuixos).
import { chromium } from '@playwright/test';
const QUE = process.argv[2] || 'ple';
const DSF = Number(process.argv[3] || 3);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: DSF });
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
const rect = await p.evaluate(({ que }) => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const franja = v1.querySelector('[data-stripe-visual-content="1"]');
  const imgs = [...franja.querySelectorAll('img')];
  const tinta = imgs.find((i) => /stripe\.(webp|png)/.test(i.getAttribute('src') || ''));
  const vel = imgs.find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  const capa = v1.querySelector('[data-stripe-drawing-layer]')
    || [...franja.querySelectorAll('div')].find((d) => {
      const cs = getComputedStyle(d);
      const cp = cs.clipPath || cs.webkitClipPath || 'none';
      return cp !== 'none' && d.querySelector('img');
    })
    || (v1.querySelector('[data-stripe-tile]') ? v1.querySelector('[data-stripe-tile]').parentElement : null);
  if (que === 'vel') { if (tinta) tinta.style.visibility = 'hidden'; if (capa) capa.style.visibility = 'hidden'; }
  if (que === 'dibuix') { if (tinta) tinta.style.visibility = 'hidden'; if (vel) vel.style.visibility = 'hidden'; }
  if (que === 'tinta') { if (vel) vel.style.visibility = 'hidden'; if (capa) capa.style.visibility = 'hidden'; }
  const r = franja.getBoundingClientRect();
  return {
    x: r.left, y: r.top, width: r.width, height: r.height,
    imgs: imgs.map((i) => ({ src: (i.getAttribute('src') || '').slice(0, 70), z: getComputedStyle(i).zIndex })),
    teTinta: !!tinta, teVel: !!vel, teCapa: !!capa,
  };
}, { que: QUE });
console.log(JSON.stringify(rect, null, 1));
await p.waitForTimeout(300);
await p.screenshot({ path: `_tmp-p1capes-${QUE}.png`, clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } });
console.log(`desat _tmp-p1capes-${QUE}.png`);
await ctx.close();
await b.close();
