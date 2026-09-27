// TEMPORAL — no es comiteja. Les files de dibuixos de les dues pagines i les
// cel·les del selector, amb xifres (per alinear-les).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const [w, h] = (process.argv[2] || '1920x946').split('x').map(Number);
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const info = (el) => {
    if (!el) return null;
    const r2 = el.getBoundingClientRect();
    return { x: r2.left, y: r2.top, w: r2.width, h: r2.height, c: r2.top + r2.height / 2, baix: r2.bottom };
  };
  const f = (o) => (o ? `x${o.x.toFixed(1)} y${o.y.toFixed(1)} ${o.w.toFixed(1)}x${o.h.toFixed(1)} centre ${o.c.toFixed(1)}` : '(no hi es)');
  const out = [];
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  out.push('=== SELECTOR (cel·les)');
  const bnc1 = v1?.querySelector('[data-stripe-buttonbar="bn"]');
  const bnc2 = v2?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  out.push(`P1 pastilla: ${f(info(bnc1))}`);
  out.push(`P2 pastilla: ${f(info(bnc2))}`);
  for (const [etiqueta, el] of [['P1', bnc1], ['P2', bnc2]]) {
    const boto = el?.querySelector('button[aria-label="Blanc"]');
    const boto2 = el?.querySelector('button[aria-label="Color"]');
    const boto3 = el?.querySelector('button[aria-label="Negre"]');
    out.push(`  ${etiqueta} BLANC ${f(info(boto))} COLOR ${f(info(boto2))} NEGRE ${f(info(boto3))}`);
  }
  out.push('=== P1: les peces de la graella (les que es pinten)');
  const tiles = [...(v1?.querySelectorAll('[data-mega-tile]') || [])];
  tiles.slice(0, 9).forEach((t, i) => out.push(`  tile ${i}: ${f(info(t))}`));
  const img = tiles[1]?.querySelector('img');
  out.push(`  imatge del tile 1: ${f(info(img))}`);
  out.push('=== P2: les dues files del carrusel');
  const carr = v2?.querySelector('[data-carrusel="1"]');
  const peces = [...(carr?.querySelectorAll('button') || [])].slice(0, 8);
  peces.forEach((t, i) => out.push(`  peca ${i}: ${f(info(t))} (img ${f(info(t.querySelector('img')))})`));
  return out.join('\n');
});
console.log(r);
await ctx.close();
await b.close();
