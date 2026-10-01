// 02/10/2026 — En Marc: «A les tablets no hi van fletxes». Comprovacio que el
// quadrat de les fletxes de la p1 no es munta a cap mida de tauleta i que a
// l'escriptori continua havent-hi, i que la p2 te la seva franja de colleccions.
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const FORMATS = [
  { nom: '768x952 (tauleta vertical)', w: 768, h: 952 },
  { nom: '1032x1304 (tauleta vertical)', w: 1032, h: 1304 },
  { nom: '1024x690 (tauleta)', w: 1024, h: 690 },
  { nom: '1180x742 (tauleta)', w: 1180, h: 742 },
  { nom: '1280x666 (tauleta)', w: 1280, h: 666 },
  { nom: '1366x946 (tauleta)', w: 1366, h: 946 },
  { nom: '1376x954 (tauleta)', w: 1376, h: 954 },
  { nom: '1440x900 (escriptori)', w: 1440, h: 900 },
  { nom: '1920x1080 (escriptori)', w: 1920, h: 1080 },
];

const b = await chromium.launch();
for (const f of FORMATS) {
  const ctx = await b.newContext({ viewport: { width: f.w, height: f.h }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
  await p.goto(`${BASE}/nova/inici?active=first_contact&carril=1`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const m = await p.evaluate(() => {
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const root = getComputedStyle(document.documentElement);
    const visibles = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0);
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const pg = v1.getBoundingClientRect();
    const rel = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left - pg.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const blocP1 = v1.querySelector('[data-bloc-dreta-p1]');
    const selectorP1 = blocP1?.querySelector('[data-selector-p1], [data-bloc-selector-p1]') || blocP1?.lastElementChild?.lastElementChild;
    const franjaCol = document.querySelector('[data-colleccions-franja="1"], [data-colleccions-columna="1"]');
    const panell = document.querySelector('[data-mega-panel-surface]');
    const a = franjaCol?.getBoundingClientRect(), c = panell?.getBoundingClientRect();
    return {
      carril: root.getPropertyValue('--hg-mega-w').trim(), escala: root.getPropertyValue('--hg-escala-mega').trim(),
      fletxesP1: visibles('[data-fletxes-p1="1"]').length,
      chevrons: visibles('button[aria-label="Anterior"], button[aria-label="Següent"]').length,
      blocP1: rel(blocP1), selectorP1: rel(selectorP1),
      colleccions: q(franjaCol), dinsPanell: a && c ? a.bottom <= c.bottom + 1 : null,
      panell: q(panell), llistesColleccions: visibles('[data-colleccions-targeta="1"]').length,
    };
  });
  console.log(`--- ${f.nom}`, JSON.stringify(m));
  console.log('    errors', errs.slice(0, 2));
  if (f.w >= 1280 && f.w <= 1376) await p.screenshot({ path: `_tmp-fletxes-${f.w}x${f.h}.png` });
  await ctx.close();
}
await b.close();
