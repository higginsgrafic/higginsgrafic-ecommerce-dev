// TEMPORAL: (a) l'arrossegament de la tira encara funciona? (b) es pot veure la
// taula de la pagina 1 per auditar-la?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

console.log('pe de la fila d arrossegament:', await p.evaluate(() => {
  const el = document.querySelector('#stripe-guide-stripe-row');
  return el ? getComputedStyle(el).pointerEvents : 'no hi es';
}));

// (a) Arrossega la tira: el dibuix de la primera casa ha de canviar.
const itemAbans = await p.evaluate(() => {
  const t = document.querySelector('[data-taula-vertical="2"] [data-stripe-tile]');
  return t && t.getAttribute('data-stripe-item');
});
const punt = await p.evaluate(() => {
  const el = document.querySelector('#stripe-guide-stripe-row');
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await p.mouse.move(punt.x, punt.y);
await p.mouse.down();
for (let i = 1; i <= 8; i += 1) { await p.mouse.move(punt.x - i * 15, punt.y); await p.waitForTimeout(30); }
await p.mouse.up();
await p.waitForTimeout(900);
const itemDespres = await p.evaluate(() => {
  const t = document.querySelector('[data-taula-vertical="2"] [data-stripe-tile]');
  return t && t.getAttribute('data-stripe-item');
});
console.log(`arrossegament: item abans=${itemAbans} despres=${itemDespres}  ${itemAbans !== itemDespres ? 'OK (la tira s ha mogut)' : 'NO s ha mogut'}`);

// (b) Les taules: on cau cadascuna?
const taules = await p.evaluate(() => [...document.querySelectorAll('[data-taula-vertical]')].map((t) => {
  const r = t.getBoundingClientRect();
  return { pagina: t.getAttribute('data-taula-vertical'), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
}));
console.log('taules:', JSON.stringify(taules));
await b.close();
