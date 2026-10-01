// 02/10/2026 — «La p2 està tallada. Falta la columna de colleccions»: es mira la
// p2 a les tauletes VERTICALS (l'iPad Pro 13 vertical es el que s'acabava de
// mirar) i tambe a l'apaissada curta, amb detector de retall.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const FORMATS = [
  { nom: 'iPad 10.2 vertical 768x952', w: 768, h: 952 },
  { nom: 'iPad Air 13 vertical 1024x1294', w: 1024, h: 1294 },
  { nom: 'iPad Pro 13 vertical 1032x1304', w: 1032, h: 1304 },
  { nom: 'Portatil 1280x586 (overlay)', w: 1280, h: 586 },
  { nom: 'Portatil 1366x634 (overlay)', w: 1366, h: 634 },
];

const b = await chromium.launch();
for (const f of FORMATS) {
  const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
  await p.goto(`${BASE}/nova/inici`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const m = await p.evaluate(async () => {
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const mod = await import('/src/utils/layoutModel.js');
    const d = mod.deviceLayoutFromViewport(window.innerWidth, window.innerHeight);
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const panell = document.querySelector('[data-mega-panel-surface]');
    const links = [...document.querySelectorAll('[data-colleccions-targeta="1"]')];
    const visibles = links.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; });
    // Quin es el primer pare que retalla el contingut de la p2.
    let e = v2?.querySelector('[data-carrusel="1"]'), retall = null;
    while (e && e !== document.body) {
      const cs = getComputedStyle(e);
      if (cs.overflow !== 'visible' || cs.overflowY !== 'visible') { retall = [e.tagName + (e.getAttribute('data-mega-page-viewport') ? ('[vp' + e.getAttribute('data-mega-page-viewport') + ']') : '') + (e.getAttribute('data-mega-panel-surface') !== null ? '[panell]' : ''), q(e), cs.overflow, cs.overflowY]; break; }
      e = e.parentElement;
    }
    const franja = document.querySelector('[data-stripe-visual-content="2"]');
    const a = franja?.getBoundingClientRect(), c = panell?.getBoundingClientRect();
    const baix = (el) => { const r = el?.getBoundingClientRect(); return r ? Math.round(r.bottom) : null; };
    return {
      classe: d.isPortraitTablet ? 'vertical' : d.isLandscapeTablet ? 'apaissada' : 'altres',
      panell: q(panell), pagina2: q(v2),
      enllacosVisibles: visibles.length, enllacosPrimers: visibles.slice(0, 2).map((x) => q(x)),
      graellaP2: q(v2?.querySelector('[data-carrusel="1"]')), franja: q(franja),
      franjaDinsPanell: a && c ? a.bottom <= c.bottom + 1 : null,
      panellBottom: baix(panell), finestra: window.innerHeight, retall,
    };
  });
  console.log(`--- ${f.nom}`, JSON.stringify(m));
  console.log('    errors', errs.slice(0, 2));
  if (f.w === 1032 || f.w === 1366) await p.screenshot({ path: `_tmp-tallada-v-${f.w}x${f.h}.png` });
  await ctx.close();
}
await b.close();
