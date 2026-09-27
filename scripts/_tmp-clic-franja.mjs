// TEMPORAL — no es comiteja. Clicar una samarreta de la FRANJA recarrega la
// pagina? Es mesura si el document es torna a carregar i si la marca sobreviu.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const ev = [];
p.on('load', () => ev.push({ t: Date.now(), que: 'load', url: p.url() }));
p.on('framenavigated', (f) => { if (f === p.mainFrame()) ev.push({ t: Date.now(), que: 'navegacio', url: f.url() }); });
p.on('pageerror', (e) => ev.push({ que: 'error', text: String(e).slice(0, 120) }));

await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__marca = 'hi-soc'; window.__loads = 0; window.addEventListener('load', () => { window.__loads += 1; }); });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
const abans = await p.evaluate(() => ({ marca: window.__marca, loads: window.__loads, url: location.href }));
console.log('abans de clicar:', JSON.stringify(abans));

// Clic a la casa 5 de la franja (una samarreta activa).
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="5"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(3500);
const despres = await p.evaluate(() => ({ marca: window.__marca ?? null, loads: window.__loads ?? null, url: location.href }));
console.log('despres de clicar:', JSON.stringify(despres));
console.log('marca sobreviu?', despres.marca === 'hi-soc' ? 'SI (navegacio SPA)' : 'NO (recarrega de pagina)');
console.log('esdeveniments:', JSON.stringify(ev.filter((x) => x.que !== 'error'), null, 1));
await b.close();
