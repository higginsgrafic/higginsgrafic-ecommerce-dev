// TEMPORAL (28/09/2026): clics REALS (ratoli) als punts que estaven tapats, a la
// vista vertical (768) i a l'apaisada (1920). Nomes mira si l'accio passa.
// Us: node scripts/_tmp-clics-reals.mjs [amplada] [alcada]
import { chromium } from '@playwright/test';

const ample = Number(process.argv[2] || 768);
const alt = Number(process.argv[3] || 1024);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: ample, height: alt }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

// El selector visible: el seu boto BLANC, dins la pantalla.
const selBlanc = await p.evaluate(() => {
  const boto = [...document.querySelectorAll('[data-stripe-buttonbar] button[aria-label="Blanc"]')]
    .find((x) => { const r = x.getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
  if (!boto) return null;
  const r = boto.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, caixa: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` };
});
console.log(`### ${ample}x${alt} ###`);
console.log('selector BLANC a', selBlanc ? selBlanc.caixa : 'NO TROBAT');
if (selBlanc) {
  await p.mouse.click(selBlanc.x, selBlanc.y);
  await p.waitForTimeout(800);
  console.log('  -> despres:', JSON.stringify(await p.evaluate(() => {
    const bar = [...document.querySelectorAll('[data-stripe-buttonbar]')].find((x) => { const r = x.getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
    const pa = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
    const rb = bar.getBoundingClientRect(); const rp = pa.getBoundingClientRect();
    return { pastillaPct: +(((rp.top - rb.top) / rb.height) * 100).toFixed(1), seleccionat: [...bar.querySelectorAll('button')].filter((x) => getComputedStyle(x.querySelector('span')).fontWeight === '400').map((x) => x.getAttribute('aria-label')) };
  })));
}

// El cadenat.
const cad = await p.evaluate(() => {
  const boto = document.querySelector('button[aria-label="Bloca el megaslide"], button[aria-label="Desbloca el megaslide"]');
  if (!boto) return null;
  const r = boto.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, aria: boto.getAttribute('aria-label') };
});
console.log('cadenat a', cad ? `${Math.round(cad.x)},${Math.round(cad.y)} (${cad.aria})` : 'NO TROBAT');
if (cad) {
  await p.mouse.click(cad.x, cad.y);
  await p.waitForTimeout(800);
  console.log('  -> despres:', await p.evaluate(() => (document.querySelector('button[aria-label="Bloca el megaslide"], button[aria-label="Desbloca el megaslide"]') || {}).getAttribute?.('aria-label')));
}

// Un dibuix de la franja: ha d'obrir el producte.
const dib = await p.evaluate(() => {
  const paths = [...document.querySelectorAll('.clic-area-overlay .tshirt-outline')];
  for (const el of paths) {
    const r = el.getBoundingClientRect();
    if (r.width > 20 && r.height > 20 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight) {
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, caixa: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, id: el.getAttribute('id') };
    }
  }
  return null;
});
console.log('dibuix de la franja a', dib ? `${dib.caixa} (${dib.id})` : 'NO TROBAT');
const urlAbans = await p.evaluate(() => location.pathname);
if (dib) {
  await p.mouse.click(dib.x, dib.y);
  await p.waitForTimeout(2500);
  const urlDespres = await p.evaluate(() => location.pathname + location.search);
  console.log(`  -> url: ${urlAbans}  =>  ${urlDespres}${urlDespres !== urlAbans ? '   OK (obre el producte)' : '   (no ha canviat)'}`);
}
await b.close();
