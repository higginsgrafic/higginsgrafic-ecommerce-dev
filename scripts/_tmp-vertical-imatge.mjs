import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const peticions = [];
p.on('response', (r) => { const u = r.url(); if (u.includes('stripe') || u.includes('placeholders')) peticions.push(`${r.status()} ${u.split('/').slice(-1)[0]}`); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const d = await p.evaluate(() => {
  const cont = document.querySelector('[data-stripe-visual-content="1"]');
  const imgs = cont ? [...cont.querySelectorAll('img')].map((i) => ({ src: i.getAttribute('src'), nw: i.naturalWidth, nh: i.naturalHeight })) : [];
  const ambFons = cont ? [...cont.querySelectorAll('*')].map((e) => getComputedStyle(e).backgroundImage).filter((v) => v && v !== 'none').slice(0, 3) : [];
  const r = cont ? cont.getBoundingClientRect() : null;
  const cs = getComputedStyle(document.documentElement);
  return {
    contRect: r ? `${Math.round(r.width)}x${Math.round(r.height)}` : null,
    imgs,
    backgrounds: ambFons,
    megaStripeScale: cs.getPropertyValue('--megaStripeScale'),
    fitAlcada: cs.getPropertyValue('--fitAlcada'),
    transform: cont ? getComputedStyle(cont).transform : null,
  };
});
console.log(JSON.stringify(d, null, 1));
console.log('\npeticions amb "stripe" o "placeholders":');
for (const x of peticions.slice(0, 14)) console.log('  ' + x);
await ctx.close();
await b.close();
