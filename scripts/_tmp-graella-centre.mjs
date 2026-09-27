// TEMPORAL — no es comiteja. Quin dibuix cau al mig de la finestra de la
// graella, amb l'index dins la tira i la finestra.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);

const radiografia = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  const mig = rb.left + rb.width / 2;
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const vis = bs.map((x, i) => {
    const k = x.getBoundingClientRect();
    return { i, lab: x.getAttribute('aria-label'), op: getComputedStyle(x).opacity, centre: Math.round((k.left + k.right) / 2), dins: k.right > rb.left && k.left < rb.right };
  }).filter((x) => x.dins);
  return {
    finestra: { esq: Math.round(rb.left), dreta: Math.round(rb.right), mig: Math.round(mig) },
    migItem: vis.reduce((a, x) => (Math.abs(x.centre - mig) < Math.abs(a.centre - mig) ? x : a), vis[0] || {}),
    primeres: vis.slice(0, 4).map((x) => `${x.i}:${x.lab}:${x.op}`),
    ultimes: vis.slice(-4).map((x) => `${x.i}:${x.lab}:${x.op}`),
    activos: vis.filter((x) => x.op === '1').map((x) => x.i),
  };
});

for (const nom of [null, 'THE HUMAN INSIDE', 'CUBE']) {
  if (nom) {
    const card = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === n) || null, nom);
    const bb = await card.asElement().boundingBox();
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await p.waitForTimeout(1300);
  }
  const r = await radiografia();
  console.log((nom || 'FIRST CONTACT').padEnd(16), 'finestra', JSON.stringify(r.finestra));
  console.log('   mig =', JSON.stringify(r.migItem));
  console.log('   actius =', r.activos.join(','), '| primeres', r.primeres.join(' '), '| ultimes', r.ultimes.join(' '));
}
await b.close();
