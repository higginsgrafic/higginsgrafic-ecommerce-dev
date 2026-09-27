// TEMPORAL — no es comiteja. Per que no apareix el vel?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const reqs = [];
p.on('request', (r) => { if (/clic-area/.test(r.url())) reqs.push(r.url()); });
const resp = [];
p.on('response', async (r) => { if (/clic-area/.test(r.url())) { try { resp.push({ url: r.url(), status: r.status() }); } catch { /* ignore */ } } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
console.log('peticions del full de siluetes:', JSON.stringify(reqs));
console.log('respostes:', JSON.stringify(resp));
const r = await p.evaluate(async () => {
  const res = await fetch('/placeholders/cercador/full-clic-area-5.svg');
  const txt = await res.text();
  return { status: res.status, mida: txt.length, paths: (txt.match(/tshirt-outline/g) || []).length, inici: txt.slice(0, 120) };
});
console.log('fetch directe:', JSON.stringify(r));
const imgs = await p.evaluate(() => [...document.querySelectorAll('img')].map((i) => (i.src || '').slice(0, 42)).filter((s) => s.startsWith('data:')));
console.log('imatges data: al DOM:', JSON.stringify(imgs));
await b.close();
