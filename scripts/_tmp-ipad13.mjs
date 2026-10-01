// 02/10/2026 — Els dos iPad Pro 13, mesurats com a tauleta (vertical 1032 i
// apaïssada 1376) i comparats amb la tauleta veina de cada orientacio.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const FORMATS = [
  { nom: 'iPad Air 13 vertical', w: 1024, h: 1294 },
  { nom: 'iPad Pro 13 vertical', w: 1032, h: 1304 },
  { nom: 'iPad Air 13 apaissada', w: 1366, h: 946 },
  { nom: 'iPad Pro 13 apaissada', w: 1376, h: 954 },
];

const b = await chromium.launch();
for (const f of FORMATS) {
  const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
  await p.goto(`${BASE}/nova/inici`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(6000);
  const m = await p.evaluate(async () => {
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const mod = await import('/src/utils/layoutModel.js');
    const d = mod.deviceLayoutFromViewport(window.innerWidth, window.innerHeight);
    const cap = document.querySelector('header');
    const segona = cap ? [...cap.querySelectorAll('div')].some((x) => getComputedStyle(x).borderTopWidth === '1px' && Math.round(x.getBoundingClientRect().height) === 62) : false;
    const taula = document.querySelector('[data-taula-inici="1"]');
    const panell = document.querySelector('[data-mega-panel-surface]');
    const stripe2 = document.querySelector('[data-stripe-visual-content="2"]');
    const car2 = document.querySelector('[data-mega-page-viewport="2"] [data-carrusel="1"]');
    const vp1 = document.querySelector('[data-mega-page-viewport="1"]');
    const vp2 = document.querySelector('[data-mega-page-viewport="2"]');
    return {
      classe: d.isPortraitTablet ? 'tauleta vertical' : d.isLandscapeTablet ? 'tauleta apaissada' : d.isDesktop ? 'escriptori' : d.isMobile ? 'mobil' : '?',
      offset: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--appHeaderOffset'), 10) || 0,
      capcalera: cap ? Math.round(cap.getBoundingClientRect().height) : 0,
      segonaFila: segona,
      taulaVertical: taula ? q(taula) : null,
      panell: q(panell),
      vp1: q(vp1), vp2: q(vp2),
      car2: q(car2),
      stripe2: q(stripe2),
      carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
      desborda: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  console.log(`--- ${f.nom} (${f.w}x${f.h})`);
  console.log('   ', JSON.stringify(m));
  console.log('    errors', errs.slice(0, 3));
  await p.screenshot({ path: `_tmp-ipad13-${f.w}x${f.h}.png` });
  await ctx.close();
}
await b.close();
