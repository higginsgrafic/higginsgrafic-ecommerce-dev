import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('a.hover\\:scale-110, a[class*="scale-110"]').forEach((el) => {
    const rr = el.getBoundingClientRect();
    const c = [];
    let x = el;
    while (x && x !== document.body && c.length < 10) {
      const dat = [...x.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `${a.name}=${String(a.value).slice(0, 16)}`);
      c.push(`${x.tagName}${(x.className || '').toString().trim().split(/\s+/).slice(0, 2).join('.')}${dat.length ? `[${dat.join(' ')}]` : ''}`);
      x = x.parentElement;
    }
    out.push({ text: (el.textContent || '').trim().slice(0, 22), rect: `${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}`, z: getComputedStyle(el).zIndex, href: el.getAttribute('href'), cadena: c });
  });
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
