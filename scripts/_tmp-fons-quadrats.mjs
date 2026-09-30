import { chromium } from '@playwright/test';
const w = 1024, h = 768;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1]');
  const cami = [];
  let el = bloc.querySelector('button');
  while (el && el !== v1) {
    const cs = getComputedStyle(el);
    const q = el.getBoundingClientRect();
    cami.push(`${el.tagName.toLowerCase()}[${Math.round(q.left)}..${Math.round(q.right)} x${Math.round(q.width)}] bg=${cs.backgroundColor} radi=${cs.borderRadius} pos=${cs.position}`);
    el = el.parentElement;
  }
  return cami;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
