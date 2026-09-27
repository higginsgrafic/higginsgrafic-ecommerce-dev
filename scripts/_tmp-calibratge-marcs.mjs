// TEMPORAL — no es comiteja. Quin calibratge (dx, dy, escala) rep cada fitxer de
// la franja de LOOKING FOR MY DARCY?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(async () => {
  const mod = await import('/src/config/stripeCalibrations.js');
  const taula = mod.STRIPE_DRAWING_CALIBRATIONS || mod.default || {};
  const base = '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/';
  const claus = ['frame/blue-yellow-frame-stripe.webp', 'frame/fuchsia-yellow-frame-stripe.webp', 'frame/yellow-red-frame-stripe.webp', 'frame/yellow-pink-frame-stripe.webp',
    'frame/blue-frame-stripe.webp', 'solid/blue-solid-stripe.webp'];
  const out = {};
  for (const c of claus) out[c] = taula[base + c] || 'SENSE CALIBRATGE (escala 1 per defecte)';
  return out;
});
for (const [k, v] of Object.entries(r)) console.log(`${k.padEnd(44)} ${JSON.stringify(v)}`);
await b.close();
