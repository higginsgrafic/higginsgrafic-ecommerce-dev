// TEMPORAL — no es comiteja. Que dona `resolvePdpUrl` per a cada dibuix de la
// franja? Es compara amb el fitxer que es veu a la casa.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(async () => {
  const { resolvePdpUrl } = await import('/src/config/pdpRoutes.js');
  const out = [];
  for (let casa = 0; casa < 14; casa++) {
    const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${casa}"]`);
    const img = t?.querySelector('img');
    out.push({ casa, src: (img?.currentSrc || '').split('/').pop() });
  }
  // I el que el resolver dona per als items de la tira: els provem tots.
  const provatures = ['Cylon 78', 'Cyberman', 'Cylon 03', 'Vader', 'Afrodita', 'Iron Man 68', 'The Phoenix', 'NX-01'];
  const urls = {};
  for (const it of provatures) urls[it] = resolvePdpUrl('the_human_inside', it) || resolvePdpUrl('first_contact', it) || 'NULL';
  return { out, urls };
});
for (const x of r.out) console.log(`casa ${String(x.casa).padStart(2)} ${x.src}`);
console.log('--- resolvePdpUrl:');
for (const [k, v] of Object.entries(r.urls)) console.log(`  ${k.padEnd(14)} -> ${v}`);
await b.close();
