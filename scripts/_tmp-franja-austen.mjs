// TEMPORAL — no es comiteja. La franja amb AUSTEN actiu: quines cases son les
// dels marcs i quin fitxer carreguen (404 o be).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const fallades = [];
p.on('response', (r) => { if (r.status() >= 400 && /looking_for_my_darcy/.test(r.url())) fallades.push(`${r.status()} ${r.url().split('/').pop()}`); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  if (!t) return null;
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
const veure = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => {
    const img = t.querySelector('img');
    const src = (img?.currentSrc || '').split('/').pop() || '-';
    const ok = img ? (img.naturalWidth > 0) : null;
    return `${t.getAttribute('data-stripe-tile')}:${src}:${ok === null ? '?' : ok ? 'ok' : 'TRENCADA'}`;
  });
});
console.log('estat inicial:', JSON.stringify(await veure()));
if (q) {
  for (let i = 1; i <= 26; i++) { await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(400); }
  console.log('despres de 26 passos:', JSON.stringify(await veure()));
}
console.log('404 de looking_for_my_darcy:', fallades.length, fallades.slice(0, 5));
await b.close();
