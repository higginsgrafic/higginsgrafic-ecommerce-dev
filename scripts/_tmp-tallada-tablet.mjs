// 02/10/2026 — En Marc: «La p2 està tallada. Falta la columna de colleccions» i
// «A les tablets no hi van fletxes». On cau cada peca de la p2 a cada amplada
// de la banda de tauleta apaïssada i qui la retalla.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const FORMATS = [
  { nom: 'iPad 10/11a (1180x742)', w: 1180, h: 742 },
  { nom: 'Tab S9+ (1200x722)', w: 1200, h: 722 },
  { nom: '1280x666', w: 1280, h: 666 },
  { nom: '1366x946', w: 1366, h: 946 },
  { nom: '1376x954', w: 1376, h: 954 },
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
  const m = await p.evaluate(() => {
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const root = getComputedStyle(document.documentElement);
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const panell = document.querySelector('[data-mega-panel-surface]');
    const franja = document.querySelector('[data-colleccions-franja="1"]');
    const stripe = document.querySelector('[data-stripe-visual-content="2"]');
    const grid = v2?.querySelector('[data-carrusel="1"]');
    const fletxes = [...document.querySelectorAll('[data-stripe-guide-left-arrow], [data-stripe-guide-right-arrow], [data-fletxa-carrusel]')].filter((e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().left > 0 && e.getBoundingClientRect().right < window.innerWidth);
    // Qui retalla: el primer avantpassat amb overflow != visible.
    let e = franja, retall = null;
    while (e && e !== document.body) {
      const cs = getComputedStyle(e);
      if (cs.overflow !== 'visible' || cs.overflowY !== 'visible') { retall = [e.tagName + (e.getAttribute('data-mega-page-viewport') ? ('[vp' + e.getAttribute('data-mega-page-viewport') + ']') : ''), q(e), cs.overflow, cs.overflowY]; break; }
      e = e.parentElement;
    }
    return {
      carril: root.getPropertyValue('--hg-mega-w').trim(), escala: root.getPropertyValue('--hg-escala-mega').trim(),
      panell: q(panell), pagina2: q(v2), franjaColleccions: q(franja), franja: q(stripe), graella: q(grid),
      fletxesVisibles: fletxes.length, retall,
      franjaDinsPanell: (() => { const a = franja?.getBoundingClientRect(), c = panell?.getBoundingClientRect(); return a && c ? a.bottom <= c.bottom + 1 : null; })(),
    };
  });
  console.log(`--- ${f.nom}`, JSON.stringify(m));
  console.log('    errors', errs.slice(0, 3));
  await p.screenshot({ path: `_tmp-tallada-${f.w}x${f.h}.png` });
  await ctx.close();
}
await b.close();
