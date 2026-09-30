import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/browser-overlay.html', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(9000);
const d = await p.evaluate(() => {
  const v = document.getElementById('versio');
  const f = document.querySelectorAll('.marc')[0].querySelector('.franja');
  const r = f.getBoundingClientRect();
  const c = document.querySelectorAll('.marc')[0].querySelector('.caixa').getBoundingClientRect();
  return {
    versio: v?.textContent,
    ampladaDeLaFranja: Math.round(r.width),
    alcadaDeLaFranja: Math.round(r.height),
    ampladaDeLaVista: Math.round(c.width),
    alcadaDeLaVista: Math.round(c.height),
    proporcioAmplada: (r.width / c.width).toFixed(4),
  };
});
console.log(JSON.stringify(d, null, 1));
const mig = await p.evaluate(() => { const r = document.querySelectorAll('.marc')[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await p.mouse.move(mig.x, mig.y);
await p.waitForTimeout(700);
writeFileSync('_tmp-visor-franja.png', await p.screenshot());
console.log('captura: _tmp-visor-franja.png');
await ctx.close();
await b.close();
