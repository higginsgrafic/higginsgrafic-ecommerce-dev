// TEMPORAL — no es comiteja. El vel segueix el DIBUIX en fer scroll? Es mesura
// casella a casella: quina colleccio hi ha, quina opacitat te el dibuix, i si la
// silueta d'aquella casella es al vel.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const q = [];
p.on('pageerror', (e) => q.push(String(e).slice(0, 120)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);

// El vel es una imatge data:svg amb un path per casella a opacitat 0,6. Es llegeix
// QUINES caselles hi son (l'ordre dels paths que hi queden es l'ordre original,
// o sigui que cal comptar-los per separat).
const estat = () => p.evaluate(async () => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const vel = [...document.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  let casesVel = null;
  if (vel) {
    const svg = decodeURIComponent(vel.getAttribute('src').replace('data:image/svg+xml,', ''));
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const paths = [...doc.querySelectorAll('path')];
    const total = paths.length;
    const amb0_6 = paths.filter((x) => x.getAttribute('fill-opacity') === '0.6').length;
    casesVel = { pathsAlVel: total, amb06: amb0_6 };
  }
  return {
    cases: tiles.map((t) => {
      const img = t.querySelector('img');
      return `${t.getAttribute('data-stripe-tile')}:${getComputedStyle(t).opacity}:${(img?.currentSrc || '').split('/').pop().replace('-b-stripe.webp', '').replace('.webp', '').slice(0, 12) || '-'}`;
    }),
    vel: casesVel,
  };
});

const mostra = async (etiqueta) => {
  const e = await estat();
  const actives = e.cases.filter((c) => c.split(':')[1] === '1').map((c) => c.split(':')[0]);
  console.log(etiqueta.padEnd(14), 'cases', actives.join(',') || '(cap)', '| vel', JSON.stringify(e.vel));
  return e;
};

await mostra('inici');
// Scroll de la franja amb la rodeta a sobre la filera de samarretes.
const q2 = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
for (let i = 1; i <= 3; i++) {
  await p.mouse.move(q2.x, q2.y);
  await p.mouse.wheel(0, 120);
  await p.waitForTimeout(500);
  await mostra('scroll ' + i);
}
console.log('errors:', q.length, q.slice(0, 2));
await b.close();
