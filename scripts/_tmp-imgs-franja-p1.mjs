// TEMPORAL — les imatges de la franja de la p1 (quina capa es la de sobre).
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const r = await p.evaluate(() => {
  const fr = document.querySelector('[data-mega-page-viewport="1"] [data-stripe-visual-content="1"]');
  const imgs = [...fr.querySelectorAll('img')].map((im) => {
    const cs = getComputedStyle(im);
    const x = im.getBoundingClientRect();
    return { src: decodeURI(im.getAttribute('src') || '').split('/').slice(-2).join('/'), z: cs.zIndex, op: cs.opacity, disp: cs.display, w: +x.width.toFixed(1), h: +x.height.toFixed(1), x: +x.left.toFixed(1), y: +x.top.toFixed(1), tf: cs.transform.slice(0, 60), pos: cs.position };
  });
  const estats = { ref: getComputedStyle(fr).getPropertyValue('--megaStripeRefScale'), refDx: getComputedStyle(fr).getPropertyValue('--megaStripeRefDx') };
  return { imgs, estats, nDivs: fr.querySelectorAll('div').length };
});
console.log(`${w}x${h} divs=${r.nDivs} vars=${JSON.stringify(r.estats)}`);
for (const i of r.imgs) console.log('  ', JSON.stringify(i));
await b.close();
