// TEMPORAL: la franja de la vora esquerra.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/browser-overlay.html', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(9000);

const franja = (i) => p.evaluate((i) => {
  const m = document.querySelectorAll('.marc')[i];
  const f = m.querySelector('.franja');
  const r = f.getBoundingClientRect();
  return {
    nom: m.querySelector('.nom')?.textContent,
    display: getComputedStyle(f).display,
    opacity: getComputedStyle(f).opacity,
    caixa: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`,
    text: f.textContent,
  };
}, i);

console.log('A) SENSE tocAR-HI (el ratoli lluny):');
console.log('   ', JSON.stringify(await franja(0)));

// Acostar-s'hi: posem el ratoli al mig de la primera vista.
const mig = await p.evaluate(() => { const r = document.querySelectorAll('.marc')[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await p.mouse.move(mig.x, mig.y);
await p.waitForTimeout(600);
console.log('\nB) AMB EL RATOLI SOBRE LA VISTA:');
console.log('   ', JSON.stringify(await franja(0)));
writeFileSync('_tmp-visor-franja.png', await p.screenshot());

// Clicar la FRANJA (vora esquerra).
const c = await p.evaluate(() => { const r = document.querySelectorAll('.marc')[0].querySelector('.franja').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
console.log(`\nC) CLIC A LA FRANJA (${Math.round(c.x)}, ${Math.round(c.y)}):`);
await p.mouse.click(c.x, c.y);
await p.waitForTimeout(2500);
console.log('   pestanya activa:', await p.evaluate(() => document.querySelector('.pestanya.activa')?.textContent?.trim().slice(0, 22)));
console.log('   franja a la seva pestanya:', JSON.stringify(await franja(0)));

// Tornem a la Principal i provem que el CENTRE no navega.
await p.evaluate(() => document.querySelector('.pestanya.principal').click());
await p.waitForTimeout(2500);
const mig2 = await p.evaluate(() => { const r = document.querySelectorAll('.marc')[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
const aDalt = await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e?.tagName + '.' + (e?.className || ''); }, mig2);
await p.mouse.click(mig2.x, mig2.y);
await p.waitForTimeout(1800);
console.log('\nD) CLIC AL CENTRE DE LA VISTA:');
console.log('   element que hi toca:', aDalt);
console.log('   pestanya activa:', await p.evaluate(() => document.querySelector('.pestanya.activa')?.textContent?.trim().slice(0, 22)));

console.log('\n=== ERRORS DE CONSOLA ===');
console.log(errors.length ? errors.join('\n') : 'cap error');
await ctx.close();
await b.close();
