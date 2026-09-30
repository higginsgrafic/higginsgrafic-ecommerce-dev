// TEMPORAL: clicar samarretes de la franja; quina colleccio queda activa i si
// s'hi queda o va saltant. Us: node scripts/_tmp-clics-franja.mjs
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const estat = () => p.evaluate(() => {
  const col = document.querySelector('[data-colleccions-caixes="1"]');
  const marcada = col && [...col.querySelectorAll('button')].find((x) => getComputedStyle(x).backgroundColor === 'rgb(255, 255, 255)');
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  const cases = [...cela.querySelectorAll('[data-stripe-tile]')].map((t) => ({
    idx: Number(t.getAttribute('data-stripe-tile')),
    coll: t.getAttribute('data-stripe-collection'),
    src: ((t.querySelector('img') || {}).getAttribute ? (t.querySelector('img').getAttribute('src') || '') : '').split('/').pop().slice(0, 22),
  }));
  return { marcada: marcada ? marcada.textContent.trim() : null, cases };
});

// El centre de cada CASELLA (on clicaria un dit), no el de la silueta.
const caixes = await p.evaluate(() => {
  const c = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  return [...c.querySelectorAll('[data-stripe-tile]')].map((t) => {
    const r = t.getBoundingClientRect();
    return { idx: Number(t.getAttribute('data-stripe-tile')), x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
});
const abans = await estat();
for (const idx of [0, 3, 7]) {
  const caixa = caixes.find((c) => c.idx === idx);
  if (!caixa) continue;
  const queHiHavia = abans.cases.find((c) => c.idx === idx);
  await p.mouse.click(caixa.x, caixa.y);
  await p.waitForTimeout(1500);
  const despres = await estat();
  // I dos segons mes, per veure si es queda o va saltant.
  await p.waitForTimeout(2000);
  const tard = await estat();
  console.log(`clic a la casa ${idx} (hi havia ${queHiHavia.coll} / ${queHiHavia.src})`);
  console.log(`   despres: marcada=${despres.marcada}   +2s: marcada=${tard.marcada}  ${despres.marcada === tard.marcada ? '(estable)' : '**(CANVIA)**'}`);
}
await b.close();
