// TEMPORAL — zoom a la franja de samarretes de la p1 (pagina 1 forçada a la vista).
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1366), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
await p.evaluate(() => {
  let el = document.querySelector('[data-mega-page-viewport="1"]');
  let pare = el.parentElement;
  while (pare && getComputedStyle(pare).transform === 'none' && pare !== document.body) pare = pare.parentElement;
  const v1 = el.getBoundingClientRect();
  const m = getComputedStyle(pare).transform.match(/matrix\(([^)]+)\)/);
  const tx = m ? Number(m[1].split(',')[4]) : 0;
  pare.style.transform = `translateX(${tx - v1.left}px)`;
});
await p.waitForTimeout(400);
const r = await p.evaluate(() => {
  const fr = document.querySelector('[data-mega-page-viewport="1"] [data-stripe-visual-content="1"]');
  const x = fr.getBoundingClientRect();
  // Només la meitat esquerra, que es on es veu el doble.
  return { x: Math.max(0, Math.round(x.left) - 4), y: Math.max(0, Math.round(x.top) - 4), width: Math.round(x.width / 2.2), height: Math.round(x.height) + 8 };
});
await p.screenshot({ path: `/tmp/franja-p1-${w}.png`, clip: r });
console.log(`/tmp/franja-p1-${w}.png`, r);
await ctx.close(); await b.close();
