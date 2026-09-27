// TEMPORAL — no es comiteja. Coherencia: a cada casa, el vel i el dibuix son el
// mateix dibuix? Es compara l'opacitat del dibuix amb la presencia al vel.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
const comprova = async (etiqueta) => {
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
    const vel = [...document.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
    let velCount = 0;
    if (vel) {
      const svg = decodeURIComponent(vel.getAttribute('src').replace('data:image/svg+xml,', ''));
      const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
      velCount = [...doc.querySelectorAll('path')].filter((x) => x.getAttribute('fill-opacity') === '0.6').length;
    }
    const actives = tiles.filter((t) => getComputedStyle(t).opacity === '1').length;
    return { actives, velCount, cases: tiles.length };
  });
  const ok = r.actives + r.velCount === r.cases;
  console.log(etiqueta.padEnd(12), `actives=${r.actives} vel=${r.velCount} total=${r.cases} -> ${ok ? 'COHERENT' : 'INCOHERENT'}`);
};
await comprova('inici');
for (let i = 1; i <= 5; i++) {
  await p.mouse.move(q.x, q.y);
  await p.mouse.wheel(0, 120);
  await p.waitForTimeout(450);
  await comprova('scroll ' + i);
}
await b.close();
