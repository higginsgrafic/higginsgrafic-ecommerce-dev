// TEMPORAL — no es comiteja. Segueix les cases dels MARC mentre la tira roda i
// apunta quines imatges de marc apareixen i si carreguen.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const fallades = [];
p.on('response', (r) => { if (r.status() >= 400) fallades.push(`${r.status()} ${r.url().split('/').slice(-2).join('/')}`); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
const marcs = new Map();
for (let i = 0; i <= 70; i++) {
  const v = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    return [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => {
      const img = t.querySelector('img');
      return { src: (img?.currentSrc || '').split('/').pop() || '-', ok: img ? img.naturalWidth > 0 : null };
    });
  });
  for (const x of v) if (/frame|solid/.test(x.src) && x.src.endsWith('-stripe.webp')) marcs.set(x.src, x.ok);
  if (i < 70) { await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(320); }
}
for (const [src, ok] of [...marcs.entries()].sort()) console.log(`${ok ? 'ok  ' : 'TRENCADA'} ${src}`);
console.log('respostes >=400:', fallades.length, fallades.slice(0, 4));
await b.close();
