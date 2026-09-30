import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const logo = document.querySelector('img[src*="logo"], a[href="/"] img, header img');
  const icones = [...document.querySelectorAll('button')].filter((b) => (b.getAttribute('aria-label') || '').match(/Cercador|Cistell|Compte|sessió/i));
  const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.right)]; };
  const primer = icones[0] ? icones[0].getBoundingClientRect() : null;
  const ultim = icones.length ? icones[icones.length - 1].getBoundingClientRect() : null;
  return {
    logo: q(logo),
    primeraIcona: primer ? [Math.round(primer.left), Math.round(primer.right)] : null,
    ultimaIcona: ultim ? [Math.round(ultim.left), Math.round(ultim.right)] : null,
    nIcones: icones.length,
  };
});
console.log(`${w}x${h}`, JSON.stringify(r));
await b.close();
