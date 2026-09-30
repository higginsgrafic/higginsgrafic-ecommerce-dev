// TEMPORAL — quantes franges de samarretes (stripe) hi ha de cada pagina.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 60000 });
await p.waitForTimeout(8000);
const r = await p.evaluate(() => {
  const llista = [...document.querySelectorAll('[data-stripe-visual-content]')].map((el) => {
    const x = el.getBoundingClientRect();
    const vp = el.closest('[data-mega-page-viewport]');
    return {
      pagina: vp ? vp.getAttribute('data-mega-page-viewport') : '?',
      x: +x.left.toFixed(1), fi: +x.right.toFixed(1), w: +x.width.toFixed(1),
      y: +x.top.toFixed(1), baix: +(x.top + x.height).toFixed(1),
      fills: el.children.length,
      pare: el.parentElement ? `${el.parentElement.tagName.toLowerCase()}[${el.parentElement.getAttributeNames().join(' ')}]` : null,
    };
  });
  const caselles = [...document.querySelectorAll('[data-stripe-tile]')].length;
  return { llista, caselles };
});
console.log(`${w}x${h}  franges=`, r.llista.length, ` caselles=${r.caselles}`);
for (const f of r.llista) console.log('  ', JSON.stringify(f));
console.log('  errors=', errors.length);
await b.close();
