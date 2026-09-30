// TEMPORAL — la franja de colleccions, el retall i la tira de colors vs el carril.
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1200, 800], [1112, 834], [1024, 768]];

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
      const franja = v2.querySelector('[data-colleccions-franja="1"]');
      const caixes = franja ? [...franja.querySelectorAll('[data-colleccions-franja-item="1"]')] : [];
      const activa = caixes.find((c) => c.getAttribute('aria-current') === 'true') || caixes[0];
      const colors = v2.querySelector('[data-p2-color-grid]');
      const retall = v2.querySelector('[data-carrusel="1"]');
      const retallFill = retall ? retall.firstElementChild : null;
      const stripe = v2.querySelector('[data-stripe-visual-content="2"]');
      const tiles = [...stripe.querySelectorAll('[data-stripe-tile]')].map((t) => t.getBoundingClientRect().top);
      // El cul del selector B/C/N (la seva caixa visible)
      const blanc = [...v2.querySelectorAll('button')].find((b) => (b.textContent || '').trim().toUpperCase() === 'BLANC');
      let el = blanc, caixaBcn = null;
      while (el && el !== v2) {
        const cs = getComputedStyle(el);
        if (parseFloat(cs.borderTopWidth) > 0 && el.getBoundingClientRect().width > 40) { caixaBcn = el; break; }
        el = el.parentElement;
      }
      const cs = getComputedStyle(document.documentElement);
      const carrilX = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
      const carrilW = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
      return {
        carril: [+carrilX.toFixed(1), +(carrilX + carrilW).toFixed(1)],
        franja: box(franja), noms: caixes.length, activa: box(activa),
        colors: box(colors), retall: box(retallFill || retall), bcn: box(caixaBcn),
        tintaFranja: tiles.length ? +Math.min(...tiles).toFixed(1) : null,
      };
    });
    const d = (a, b2) => (a == null || b2 == null ? 'n/a' : (a - b2).toFixed(1));
    console.log(`${w}x${h}  carril ${r.carril[0]}..${r.carril[1]}  franja ${r.franja.l}..${r.franja.r} t${r.franja.t} b${r.franja.b} (pastilla ${r.activa.h})`);
    console.log(`     retall dreta - carril dreta = ${d(r.carril[1], r.retall.r)}   colors dreta - carril dreta = ${d(r.carril[1], r.colors.r)}`);
    console.log(`     franja top - B/C/N cul = ${d(r.franja.t, r.bcn.b)}   tinta franja - franja cul = ${d(r.tintaFranja, r.franja.b)}   errors=${errors.length}${errors.length ? ' :: ' + errors[0] : ''}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
