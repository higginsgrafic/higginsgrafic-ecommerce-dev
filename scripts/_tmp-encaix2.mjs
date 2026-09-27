// TEMPORAL — no es comita. La franja: cintura esquerra al carril, dreta a la guia de les fletxes.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const mida of ['1920x946', '1440x900', '1366x768', '1024x768']) {
  const [w, h] = mida.split('x').map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w <= 1366 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?carril=1', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const bx = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.right.toFixed(1)]; };
    const carril = document.querySelector('[data-capcalera-fila="1"]');
    const vis = document.querySelector('[data-stripe-visual-content="2"]');
    const img = vis ? vis.querySelector('img') : null;
    const caixa = bx(vis);
    const at = (x) => +(caixa[0] + (x / 2866) * (caixa[1] - caixa[0])).toFixed(1);
    const guia = document.querySelector('[data-guia-carril="fletxes"]');
    const alcada = img ? +img.getBoundingClientRect().height.toFixed(1) : null;
    const ample = caixa ? +(caixa[1] - caixa[0]).toFixed(1) : null;
    return { carril: bx(carril), imatge: caixa, alcada, ample, aspecte: ample && alcada ? +(ample / alcada).toFixed(3) : null,
      cintura: [at(65), at(2805)], manigues: [at(4), at(2861)], guiaFletxes: guia ? +guia.getBoundingClientRect().left.toFixed(1) : null };
  });
  console.log(mida, JSON.stringify(r));
  await ctx.close();
}
await b.close();
