// TEMPORAL — quina composicio de colleccions hi ha a cada mida i com encaixa.
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1680, 1050], [1512, 982], [1440, 900], [1366, 768], [1280, 720], [1200, 800], [1112, 834], [1024, 768]];

const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { t: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), l: +x.left.toFixed(1), r: +x.right.toFixed(1), h: +x.height.toFixed(1) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const banda = v2.querySelector('[data-colleccions-franja="1"]');
      const enllacos = [...v2.querySelectorAll('[data-colleccions-targeta="1"]')];
      const colors = v2.querySelector('[data-p2-color-grid]');
      const retall = v2.querySelector('[data-carrusel="1"]');
      const retallFill = retall ? retall.firstElementChild : null;
      const stripe = v2.querySelector('[data-stripe-visual-content="2"]');
      const tiles = stripe ? [...stripe.querySelectorAll('[data-stripe-tile]')].map((t) => t.getBoundingClientRect().top) : [];
      return {
        banda: box(banda),
        columna: enllacos.length ? { n: enllacos.length, primer: box(enllacos[0]), ultim: box(enllacos[enllacos.length - 1]) } : null,
        colors: box(colors), retall: box(retallFill || retall),
        tintaFranja: tiles.length ? +Math.min(...tiles).toFixed(1) : null,
      };
    });
    const comp = r.banda ? 'FRANJA (1024-1366)' : 'COLUMNA (de sempre)';
    console.log(`${w}x${h}  ${comp}`);
    if (r.banda) console.log(`     franja ${r.banda.l}..${r.banda.r} t${r.banda.t} b${r.banda.b} (h ${r.banda.h})`);
    if (r.columna) console.log(`     columna x ${r.columna.primer.l}..${r.columna.ultim.r}  t${r.columna.primer.t} b${r.columna.ultim.b} (${r.columna.n} enllacos)`);
    console.log(`     retall dreta ${r.retall.r}  colors dreta ${r.colors.r}  tintaFranja ${r.tintaFranja}  errors=${errors.length}${errors.length ? ' :: ' + errors[0] : ''}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
