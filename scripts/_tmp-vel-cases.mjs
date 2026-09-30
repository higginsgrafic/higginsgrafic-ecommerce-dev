// TEMPORAL (28/09/2026): la caixa de cada casa de la franja visible, relativa a
// la taula vertical, per poder mostrejar els pixels de les captures.
// Us: node scripts/_tmp-vel-cases.mjs [actiu]
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
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const t = taula.getBoundingClientRect();
  const contenidors = [...document.querySelectorAll('[data-stripe-visual-content="2"]')]
    .filter((c) => { const b = c.getBoundingClientRect(); return b.width > 5 && b.height > 5; });
  const panells = contenidors.map((c, pi) => {
    const capa = c.querySelector('[data-stripe-drawing-layer]');
    const tiles = [...c.querySelectorAll('[data-stripe-tile]')].map((el) => {
      const b = el.getBoundingClientRect();
      return {
        idx: Number(el.getAttribute('data-stripe-tile')),
        coll: el.getAttribute('data-stripe-collection'),
        src: (el.getAttribute('data-stripe-src') || '').split('/').pop(),
        x: +(b.left - t.left).toFixed(1),
        y: +(b.top - t.top).toFixed(1),
        w: +b.width.toFixed(1),
        h: +b.height.toFixed(1),
      };
    });
    return {
      panell: pi,
      zCapa: capa ? getComputedStyle(capa).zIndex : null,
      teSvgVel: !!([...c.querySelectorAll('svg')].find((s) => s.querySelector('mask'))),
      veuImatgeVel: !!([...c.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg'))),
      tiles,
    };
  });
  return { actiu: new URLSearchParams(location.search).get('active'), panells };
});
console.log(JSON.stringify(r));

// I la capa del vel on cau, si hi es.
await b.close();
