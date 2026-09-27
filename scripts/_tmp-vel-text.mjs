// TEMPORAL — desa el text del vel (SVG) de la pagina 2 per poder-lo llegir.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const PAGINA = process.argv[2] || '2';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector(`[data-mega-page-viewport="${PAGINA}"]`, { timeout: 30000 });
await p.waitForTimeout(9000);
const text = await p.evaluate((pag) => {
  const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
  const franja = v.querySelector(`[data-stripe-visual-content="${pag}"]`);
  const img = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  if (!img) return null;
  return decodeURIComponent(img.getAttribute('src').replace(/^data:image\/svg\+xml,/, ''));
}, PAGINA);
if (!text) { console.log('sense vel'); } else {
  const net = text.replace(/></g, '>\n<');
  writeFileSync(`_tmp-vel-p${PAGINA}.svg`, net);
  console.log(net.slice(0, 4000));
  console.log('... desat _tmp-vel-p' + PAGINA + '.svg');
}
await ctx.close(); await b.close();
