// TEMPORAL — no es comiteja. L'amplada del dibuix de la franja (el periode del
// bucle) i l'estructura del bloc que l'ha de desplacar.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);

const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-stripe-visual-content="2"]');
  const fila = cont.closest('#stripe-guide-stripe-row');
  const img = cont.querySelector('img');
  const b2 = (e) => { const x = e.getBoundingClientRect(); return [+x.left.toFixed(2), +x.top.toFixed(2), +x.width.toFixed(2), +x.height.toFixed(2)]; };
  return {
    fila: { id: fila?.id, cls: fila?.className, box: fila ? b2(fila) : null, offsetW: fila?.offsetWidth },
    cont: { box: b2(cont), offsetW: cont.offsetWidth, fill: cont.parentElement?.className },
    avi: cont.parentElement?.parentElement ? { cls: cont.parentElement.parentElement.className, box: b2(cont.parentElement.parentElement) } : null,
    img: img ? { src: (img.currentSrc || img.src).split('/').slice(-1)[0], box: b2(img), natural: [img.naturalWidth, img.naturalHeight], cls: img.className, style: img.getAttribute('style') } : null,
    transformCont: getComputedStyle(cont).transform,
    transformPare: getComputedStyle(cont.parentElement).transform,
    mascara: getComputedStyle(cont).clipPath,
    // Les caselles de la capa de dibuixos
    caselles: [...cont.querySelectorAll('div')].filter((d) => d.style.position === 'absolute' && d.style.overflow === 'hidden' && d.querySelector(':scope > img')).length,
    fills: [...cont.children].map((x) => x.tagName + '.' + String(x.className).split(' ')[0]),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
