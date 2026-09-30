// TEMPORAL (28/09/2026): la franja APAIXADA de la p2 (vista ampla, 1920x946):
// captura la pantalla i dona la caixa de cada casa, per mostrejar els pixels del
// dibuix. Us: node scripts/_tmp-vel-horitzontal.mjs <etiqueta> [actiu]
import { chromium } from '@playwright/test';

const etiqueta = process.argv[2] || 'ara';
const actiu = process.argv[3] || 'first_contact';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 90)); });
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${actiu}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const info = await p.evaluate(() => {
  const c = document.querySelector('[data-stripe-visual-content="2"]');
  if (!c) return null;
  const rc = c.getBoundingClientRect();
  const capa = c.querySelector('[data-stripe-drawing-layer]');
  const svgs = [...c.querySelectorAll('svg')];
  const svgVel = svgs.find((s) => s.querySelector('mask'));
  const imgVel = [...c.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg'));
  const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  return {
    panell: R(c),
    capaDibuixos: R(capa),
    zCapa: capa ? getComputedStyle(capa).zIndex : null,
    teSvgVel: !!svgVel,
    teImatgeVel: !!imgVel,
    zImatgeVel: imgVel ? getComputedStyle(imgVel).zIndex : null,
    cases: [...c.querySelectorAll('[data-stripe-tile]')].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        idx: Number(el.getAttribute('data-stripe-tile')),
        coll: el.getAttribute('data-stripe-collection'),
        x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1),
      };
    }),
  };
});

await p.screenshot({ path: `_tmp-vel-h-${etiqueta}.png` });
console.log(JSON.stringify(info));
console.log(`desat _tmp-vel-h-${etiqueta}.png`);
console.log('errors:', errors.length ? errors.join(' | ') : 'cap');
await b.close();
