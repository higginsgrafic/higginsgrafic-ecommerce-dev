// TEMPORAL: les dues coses que ha demanat en Marc al visor.
//   1) clicar una vista -> anar a la seva pestanya
//   2) canviar el path de TOTES alhora
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/browser-overlay.html', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(9000);

const estat = () => p.evaluate(() => ({
  activa: document.querySelector('.pestanya.activa')?.textContent?.trim().slice(0, 24),
  rutaBarra: document.getElementById('ruta').value,
  placeholder: document.getElementById('ruta').placeholder,
  desactivat: document.getElementById('ruta').disabled,
  srcs: [...document.querySelectorAll('.marc')].map((m) => ({
    nom: m.querySelector('.nom')?.textContent,
    src: m.querySelector('iframe')?.getAttribute('src'),
    franja: getComputedStyle(m.querySelector('.franja')).opacity,
    viu: m.classList.contains('carregat'),
  })),
}));

console.log('── ESTAT INICIAL ──');
console.log(JSON.stringify(await estat(), null, 1));

// ── 1) CLIC A LA FRANJA DE LA VORA ESQUERRA D'UNA VISTA ──
await p.mouse.move(600, 400);   // acostar-s'hi primer, com fa un huma
await p.waitForTimeout(400);
const c = await p.evaluate(() => {
  const m = document.querySelectorAll('.marc')[0];
  const r = m.querySelector('.franja').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, nom: m.querySelector('.nom')?.textContent };
});
console.log(`\n── 1) CLIC A LA FRANJA ESQUERRA de «${c.nom}» (${Math.round(c.x)}, ${Math.round(c.y)}) ──`);
await p.mouse.click(c.x, c.y);
await p.waitForTimeout(1800);
const e1 = await estat();
console.log('   pestanya activa ara:', e1.activa);

// Tornem a la Principal per provar la ruta.
await p.evaluate(() => document.querySelector('.pestanya.principal').click());
await p.waitForTimeout(2500);

// ── 2) RUTA PER A TOTES ──
console.log('\n── 2) RUTA PER A TOTES (des de la Principal) ──');
await p.locator('#ruta').fill('/nova/inici');
await p.locator('#ruta').press('Enter');
await p.waitForTimeout(6000);
const e2 = await estat();
console.log('   valor de la barra:', JSON.stringify(e2.rutaBarra), ' placeholder:', JSON.stringify(e2.placeholder), ' desactivat:', e2.desactivat);
console.log('   rutes de cada vista:');
for (const m of e2.srcs) console.log(`     ${String(m.nom).padEnd(20)} ${m.src}   (captura: ${m.captura})`);
const totes = e2.srcs.every((m) => (m.src || '').includes('/nova/inici'));
console.log('   >> TOTES han canviat a /nova/inici:', totes ? 'SI' : 'NO');

console.log('\n=== ERRORS DE CONSOLA ===');
console.log(errors.length ? errors.join('\n') : 'cap error');
await ctx.close();
await b.close();
