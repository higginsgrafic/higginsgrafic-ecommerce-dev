// TEMPORAL — no es comiteja. Una sola passada: per a cada casa, es llegeix el
// que es veu i SEGUIDAMENT es clica, perque res no giri pel mig.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3500);
let ok = 0, ko = 0;
for (let casa = 0; casa < 14; casa++) {
  const q = await p.evaluate((c) => {
    const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${c}"]`);
    const b2 = t.getBoundingClientRect();
    return { x: Math.round(b2.left + b2.width / 2), y: Math.round(b2.top + b2.height / 2), vist: (t.querySelector('img')?.currentSrc || '').split('/').pop(), item: t.getAttribute('data-stripe-item'), coll: t.getAttribute('data-stripe-collection') };
  }, casa);
  await p.mouse.click(q.x, q.y);
  await p.waitForTimeout(1100);
  const url = await p.evaluate(() => location.pathname);
  // La comprovacio: que la casa ensenyi el MATEIX dibuix que tenia ABANS i que
  // la url porti la seva propria arrel (les excepcions del registre, com
  // iron-kong, son legitimes i no es poden endevinar).
  const abans = q.vist.replace(/-b-stripe\.webp$/, '').replace(/-a$/, '').replace(/[^a-z0-9]/g, '');
  const ara = url.toLowerCase().replace(/[^a-z0-9]/g, '');
  const correcte = ara.includes(abans.slice(0, 6));
  if (correcte) ok++; else { ko++; console.log(`  REVISA casa ${casa}: es veu ${q.vist} (${q.coll}) -> ${url}`); }
  if (url !== '/nova/inici') { await p.goBack({ waitUntil: 'commit' }); await p.waitForTimeout(1400); }
}
console.log(`clics correctes: ${ok} | incorrectes: ${ko}`);
await b.close();
