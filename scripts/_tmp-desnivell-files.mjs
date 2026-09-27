// TEMPORAL — no es comiteja. D'on surt el desnivell entre les files de la p1 i la p2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const t = (el) => (el ? el.getBoundingClientRect().top : null);
  const out = [];
  const panell = document.querySelector('[data-mega-panel-surface="1"]');
  out.push(`panell top ${panell.getBoundingClientRect().top}`);
  // La cadena de la pagina 1: el div que porta el translateY(-pageLift)
  const arrel = v1?.querySelector('[data-mega-tile]')?.closest('div[style*="translateY"]')
    || v1?.querySelector('div[style*="translateY"]');
  out.push(`v1 top ${t(v1)} | arrel p1 top ${t(arrel)} transform ${arrel ? getComputedStyle(arrel).transform : '?'}`);
  out.push(`v1 contenidor del panell py-8 top ${t(v1?.parentElement)}`);
  // Els embolcalls de la graella
  let el = v1?.querySelector('.grid-cols-9');
  for (let i = 0; i < 5 && el; i++) {
    const st = getComputedStyle(el);
    out.push(`  cadena ${i}: ${el.tagName}.${String(el.className).slice(0, 44)} top ${el.getBoundingClientRect().top.toFixed(1)} transform ${st.transform.slice(0, 44)} padding ${st.paddingTop}`);
    el = el.parentElement;
  }
  out.push(`P2: franja top ${t(v2?.querySelector('[data-stripe-visual-content="2"]'))} | P1: franja top ${t(v1?.querySelector('[data-stripe-visual-content="1"]'))}`);
  out.push(`P1 selector(${'button[aria-label="Color"]'}) top ${t(v1?.querySelector('button[aria-label="Color"]'))}`);
  out.push(`P2 selector top ${t(v2?.querySelector('[data-p2-color-selector] button[aria-label="Color"]'))}`);
  out.push(`P1 primera peca top ${t(v1?.querySelector('[data-mega-tile]'))}`);
  out.push(`P2 primera peca top ${t(v2?.querySelector('[data-carrusel="1"] button'))}`);
  return out.join('\n');
});
console.log(r);
await ctx.close();
await b.close();
