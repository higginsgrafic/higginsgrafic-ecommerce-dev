// 02/10/2026 — El segon carril a la tauleta apaïssada: la pagina 1, amb les
// peces mesurades DINS de la seva pagina (la p1 viu desplacada quan se'n veu
// una altra) i comprovacio que tot cau dins el carril.
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
  await p.goto(`${BASE}/nova/inici?active=first_contact&carril=1`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const m = await p.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const carril = parseFloat(root.getPropertyValue('--hg-mega-w'));
    const xCarril = parseFloat(root.getPropertyValue('--hg-mega-x'));
    const escala = parseFloat(root.getPropertyValue('--hg-escala-mega'));
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const pg = v1.getBoundingClientRect();
    // Rect relative a la pagina de la p1 (les pagines viuen desplacades).
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left - pg.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const bloc = q(v1.querySelector('[data-bloc-dreta-p1]'));
    const graella = q(v1.querySelector('[data-carrusel="1"]'));
    const franja = q(v1.querySelector('[data-stripe-visual-content="1"]'));
    const colors = q(v1.querySelector('[data-p2-color-grid], [data-graella-colors]'));
    const dins = (r) => (r ? (r[0] >= xCarril - 2 && r[0] + r[2] <= xCarril + carril + 2) : null);
    return { pagina1X: Math.round(pg.left), carril, xCarril, escala, bloc, graella, franja, colors, dins: [dins(bloc), dins(graella), dins(franja)] };
  });
  console.log(`--- ${f.nom}`, JSON.stringify(m));
  console.log('    errors', errs.slice(0, 3));
  await p.screenshot({ path: `_tmp-segon-carril-${f.nom}-p1.png` });
  await ctx.close();
}
await b.close();
