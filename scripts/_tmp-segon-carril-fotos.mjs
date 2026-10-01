// 02/10/2026 — El segon carril a la tauleta apaïssada: fotos de la p1 i la p2 a
// 1280, 1366 i 1376, mesura de les peces i comprovacio que tot cau dins el carril.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const FORMATS = [
  { nom: '1280', w: 1280, h: 666 },
  { nom: '1366', w: 1366, h: 946 },
  { nom: '1376', w: 1376, h: 954 },
];

const b = await chromium.launch();
for (const f of FORMATS) {
  const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 130)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 130)); });
  await p.goto(`${BASE}/nova/inici`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const m = await p.evaluate(() => {
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const carril = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
    const xCarril = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-x'));
    const vp = document.body.clientWidth;
    const dins = (r) => (r ? (r[0] >= xCarril - 2 && r[0] + r[2] <= xCarril + carril + 2) : null);
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const f1 = v1?.querySelector('[data-stripe-visual-content="1"]');
    const f2 = v2?.querySelector('[data-stripe-visual-content="2"]');
    const g1 = v1?.querySelector('[data-carrusel="1"]');
    const g2 = v2?.querySelector('[data-carrusel="1"]');
    const b1 = v1?.querySelector('[data-bloc-dreta-p1]');
    return {
      carril, xCarril, vp,
      capcalera: q(document.querySelector('header')),
      hero: q(document.querySelector('[data-hero-inici], section.hg-seccio')),
      p1: { bloc: q(b1), graella: q(g1), franja: q(f1), dinsCarril: [dins(q(b1)), dins(q(g1)), dins(q(f1))] },
      p2: { selector: q(v2?.querySelector('[data-p2-color-selector]')), graella: q(g2), franja: q(f2), dinsCarril: [dins(q(g2)), dins(q(f2))] },
      desborda: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  console.log(`--- ${f.nom} (${f.w}x${f.h})`, JSON.stringify(m));
  console.log('    errors', errs.slice(0, 3));
  await p.screenshot({ path: `_tmp-segon-carril-${f.nom}-p2.png` });
  await ctx.close();
}
await b.close();
