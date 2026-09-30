// TEMPORAL (29/09/2026): comprova al navegador la stripe nova (v6) instal-lada.
// Us: node scripts/_tmp-franja-nova.mjs
import { chromium } from '@playwright/test';
const BASE = 'http://127.0.0.1:3003';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
const p = await ctx.newPage();
const fallades = [];
p.on('response', (r) => { if (r.status() >= 400) fallades.push(`${r.status()} ${r.url().replace(BASE, '')}`); });

await p.goto(BASE + '/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(10000);

const r = await p.evaluate(() => {
  const img = [...document.querySelectorAll('img')].find((i) => /full-color-stripe/.test(i.getAttribute('src') || ''));
  const clic = document.querySelector('img[src*="full-clic-area-5"], svg[data-clic-area]');
  return {
    src: img?.getAttribute('src') || null,
    natural: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
    trencada: img ? (img.complete && img.naturalWidth === 0) : null,
    rect: img ? (() => { const q = img.getBoundingClientRect(); return `${Math.round(q.width)}x${Math.round(q.height)}`; })() : null,
    clicArea: !!clic,
  };
});
console.log('stripe:', r.src);
console.log('  natural:', r.natural, '· pintada:', r.rect, '· trencada:', r.trencada);
console.log('  àrea de clic present:', r.clicArea);
await p.screenshot({ path: '_tmp-franja-nova-megaslide.png' });
console.log('respostes >=400:', fallades.length ? [...new Set(fallades)].join('\n  ') : 'cap');
await b.close();
