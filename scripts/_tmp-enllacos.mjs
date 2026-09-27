// TEMPORAL — no es comiteja. Els marges de la columna de colleccions.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306], [1680, 900], [2000, 1000], [1400, 900], [1366, 768], [1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const filera = v2.querySelector('[data-p2-cercador-row]');
    const pill = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const cs = getComputedStyle(document.documentElement);
    const f = filera.getBoundingClientRect();
    return {
      dalt: +(f.top - pill.getBoundingClientRect().top).toFixed(3),
      baix: +(franja.getBoundingClientRect().bottom - f.bottom).toFixed(3),
      fileraH: +f.height.toFixed(3),
      carril: Number.parseFloat(cs.getPropertyValue('--hg-mega-w')) || null,
      escala: Number.parseFloat(cs.getPropertyValue('--hg-escala-mega')) || null,
    };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} dalt ${String(r.dalt).padStart(8)} baix ${String(r.baix).padStart(8)} | fileraH ${r.fileraH} carril ${r.carril} escala ${r.escala && r.escala.toFixed(4)}`);
  await ctx.close();
}
await b.close();
