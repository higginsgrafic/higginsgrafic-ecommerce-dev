// MESURA DE LES DUES PECES DEL BLOC DE LA P1 A 1024 (02/10/2026).
//
// En Marc: «Pero ara hi ha les fletxes i els enllacos del selector dins de la
// mateixa franja i jo els vull separats». Aquest script mesura, a 1024:
//
//   - la capa de la caixa del bloc (fill 0) i les seves mesures de fons;
//   - l'ombra de la maniga (la capa de 939 px);
//   - les DUES peces (fletxes i selector): caixa de cadascuna i separacio.
//
// Tambe desa una captura de la zona del bloc per mirar-ho amb els ulls.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1024, height: 768 } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1]');
  const q = (el) => {
    const r = el.getBoundingClientRect();
    return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
  };
  const capaCaixa = bloc.children[0];
  const capaBotons = bloc.children[1];
  const peces = [...capaBotons.children].map((el) => {
    const cs = getComputedStyle(el);
    return { ...q(el), bg: cs.backgroundColor, ombra: cs.boxShadow !== 'none' };
  });
  const fills = [...bloc.querySelectorAll('*')].map((el, i) => {
    const cs = getComputedStyle(el);
    if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && cs.boxShadow === 'none') return null;
    return `fill${i} ${el.tagName.toLowerCase()} ${cs.backgroundColor} ombra=${cs.boxShadow !== 'none'} ${JSON.stringify(q(el))}`;
  }).filter(Boolean);
  return {
    bloc: q(bloc),
    capaCaixa: { ...q(capaCaixa), bg: getComputedStyle(capaCaixa).backgroundColor, ombra: getComputedStyle(capaCaixa).boxShadow !== 'none' },
    capaBotons: q(capaBotons),
    peces,
    fills,
  };
});
console.log(JSON.stringify(r, null, 1));
const bloc = await p.locator('[data-mega-page-viewport="1"] [data-bloc-dreta-p1]').boundingBox();
if (bloc) {
  await p.screenshot({
    path: '_tmp-franja-peces-abans.png',
    clip: {
      x: Math.max(0, bloc.x - 20),
      y: Math.max(0, bloc.y - 200),
      width: Math.min(1024, bloc.width + 40),
      height: bloc.height + 260,
    },
  });
}
await b.close();
