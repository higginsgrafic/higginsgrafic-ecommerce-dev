// TEMPORAL — no es coiteja. La pagina 1: quins elements clickables queden tapats
// per la capa de la franja (o per qualsevol altra capa), i on.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
// La pagina 1 al davant
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const dx = -v1.getBoundingClientRect().left;
  const capa = (el) => {
    const q = el.getBoundingClientRect();
    return { x: Math.round(q.left), r: Math.round(q.right), y: +q.top.toFixed(1), b: +q.bottom.toFixed(1), w: Math.round(q.width), h: Math.round(q.height) };
  };
  // Els elements clickables de la p1
  const clickables = [
    ['graella (botons)', [...v1.querySelectorAll('[data-carrusel="1"] button')]],
    ['selector B/C/N', [...v1.querySelectorAll('[data-stripe-buttonbar="bn-p1"] button')]],
    ['fletxes', [...v1.querySelectorAll('[data-fletxes-p1="1"] button')]],
  ];
  const resultat = [];
  for (const [nom, els] of clickables) {
    let tapats = 0;
    const exemples = [];
    for (const el of els.slice(0, 400)) {
      const q = el.getBoundingClientRect();
      if (q.width === 0 || q.height === 0) continue;
      const x = q.left + q.width / 2, y = q.top + q.height / 2;
      const top = document.elementFromPoint(x, y);
      const esMeu = el === top || el.contains(top) || (top && top.contains(el));
      if (!esMeu) {
        tapats += 1;
        if (exemples.length < 3) exemples.push({ qui: top ? `${top.tagName}${top.id ? '#' + top.id : ''}.${String(top.className).split(' ').slice(0, 2).join('.')}` : null, x: Math.round(x), y: Math.round(y) });
      }
    }
    resultat.push({ nom, total: els.length, tapats, exemples });
  }
  // La capa de la franja i el bloc de la dreta
  return {
    capaFranjaP1: (() => { const e = v1.querySelector('[data-stripe-visual-content="1"]'); return e ? capa(e) : null; })(),
    filaFranjaP1: (() => { const e = v1.querySelector('[id^="stripe-guide-stripe-row-p1"]'); return e ? capa(e) : null; })(),
    blocDreta: (() => { const e = v1.querySelector('[data-bloc-dreta-p1="1"]'); return e ? capa(e) : null; })(),
    resultat,
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
