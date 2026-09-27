// TEMPORAL — no es comiteja. El clic de cada casa: que ensenya i a on porta,
// amb el desplaçament de la tira apuntat.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const hits = [];
p.on('pageerror', (e) => hits.push(String(e).slice(0, 90)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const pista = cont.firstElementChild;
  const tf = getComputedStyle(pista).transform;
  return { tx: tf && tf !== 'none' ? Math.round(+tf.split(',')[4]) : null, mostrades: tiles.map((t) => (t.querySelector('img')?.currentSrc || '').split('/').pop().replace('-b-stripe.webp', '')) };
});
console.log('tx de la graella:', r.tx);
console.log('la franja ensenya:', r.mostrades.join(', '));
// Clic a la casa 0 i a la 5.
for (const casa of [0, 5]) {
  const q = await p.evaluate((c) => {
    const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${c}"]`);
    const b2 = t.getBoundingClientRect();
    return { x: Math.round(b2.left + b2.width / 2), y: Math.round(b2.top + b2.height / 2) };
  }, casa);
  await p.mouse.click(q.x, q.y);
  await p.waitForTimeout(900);
  console.log(`casa ${casa} (ensenya ${r.mostrades[casa]}) -> ${await p.evaluate(() => location.pathname)}`);
  if ((await p.evaluate(() => location.pathname)) !== '/nova/inici') { await p.goBack({ waitUntil: 'commit' }); await p.waitForTimeout(1200); }
}
console.log('errors:', hits.length);
await b.close();
