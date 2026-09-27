// TEMPORAL — no es comiteja. La pagina 2 neix quadrada? (mostreig DESPRES de pintar)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1680, 900], [1440, 800], [1366, 768], [1280, 720], [2560, 1306], [1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.evaluate(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      if (v2) {
        const graella = v2.querySelector('[data-carrusel="1"] > div');
        const bar = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
        const peces = graella ? [...graella.querySelectorAll('button')] : [];
        if (bar && peces.length >= 4) {
          const sb = bar.getBoundingClientRect();
          const cella = sb.height / 3;
          const files = [[], []];
          peces.forEach((x, k) => files[k % 2].push(x));
          const c = files.map((f) => { const b2 = f[0].getBoundingClientRect(); return b2.top + b2.height / 2; });
          window.__m.push({
            t: Math.round(performance.now()),
            dev: `${(c[0] - (sb.top + cella / 2)).toFixed(2)}/${(c[1] - (sb.top + cella * 1.5)).toFixed(2)}`,
            ample: peces[0].getBoundingClientRect().width.toFixed(3),
          });
        }
      }
      if (window.__m.length < 300) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(3500);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.dev);
  const claus = new Set(m.map((x) => `${x.dev}|${x.ample}`));
  const primer = m[0] || {};
  console.log(`${String(w).padStart(4)}x${String(h).padEnd(4)}  primer pintat: desviament=${primer.dev} amplada=${primer.ample}  estats pintats distints: ${claus.size}  ${[...claus].join(' | ')}`);
  await ctx.close();
}
await b.close();
