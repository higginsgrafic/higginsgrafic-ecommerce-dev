// TEMPORAL (28/09/2026): estat del vel casa per casa a la franja de la p2
// vertical: quina casa te vel, on es la capa del vel i quina caixa fa.
// Us: node scripts/_tmp-vel-estat.mjs [actiu]
import { chromium } from '@playwright/test';

const actiu = process.argv[2] || 'first_contact';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${actiu}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const r = await p.evaluate(() => {
  const contenidors = [...document.querySelectorAll('[data-stripe-visual-content="2"]')];
  const out = [];
  for (const c of contenidors) {
    const caixa = c.getBoundingClientRect();
    const svgFranja = c.querySelector('svg[viewBox]');
    const capaDibuixos = c.querySelector('[data-stripe-drawing-layer]');
    // La capa del vel es l'ultim svg amb un <mask> a dins.
    const svgs = [...c.querySelectorAll('svg')];
    const svgVel = svgs.reverse().find((s) => s.querySelector('mask'));
    const R = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: +(b.left - caixa.left).toFixed(2), y: +(b.top - caixa.top).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2), z: getComputedStyle(el).zIndex };
    };
    const cases = [...c.querySelectorAll('[data-stripe-tile]')].map((t) => ({
      idx: Number(t.getAttribute('data-stripe-tile')),
      coll: t.getAttribute('data-stripe-collection'),
    }));
    out.push({
      visible: caixa.width > 5 && caixa.height > 5,
      caixa: { w: +caixa.width.toFixed(2), h: +caixa.height.toFixed(2) },
      svgFranja: R(svgFranja),
      svgVel: R(svgVel),
      capaDibuixos: R(capaDibuixos),
      maskType: svgVel ? getComputedStyle(svgVel.querySelector('mask')).maskType : null,
      cases: cases.length ? cases : null,
    });
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
