// TEMPORAL — no es coiteja. La p1: la capa de la franja, el bloc de la dreta i
// qui guanya a la zona on es trepitgen (la maniga).
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
  const franja = v1.querySelector('[data-stripe-visual-content="1"]');
  const capaFranja = franja.closest('div[style*="z-index"]') || franja.parentElement;
  const bloc = v1.querySelector('[data-bloc-dreta-p1="1"]');
  const sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const cadena = (el, nom) => {
    const out = [];
    let x = el;
    while (x && x !== document.body) {
      const cs = getComputedStyle(x);
      out.push(`${x.tagName}${x.id ? '#' + x.id : ''} z=${cs.zIndex} pos=${cs.position} pe=${cs.pointerEvents}`);
      x = x.parentElement;
    }
    return { nom, out: out.slice(0, 6) };
  };
  const q = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
  return {
    franja: q(franja),
    capaFranja: q(capaFranja),
    bloc: q(bloc), selector: q(sel),
    zFranja: cadena(franja, 'franja'),
    zBloc: cadena(bloc, 'bloc'),
    // La zona on es trepitgen: x1399..1405, y250
    qui: (() => { const el = document.elementFromPoint(1402, 250); return el ? `${el.tagName}${el.id ? '#' + el.id : ''}.${String(el.className).split(' ').slice(0, 2).join('.')}` : null; })(),
  };
}), null, 1));
await ctx.close();
await b.close();
