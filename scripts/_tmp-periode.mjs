// TEMPORAL — no es comiteja. Valida la hipotesi del periode: desplacar TOTA la
// franja 1/14 de la seva amplada posa cada samarreta on era la seguent?
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);

const analitza = async (etiqueta) => {
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const cont = v2.querySelector('[data-stripe-visual-content="2"]');
    const ple = cont.getBoundingClientRect();
    const caselles = [...cont.querySelectorAll('div')].filter((d) => d.style.position === 'absolute' && d.style.overflow === 'hidden' && d.querySelector(':scope > img'));
    return caselles.map((d, i) => {
      const db = d.getBoundingClientRect();
      const img = d.querySelector(':scope > img');
      const ib = img.getBoundingClientRect();
      return {
        i,
        // La finestra, relativa al contenidor
        f: [+(db.left - ple.left).toFixed(2), +db.width.toFixed(2)],
        // El dibuix escalat, relatiu a la FINESTRA (aixo es el que ha de ser estable)
        imgDins: [+(ib.left - db.left).toFixed(2), +ib.width.toFixed(2)],
        src: (img.currentSrc || img.src).split('/').slice(-1)[0],
      };
    });
  });
  console.log(etiqueta, JSON.stringify(r.map((x) => [x.i, x.f[0], x.imgDins[0], x.imgDins[1]])));
  return r;
};

const abans = await analitza('abans  ');
// Desplacem el contingut una mica menys d'un periode per veure si la relacio
// finestra <-> dibuix es mante (tots dos es mouen junts).
const despres = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-stripe-visual-content="2"]');
  const ample = cont.getBoundingClientRect().width;
  cont.style.transform = `translateX(${-ample / 14}px)`;
  return ample;
});
await p.waitForTimeout(300);
console.log('amplada', despres);
const b2 = await analitza('despres');
let iguals = 0;
for (let i = 1; i < 14; i++) {
  // El dibuix de la casella i ha de caure on cau el dibuix de la casella i-1
  const d = Math.abs((b2[i].imgDins[0] - b2[i - 1].imgDins[0]));
  if (d < 0.5) iguals++;
  console.log(`  casella ${i}: imgDins ${b2[i - 1].imgDins[0]} vs ${b2[i].imgDins[0]} (d ${d.toFixed(2)})`);
}
console.log('caselles amb la mateixa posicio relativa:', iguals, 'de 13');
await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  v2.querySelector('[data-stripe-visual-content="2"]').style.transform = '';
});
await b.close();
