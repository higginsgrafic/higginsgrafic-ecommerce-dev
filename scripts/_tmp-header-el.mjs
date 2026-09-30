import { chromium } from '@playwright/test';
const w = 1366, h = 768;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  // Els elements de la franja de dalt (el header) que estan fixos a dalt.
  return [...document.querySelectorAll('header *')].slice(0, 400).filter((el) => {
    const x = el.getBoundingClientRect();
    return x.top < 100 && x.height > 30 && x.height < 90 && x.width > 1000;
  }).slice(0, 8).map((el) => { const x = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 30)}[${[...el.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name).join(',')}] y ${x.top.toFixed(1)} b ${(x.top+x.height).toFixed(1)}`; });
});
console.log(JSON.stringify(r, null, 1));
await b.close();
