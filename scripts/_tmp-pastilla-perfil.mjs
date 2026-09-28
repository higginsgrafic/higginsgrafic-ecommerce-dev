// TEMPORAL (28/09/2026): EL PERFIL DE LA VORA ESQUERRA DE LA PASTILLA BLANCA.
//
// Serveix per comprovar l'ENCARREC: a la p1 la pastilla blanca del selector ha
// de quedar PER SOTA de l'ombra de la maniga, com a la p2.
//
// Mesura, a 1920x946 i amb la variant COLOR activa:
//   - els requadres de la pastilla, l'ombra i el bloc/columna de cada pagina;
//   - el perfil horitzontal de la vora esquerra de la pastilla (fila del mig);
//   - el perfil VERTICAL de la tinta de l'ombra, a 3 px de la seva vora dreta;
//   - desa captures dels dos blocs i de la franja de l'ombra.
//
// La referencia de la p2 es l'ULTIMA colleccio (es l'unica fila de la columna
// que cau sota l'ombra, y229,6..342,6). Amb la primera activa la comparacio no
// vol dir res.
//
// Us: node scripts/_tmp-pastilla-perfil.mjs
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';

const URL = 'http://127.0.0.1:3003/nova/inici?active=first_contact&stripeVariant=color';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await p.goto(URL, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);

// La fila de la p2 que ha de servir de referencia es la que cau a la MATEIXA y
// que l'ombra toca. La tinta de l'ombra, a la vora dreta, va de y242 a y273: la
// fila INDEX 6 (y254,5..281,9) es la que hi cau a sobre, com la pastilla de la
// p1 (y259..291,8). Les dues ultimes files ja queden per sota de l'ombra.
const INDEX_P2 = 6;
await p.evaluate((i) => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const botons = v2?.querySelectorAll('[data-colleccions-targeta]');
  botons?.[i]?.click();
}, INDEX_P2);
await p.waitForTimeout(6000);

const RECT = () => p.evaluate(() => {
  const R = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: +r.left.toFixed(1), top: +r.top.toFixed(1),
      width: +r.width.toFixed(1), height: +r.height.toFixed(1),
      right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1),
    };
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel1 = v1?.querySelector('[data-stripe-buttonbar="bn-p1"]');
  // Des del 28/09/2026 la pastilla de la p1 NO viu dins del selector: viu a la
  // capa de la caixa, per sota de l'ombra, dins del seu embolcall.
  const past1 = v1?.querySelector('[data-pastilla-p1="1"] > span[aria-hidden="true"]')
    || sel1?.querySelector(':scope > span[aria-hidden="true"]');
  const ombra1 = v1?.querySelector('[data-maniga-ombra-p1="1"]');
  const col2 = v2?.querySelector('[data-colleccions-targeta]')?.parentElement;
  const act2 = v2?.querySelector('[data-colleccions-targeta][aria-current="true"]');
  const ombra2 = v2?.querySelector('[data-maniga-ombra="1"]');
  const cs = (el) => (el ? getComputedStyle(el) : null);
  return {
    p1Bloc: R(v1?.querySelector('[data-bloc-dreta-p1="1"]')),
    p1Selector: R(sel1),
    p1Pastilla: R(past1),
    p1Ombra: R(ombra1),
    p1PastillaZ: cs(past1)?.zIndex ?? null,
    p1PastillaPos: cs(past1)?.position ?? null,
    p1OmbraZ: cs(ombra1)?.zIndex ?? null,
    p2Columna: R(col2),
    p2Actiu: R(act2),
    p2Ombra: R(ombra2),
    p2ActiuZ: cs(act2)?.zIndex ?? null,
    p2ActiuPos: cs(act2)?.position ?? null,
    p2OmbraZ: cs(ombra2)?.zIndex ?? null,
  };
});

const gris = (png, x, y) => {
  const i = (png.width * y + x) << 2;
  return Math.round(0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]);
};

const retalla = async (nom, x, y, w, h) => {
  const clip = {
    x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)),
    width: Math.round(w), height: Math.round(h),
  };
  const buf = await p.screenshot({ clip });
  writeFileSync(`_tmp-perfil-${nom}.png`, buf);
  return PNG.sync.read(buf);
};

