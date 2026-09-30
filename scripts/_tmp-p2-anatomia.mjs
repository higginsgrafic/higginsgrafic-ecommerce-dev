// TEMPORAL — anatomia vertical de la composicio de la p2 (on cap una franja nova).
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1680, 1050], [1512, 982], [1440, 900], [1366, 768], [1280, 720], [1024, 768]];

const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { t: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), l: +x.left.toFixed(1), r: +x.right.toFixed(1), h: +x.height.toFixed(1) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const filera = v2.querySelector('[data-p2-cercador-row]');
      const graella = v2.querySelector('[data-carrusel="1"]');
      const colors = v2.querySelector('[data-p2-color-grid]');
      const selector = v2.querySelector('[data-p2-color-selector]');
      const franja = v2.querySelector('[data-stripe-visual-content="2"]');
      const enllacos = [...v2.querySelectorAll('[data-colleccions-targeta="1"]')];
      const cs = getComputedStyle(document.documentElement);
      const carrilX = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
      const carrilW = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
      return {
        carrilL: +carrilX.toFixed(1), carrilR: +(carrilX + carrilW).toFixed(1),
        filera: box(filera), graella: box(graella), colors: box(colors), selector: box(selector),
        franja: box(franja), primerEnllac: box(enllacos[0]), ultimEnllac: box(enllacos[enllacos.length - 1]),
        nEnllacos: enllacos.length,
      };
    });
    console.log(`${w}x${h}  carril ${r.carrilL}..${r.carrilR}`);
    console.log(`   filera ${r.filera.t}..${r.filera.b} (h ${r.filera.h}, x ${r.filera.l}..${r.filera.r})`);
    console.log(`   graella ${r.graella.t}..${r.graella.b}   colors ${r.colors.t}..${r.colors.b} (x ${r.colors.l}..${r.colors.r})   selector ${r.selector.t}..${r.selector.b} (x ${r.selector.l}..${r.selector.r})`);
    console.log(`   franja ${r.franja.t}..${r.franja.b} (x ${r.franja.l}..${r.franja.r})  | BUIT colors->franja ${(r.franja.t - r.colors.b).toFixed(1)} px`);
    console.log(`   enllacos(${r.nEnllacos}) ${r.primerEnllac.l}..${r.ultimEnllac.r}  t ${r.primerEnllac.t} b ${r.ultimEnllac.b}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
