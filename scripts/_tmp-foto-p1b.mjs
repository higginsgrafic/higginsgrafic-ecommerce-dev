// TEMPORAL — porta la pagina 1 a la vista forcant el transform del seu pare i captura.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1366), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const info = await p.evaluate(() => {
  let el = document.querySelector('[data-mega-page-viewport="1"]');
  let pare = el.parentElement;
  while (pare && getComputedStyle(pare).transform === 'none' && pare !== document.body) pare = pare.parentElement;
  const v1 = el.getBoundingClientRect();
  const actual = getComputedStyle(pare).transform;
  const m = actual === 'none' ? null : actual.match(/matrix\(([^)]+)\)/);
  const tx = m ? Number(m[1].split(',')[4]) : 0;
  pare.style.transform = `translateX(${tx - v1.left}px)`;
  return { pare: `${pare.tagName.toLowerCase()}`, transform: actual, tx, v1Left: v1.left, nou: pare.style.transform };
});
await p.waitForTimeout(400);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const x = v1.getBoundingClientRect();
  const fr = v1.querySelector('[data-stripe-visual-content="1"]');
  const f = fr.getBoundingClientRect();
  return { v1: { x: Math.round(x.left), y: Math.round(x.top), width: Math.round(x.width), height: Math.round(x.height) }, franja: { x: Math.round(f.left), y: Math.round(f.top), w: Math.round(f.width), h: Math.round(f.height) } };
});
console.log(`${w}x${h}`, JSON.stringify(info), JSON.stringify(r));
await p.screenshot({ path: `/tmp/p1b-${w}.png`, clip: { x: Math.max(0, r.v1.x), y: Math.max(0, r.v1.y), width: Math.min(w - Math.max(0, r.v1.x), r.v1.width), height: Math.max(20, Math.min(h - Math.max(0, r.v1.y), r.franja.y - r.v1.y + r.franja.h + 20)) } });
console.log(`/tmp/p1b-${w}.png`);
await ctx.close(); await b.close();
