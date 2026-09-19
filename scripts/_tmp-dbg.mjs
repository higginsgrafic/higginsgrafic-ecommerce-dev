import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3007/?active=first_contact', { waitUntil: 'load' });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(()=>{});
await p.waitForTimeout(6000);
const r = await p.evaluate(async () => {
  const t = document.querySelector('[data-vertical-samarreta="0"]');
  const cs = getComputedStyle(t);
  const img = new Image();
  const carrega = await new Promise((res) => {
    img.onload = () => res({ ok: true, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => res({ ok: false });
    img.src = '/placeholders/tablet%20vertical/stripe-curta-7%2B7.png';
  });
  const b = t.getBoundingClientRect();
  return {
    imatge: carrega,
    fons: { image: cs.backgroundImage.slice(0, 90), size: cs.backgroundSize, pos: cs.backgroundPosition, repeat: cs.backgroundRepeat },
    casella: { w: Math.round(b.width), h: Math.round(b.height) },
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
