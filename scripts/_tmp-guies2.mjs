import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => [...document.querySelectorAll('[data-guia-carril], [data-guia-carril-pagina]')].map((el) => { const q = el.getBoundingClientRect(); return `${el.getAttribute('data-guia-carril') || el.getAttribute('data-guia-carril-pagina')}: x=${Math.round(q.left)} color=${getComputedStyle(el).borderLeftColor}`; }));
console.log(`${w}x${h}`, JSON.stringify(r, null, 0));
await b.close();
