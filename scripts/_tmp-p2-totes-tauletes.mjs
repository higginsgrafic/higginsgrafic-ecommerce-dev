// 02/10/2026 — En Marc: «La p2 està tallada. Falta la columna de colleccions» i
// «A totes excepte les desktop». Es mira la p2 a TOTS els formats de tauleta de
// la llista, amb detector de peces que surten de la finestra o del panell.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const font = readFileSync(new URL('./mesura-formats.mjs', import.meta.url), 'utf8');
const blocs = font.split('const FORMATS = [')[1].split('];')[0];
const FORMATS = [...blocs.matchAll(/\{\s*nom:\s*'([^']+)',\s*tipus:\s*'([^']+)',\s*w:\s*(\d+),\s*h:\s*(\d+),\s*chrome:\s*(\d+)\s*\}/g)]
  .map((m) => ({ nom: m[1], tipus: m[2], w: +m[3], h: +m[4], chrome: +m[5] }))
  .filter((f) => f.tipus.startsWith('tauleta'));

const b = await chromium.launch();
for (const f of FORMATS) {
  const alt = f.h - f.chrome;
  const ctx = await b.newContext({ viewport: { width: f.w, height: alt }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 100)));
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(7000);
  const m = await p.evaluate(async () => {
    const mod = await import('/src/utils/layoutModel.js');
    const d = mod.deviceLayoutFromViewport(window.innerWidth, window.innerHeight);
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const panell = document.querySelector('[data-mega-panel-surface]');
    const dins = (el, capa) => { const r = el?.getBoundingClientRect(), c = capa?.getBoundingClientRect(); if (!r || !c || r.width < 2) return null; return r.left >= c.left - 2 && r.right <= c.right + 2; };
    const links = [...document.querySelectorAll('[data-colleccions-targeta="1"]')].filter((e) => e.getBoundingClientRect().width > 2);
    const dinsFinestra = links.filter((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth; });
    // Peces de la p2 i si surten de la finestra.
    const peces = {};
    for (const [nom, el] of [
      ['graella', v2?.querySelector('[data-carrusel="1"]')],
      ['franja', document.querySelector('[data-stripe-visual-content="2"]')],
      ['selector', v2?.querySelector('[data-p2-color-selector]')],
      ['colleccions', document.querySelector('[data-colleccions-franja="1"]') || document.querySelector('[data-colleccions-columna="1"]')],
    ]) {
      const r = el?.getBoundingClientRect();
      peces[nom] = r && r.width > 2 ? { x: Math.round(r.left), dreta: Math.round(r.right), dinsFinestra: r.left >= -2 && r.right <= window.innerWidth + 2, dinsPanell: dins(el, panell) } : null;
    }
    return {
      classe: d.isPortraitTablet ? 'vert' : d.isLandscapeTablet ? 'apaissada' : 'altres',
      finestra: `${window.innerWidth}x${window.innerHeight}`,
      enllacos: links.length, enllacosDinsFinestra: dinsFinestra.length,
      peces,
    };
  });
  const mal = (m.peces.franja && !m.peces.franja.dinsFinestra) || (m.peces.graella && !m.peces.graella.dinsFinestra) || m.enllacosDinsFinestra < m.enllacos;
  console.log(`${mal ? 'MAL ' : 'ok  '}${(f.nom + ' (' + f.w + 'x' + alt + ')').padEnd(40)}${m.classe.padEnd(11)}enllacos ${m.enllacosDinsFinestra}/${m.enllacos}  franja ${JSON.stringify(m.peces.franja)}`);
  if (errs.length) console.log('     errors', errs.slice(0, 2));
  await ctx.close();
}
await b.close();
