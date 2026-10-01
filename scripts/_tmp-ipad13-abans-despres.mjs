// 03/10/2026 — Petjada de les vistes per treballar nome s l'iPad Pro 13.
//
// En Marc: «Comencem les adaptacions amb l'iPad Pro 13. Nome s treballarem sobre
// aquesta vista. Cap altra s'ha de veure afectada». Aquest script mesura una
// petjada curta de cada vista (les peces del megaslide i les de la pagina) i la
// imprimeix en una linia per vista: abans i despres d'un canvi, `diff` ha de
// ensenyar NOME S les linies de l'iPad Pro 13.
import { chromium } from '@playwright/test';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const VISTES = [
  { nom: 'iPad Pro 13 vertical', w: 1032, h: 1304 },
  { nom: 'iPad Pro 13 apaissada', w: 1376, h: 954 },
  { nom: 'Model 1180x780', w: 1180, h: 780 },
  { nom: 'Model 1200x820', w: 1200, h: 820 },
  { nom: 'iPad 10.2 apaisada', w: 1024, h: 690 },
  { nom: 'iPad Air 11 apaisada', w: 1180, h: 742 },
  { nom: 'Portatil 1280', w: 1280, h: 666 },
  { nom: 'iPad Air 13 apaisada', w: 1366, h: 946 },
  { nom: 'iPad mini 6 vertical', w: 744, h: 1061 },
  { nom: 'iPad 10.2 vertical', w: 768, h: 952 },
  { nom: 'iPad Air 13 vertical', w: 1024, h: 1294 },
  { nom: 'Portatil 1440', w: 1440, h: 900 },
  { nom: 'Escriptori 1920', w: 1920, h: 1080 },
];

const r2 = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : null);
const b = await chromium.launch();
for (const v of VISTES) {
  const ctx = await b.newContext({ viewport: { width: v.w, height: v.h }, hasTouch: v.w < 1500 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 60)));
  await p.goto(`${BASE}/nova/inici?active=first_contact&carril=1`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(7000);
  const m = await p.evaluate(async () => {
    const cal = await import('/src/config/stripeCalibrations.js');
    const model = await import('/src/utils/layoutModel.js');
    const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.top), Math.round(x.width), Math.round(x.height)]; };
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const pg = v1.getBoundingClientRect();
    const rel = (el) => { const x = el?.getBoundingClientRect(); return x ? [Math.round(x.left - pg.left), Math.round(x.top), Math.round(x.width), Math.round(x.height)] : null; };
    const rd = (n) => Math.round(n * 10) / 10;
    const cossos = (el) => { const x = el?.getBoundingClientRect(); if (!x) return null; const l = x.left + cal.FRACCIO_MARGE_ESQUERRE_FRANJA * x.width; return [rd(l), rd(l + cal.FRACCIO_COSSOS_FRANJA * x.width)]; };
    return {
      versio: model.versioMegaslide(),
      carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
      escala: getComputedStyle(document.documentElement).getPropertyValue('--hg-escala-mega').trim(),
      panell: q(document.querySelector('[data-mega-panel-surface]')),
      p1bloc: rel(v1.querySelector('[data-bloc-dreta-p1]')),
      p1franja: cossos(v1.querySelector('[data-stripe-visual-content="1"]') && null),
      p2sel: q(v2?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"], [data-p2-color-selector] [data-stripe-buttonbar="bn-p1"]')),
      p2graella: q(v2?.querySelector('[data-carrusel="1"]')),
      p2colors: q(document.querySelector('[data-p2-color-grid]')),
      p2col: q(document.querySelector('[data-colleccions-franja="1"], [data-colleccions-columna="1"]')),
      p2franja: cossos(document.querySelector('[data-stripe-visual-content="2"]')),
      cadenat: q(document.querySelector('img[src*="cadenat"]')),
      icones: (() => {
        const wrap = document.querySelector('[data-icons-wrap="true"]');
        if (!wrap) return null;
        const dins = [...wrap.children];
        const ultim = dins[dins.length - 1];
        const gl = ultim?.querySelector('svg,img') || ultim;
        return { grup: [rd(wrap.getBoundingClientRect().left), rd(wrap.getBoundingClientRect().right)], dibuixDreta: gl ? rd(gl.getBoundingClientRect().right) : null };
      })(),
      fletxes: document.querySelectorAll('[data-fletxes-p1="1"]').length,
    };
  });
  console.log(`${v.nom.padEnd(26)} versio=${String(m.versio || '-').padEnd(14)} carril=${String(m.carril).padEnd(6)} esc=${String(m.escala).padEnd(7)} panell=${JSON.stringify(m.panell)} p1bloc=${JSON.stringify(m.p1bloc)} p2sel=${JSON.stringify(m.p2sel)} graella=${JSON.stringify(m.p2graella)} colors=${JSON.stringify(m.p2colors)} col=${JSON.stringify(m.p2col)} cintura=${JSON.stringify(m.p2franja)} cadenat=${JSON.stringify(m.cadenat)} icones=${JSON.stringify(m.icones)} fletxes=${m.fletxes}${errs.length ? ' ERR' : ''}`);
  await ctx.close();
}
await b.close();
