// TEMPORAL (28/09/2026): LA RADIOGRAFIA DEL TROS DE DALT DE L'INICI.
//
// En Marc vol la hero amb el baix a 50 px del bottom del viewport, com el bloc
// de la PDP. Aquest guio diu d'on surt la posicio d'ara: les variables de CSS
// que la governen, les dues cel·les del `MarcInici` i la caixa de la hero, amb
// el megaslide TANCAT i OBERT (la linia del megaslide canvia la zona).
//
// Us: node scripts/_tmp-hero-pdp-situacio.mjs --radiografia
import { chromium } from '@playwright/test';

const INICI = 'http://127.0.0.1:3003/nova/inici?active=first_contact';
const MIDA = { width: 1920, height: 946 };

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: MIDA, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(INICI, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);

const radiografia = async (etiqueta) => {
  const d = await p.evaluate(() => {
    const R = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return `${+r.top.toFixed(1)}..${+r.bottom.toFixed(1)} (${+r.height.toFixed(1)})`;
    };
    const arrel = document.documentElement;
    const cs = getComputedStyle(arrel);
    const nou = document.querySelector('[data-inici-nou="1"]');
    const taula = document.querySelector('[data-taula-inici="1"]');
    const cella1 = document.querySelector('[data-cella="1"]');
    const cella2 = document.querySelector('[data-cella="2"]');
    const caixa = document.querySelector('[data-hero-caixa="1"]');
    const vh = window.innerHeight;
    const rc = caixa ? caixa.getBoundingClientRect() : null;
    return {
      vh,
      vw: window.innerWidth,
      vars: {
        appHeaderOffset: cs.getPropertyValue('--appHeaderOffset').trim(),
        'hg-mega-bottom': cs.getPropertyValue('--hg-mega-bottom').trim(),
        'inici-nou-carril': cs.getPropertyValue('--inici-nou-carril').trim(),
        'mega-bottom-ample': cs.getPropertyValue('--hg-mega-bottom-ample').trim(),
      },
      taula: R(taula),
      taulaVars: taula ? {
        blocMega: taula.style.getPropertyValue('--inici-bloc-mega'),
        blocPagina: taula.style.getPropertyValue('--inici-bloc-pagina'),
        frontera: taula.style.getPropertyValue('--inici-frontera'),
      } : null,
      cella1: R(cella1),
      cella2: R(cella2),
      cella2Justify: cella2 ? getComputedStyle(cella2).justifyContent : null,
      heroCaixa: R(caixa),
      heroAlcada: rc ? +rc.height.toFixed(1) : null,
      baixDelViewport: rc ? +(vh - rc.bottom).toFixed(1) : null,
      megaslideAlDOM: !!document.querySelector('[data-mega-page-viewport="1"]'),
    };
  });
  console.log(`\n───── ${etiqueta} ─────`);
  console.log('  viewport          ', d.vw + 'x' + d.vh);
  console.log('  variables         ', JSON.stringify(d.vars));
  console.log('  taula inici       ', d.taula, '  ', JSON.stringify(d.taulaVars));
  console.log('  cella 1 (mega)    ', d.cella1);
  console.log('  cella 2 (pagina)  ', d.cella2, ' justify:', d.cella2Justify);
  console.log('  hero caixa        ', d.heroCaixa);
  console.log('  BAIX DEL VIEWPORT ', d.baixDelViewport, 'px');
  console.log('  megaslide al DOM  ', d.megaslideAlDOM);
  return d;
};

await radiografia('MEGASLIDE TANCAT (tal com carrega)');
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
await radiografia('MEGASLIDE OBERT');

await ctx.close();
await b.close();
