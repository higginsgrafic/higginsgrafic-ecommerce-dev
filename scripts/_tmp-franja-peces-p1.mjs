// MESURA DEL BLOC DE LA P1 AMB LA PAGINA 1 AL DAVANT (02/10/2026).
//
// En Marc: «Pero ara hi ha les fletxes i els enllacos del selector dins de la
// mateixa franja i jo els vull separats». Aquest script obre el megaslide a la
// PAGINA 1 (clic al nom de la colleccio del header, que es qui posa
// `megaPage=1`), mesura la capa de la caixa, l'ombra de la maniga i les DUES
// peces, i desa una captura de la zona del bloc.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const w = Number(process.argv[2] || 1024), h = Number(process.argv[3] || 768);
const etiqueta = process.argv[4] || 'abans';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
p.on('console', (m) => { if (m.type() === 'error') errors.push(`consola: ${m.text().slice(0, 140)}`); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
// AMB `?active=first_contact` EL PANELL JA NEIX OBERT A LA PAGINA 1 (mesurat:
// vista 1 a x0 i `First Contact=true`). Nomes cal esperar que acabi de
// muntar-se: clicar el nav el TANCARIA (es el commutador).
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v1x = v1.getBoundingClientRect().left;
  const v1y = v1.getBoundingClientRect().top;
  const bloc = v1.querySelector('[data-bloc-dreta-p1]');
  const rel = (el) => {
    if (!el) return null;
    const q = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      x: +(q.left - v1x).toFixed(1),
      y: +(q.top - v1y).toFixed(1),
      w: +q.width.toFixed(1),
      h: +q.height.toFixed(1),
      bg: cs.backgroundColor,
      ombra: cs.boxShadow !== 'none',
    };
  };
  const capaCaixa = bloc.children[0];
  const capaBotons = bloc.children[1];
  const fills = [...bloc.querySelectorAll('*')].map((el, i) => {
    const cs = getComputedStyle(el);
    if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && cs.boxShadow === 'none') return null;
    const q = el.getBoundingClientRect();
    return `fill${i} ${el.tagName.toLowerCase()} ${cs.backgroundColor} ombra=${cs.boxShadow !== 'none'} x${(q.left - v1x).toFixed(1)} y${(q.top - v1y).toFixed(1)} ${q.width.toFixed(1)}x${q.height.toFixed(1)}`;
  }).filter(Boolean);
  return {
    vista1x: +v1x.toFixed(1),
    bloc: rel(bloc),
    capaCaixa: rel(capaCaixa),
    capaBotons: rel(capaBotons),
    peces: [...capaBotons.children].map(rel),
    franja1: rel(v1.querySelector('[data-stripe-visual-content="1"]')),
    fills,
  };
});
console.log(`${w}x${h} [${etiqueta}]`);
console.log(JSON.stringify(r, null, 1));
writeFileSync(`_tmp-franja-peces-${etiqueta}-${w}.json`, JSON.stringify(r, null, 1));
const bloc = await p.locator('[data-mega-page-viewport="1"] [data-bloc-dreta-p1]').boundingBox();
const franja = await p.locator('[data-mega-page-viewport="1"] [data-stripe-visual-content="1"]').boundingBox();
if (bloc) {
  const x0 = Math.max(0, Math.min(bloc.x, franja ? franja.x : bloc.x) - 30);
  const y0 = Math.max(0, Math.min(bloc.y, franja ? franja.y : bloc.y) - 30);
  const x1 = Math.min(w, Math.max(bloc.x + bloc.width, franja ? franja.x + franja.width : 0) + 30);
  const y1 = Math.min(h, Math.max(bloc.y + bloc.height, franja ? franja.y + franja.height : 0) + 30);
  await p.screenshot({ path: `_tmp-franja-peces-${etiqueta}-${w}.png`, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } });
  console.log(`captura _tmp-franja-peces-${etiqueta}-${w}.png`);
}
console.log('errors=', errors.length, errors.slice(0, 3));
await ctx.close();
await b.close();