const perfila = async (etiqueta, pastilla, ombra, bloc) => {
  if (!pastilla || !ombra || !bloc) { console.log(`\n${etiqueta}: (falta alguna peça)`); return; }
  console.log(`\n=== ${etiqueta} ===`);
  console.log('  pastilla', JSON.stringify(pastilla));
  console.log('  ombra   ', JSON.stringify(ombra));
  console.log('  bloc    ', JSON.stringify(bloc));

  // 1) Perfil HORITZONTAL: la fila del mig de la pastilla, de 12 px abans de la
  //    seva vora esquerra fins a 40 px endins.
  const x0 = Math.round(pastilla.left) - 12;
  const y0 = Math.round(pastilla.top) - 8;
  const w = 52;
  const h = Math.round(pastilla.height) + 16;
  const png = await retalla(`${etiqueta}-pastilla`, x0, y0, w, h);
  const yMig = Math.round(pastilla.height / 2) + 8;
  const fila = [];
  for (let x = 0; x < w; x++) fila.push(gris(png, x, yMig));
  console.log('  horitzontal (x=0 es ' + x0 + '; la vora de la pastilla es x' + Math.round(pastilla.left) + '):');
  console.log('    x ' + Array.from({ length: w }, (_, i) => String(x0 + i).padStart(5)).join(''));
  console.log('    v ' + fila.map((v) => String(v).padStart(5)).join(''));

  // 2) Perfil VERTICAL de la tinta de l'ombra, 3 px a dins de la seva vora dreta
  //    visible (que es on ha de caure damunt de la pastilla).
  const xOmbra = Math.round(ombra.right) - 3;
  const yTop = Math.round(ombra.top) - 4;
  const yBot = Math.round(ombra.bottom) + 4;
  const pngV = await retalla(`${etiqueta}-ombra`, xOmbra - 2, yTop, 8, yBot - yTop);
  const vertical = [];
  for (let y = 0; y < yBot - yTop; y++) vertical.push(gris(pngV, 3, y));
  console.log(`  vertical a x${xOmbra} (y${yTop}..${yBot}):`);
  console.log('    y ' + Array.from({ length: vertical.length }, (_, i) => String(yTop + i).padStart(4)).join(''));
  console.log('    v ' + vertical.map((v) => String(v).padStart(4)).join(''));

  // 3) El bloc sencer, per mirar-los de costat.
  await retalla(`${etiqueta}-bloc`, bloc.left - 4, bloc.top - 4, bloc.width + 8, bloc.height + 8);
};

const r2 = await RECT();
console.log('=== REQUADRES DE LA P2 (font de referencia) ===');
for (const [k, v] of Object.entries(r2)) console.log(k.padEnd(14), JSON.stringify(v));
await perfila('p2', r2.p2Actiu, r2.p2Ombra, r2.p2Columna);

// LA P1, A LA PANTALLA. Quan la pagina activa es la 2, la 1 queda desplaçada
// 1905 px a l'esquerra (el contenidor del megaslide va amb `transform`), i no
// s'hi pot fer captura. Nomes per a la MESURA: es posa el contenidor a
// `translateX(0)`, que no toca ni el flux ni cap estat de l'aplicacio.
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const carril = v1?.parentElement?.parentElement;
  if (carril) { carril.dataset.perfilTransform = carril.style.transform || ''; carril.style.transform = 'translateX(0)'; }
});
await p.waitForTimeout(600);

const r1 = await RECT();
console.log('\n=== REQUADRES DE LA P1 (posada a la pantalla) ===');
for (const [k, v] of Object.entries(r1)) console.log(k.padEnd(14), JSON.stringify(v));
await perfila('p1', r1.p1Pastilla, r1.p1Ombra, r1.p1Bloc);

await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const carril = v1?.parentElement?.parentElement;
  if (carril && carril.dataset.perfilTransform !== undefined) {
    carril.style.transform = carril.dataset.perfilTransform;
    delete carril.dataset.perfilTransform;
  }
});

console.log('\n=== ERRORS DE CONSOLA ===');
console.log(errors.length ? errors.join('\n') : 'cap error');

await ctx.close();
await b.close();
