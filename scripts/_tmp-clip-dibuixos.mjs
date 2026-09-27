// TEMPORAL — qui retalla els dibuixos i on cau cada silueta, a les dues pagines.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const out = await p.evaluate(() => {
  const resum = {};
  for (const pag of ['1', '2']) {
    const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
    const franja = v.querySelector(`[data-stripe-visual-content="${pag}"]`);
    const capa = v.querySelector('[data-stripe-drawing-layer]');
    const tiles = capa ? [...capa.querySelectorAll('[data-stripe-tile]')] : [];
    const cs = capa ? getComputedStyle(capa) : null;
    const clip = cs ? (cs.clipPath || cs.webkitClipPath) : null;
    // el clipPath referenciat
    let clipInfo = null;
    if (clip && clip.startsWith('url(')) {
      const id = clip.slice(5, -1).replace(/["']/g, '').replace('#', '').trim();
      const el = document.getElementById(id) || document.querySelector(`[id="${id}"]`);
      clipInfo = { id, existeix: !!el };
      if (el) {
        const src = el.closest('svg');
        clipInfo.units = el.getAttribute('clipPathUnits');
        clipInfo.rectSvg = src ? (() => { const r = src.getBoundingClientRect(); return [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; })() : null;
        clipInfo.paths = [...el.querySelectorAll('path')].slice(0, 3).map((pa) => {
          const r = pa.getBoundingClientRect();
          const bb = (() => { try { const x = pa.getBBox(); return [+x.x.toFixed(1), +x.y.toFixed(1), +x.width.toFixed(1), +x.height.toFixed(1)]; } catch { return null; } })();
          return { bbox: bb, rect: [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)] };
        });
      }
    }
    const fr = franja ? franja.getBoundingClientRect() : null;
    const velImg = v.querySelector('img[src^="data:image/svg+xml"]');
    const velR = velImg ? velImg.getBoundingClientRect() : null;
    resum[`p${pag}`] = {
      franja: fr ? [+fr.left.toFixed(1), +fr.top.toFixed(1), +fr.width.toFixed(1), +fr.height.toFixed(1)] : null,
      capaDibuixos: capa ? (() => { const r = capa.getBoundingClientRect(); return [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; })() : null,
      clip,
      clipInfo,
      vel: velR ? [+velR.left.toFixed(1), +velR.top.toFixed(1), +velR.width.toFixed(1), +velR.height.toFixed(1)] : null,
      velSrcCurt: velImg ? String(velImg.getAttribute('src')).slice(0, 60) : null,
      quantsTiles: tiles.length,
      tile0: tiles[0] ? (() => { const r = tiles[0].getBoundingClientRect(); return [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; })() : null,
      tile1: tiles[1] ? (() => { const r = tiles[1].getBoundingClientRect(); return [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; })() : null,
    };
  }
  return resum;
});
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await b.close();
