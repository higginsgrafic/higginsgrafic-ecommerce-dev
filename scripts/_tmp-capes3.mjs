// TEMPORAL — separa les capes de la franja per veure qui pinta que:
//  'vel'    -> nomes el vel (sobre el fons del panell)
//  'dibuix' -> nomes els dibuixos
//  'tinta'  -> nomes la imatge de la franja
import { chromium } from '@playwright/test';
const QUE = process.argv[2] || 'vel';
const PAGINA = process.argv[3] || '2';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector(`[data-mega-page-viewport="${PAGINA}"]`, { timeout: 30000 });
await p.waitForTimeout(9000);
const rect = await p.evaluate(({ pag, que }) => {
  const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
  const franja = v.querySelector(`[data-stripe-visual-content="${pag}"]`);
  const imgs = [...franja.querySelectorAll('img')];
  const tinta = imgs.find((i) => /stripe\.webp/.test(i.getAttribute('src') || ''));
  const vel = imgs.find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  const capa = v.querySelector('[data-stripe-drawing-layer]');
  if (que === 'vel') { if (tinta) tinta.style.visibility = 'hidden'; if (capa) capa.style.visibility = 'hidden'; }
  if (que === 'dibuix') { if (tinta) tinta.style.visibility = 'hidden'; if (vel) vel.style.visibility = 'hidden'; }
  if (que === 'tinta') { if (vel) vel.style.visibility = 'hidden'; if (capa) capa.style.visibility = 'hidden'; }
  const r = franja.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height, teTinta: !!tinta, teVel: !!vel, teCapa: !!capa };
}, { pag: PAGINA, que: QUE });
console.log(JSON.stringify(rect));
await p.waitForTimeout(300);
await p.screenshot({ path: `_tmp-capes-${QUE}-p${PAGINA}.png`, clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } });
console.log(`desat _tmp-capes-${QUE}-p${PAGINA}.png`);
await ctx.close();
await b.close();
