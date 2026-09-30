// TEMPORAL: la franja, mirada amb FIREFOX (el navegador de l'amo).
import { firefox } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await firefox.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/browser-overlay.html', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(12000);

const d = await p.evaluate(() => {
  const m = document.querySelectorAll('.marc')[0];
  const f = m.querySelector('.franja');
  const c = m.querySelector('.caixa');
  const cs = getComputedStyle(f);
  const rf = f.getBoundingClientRect();
  const rc = c.getBoundingClientRect();
  return {
    finestra: `${window.innerWidth}x${window.innerHeight}`,
    franjaComputed: { width: cs.width, height: cs.height, top: cs.top, left: cs.left, bottom: cs.bottom, position: cs.position },
    franjaCaixa: `${Math.round(rf.left)},${Math.round(rf.top)} ${Math.round(rf.width)}x${Math.round(rf.height)}`,
    caixaDeLaVista: `${Math.round(rc.left)},${Math.round(rc.top)} ${Math.round(rc.width)}x${Math.round(rc.height)}`,
    franjaEsTotaLaVista: Math.abs(rf.width - rc.width) < 2,
  };
});
console.log(JSON.stringify(d, null, 1));

// Captura amb el ratoli A SOBRE la vista (perque la franja surti).
const mig = await p.evaluate(() => { const r = document.querySelectorAll('.marc')[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await p.mouse.move(mig.x, mig.y);
await p.waitForTimeout(800);
writeFileSync('_tmp-visor-firefox.png', await p.screenshot());
console.log('captura: _tmp-visor-firefox.png');
console.log('errors:', errors.length ? errors.join(' | ') : 'cap');
await ctx.close();
await b.close();
