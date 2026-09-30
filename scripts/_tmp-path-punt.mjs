// TEMPORAL — quin es el <path> que es pinta a sobre de la franja de la p1.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1366), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
await p.evaluate(() => {
  const el = document.querySelector('[data-mega-page-viewport="1"]');
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
  const f = fr.getBoundingClientRect();
  const cami = (e) => { const out = []; let x = e; while (x && x !== document.body) { const cs = getComputedStyle(x); out.push(`${x.tagName.toLowerCase()}${x.getAttribute && x.getAttribute('src') ? '(' + decodeURI(x.getAttribute('src')).split('/').pop() + ')' : ''} w=${Math.round(x.getBoundingClientRect().width)} h=${Math.round(x.getBoundingClientRect().height)} z=${cs.zIndex} fill=${cs.fill} disp=${cs.display}`); x = x.parentElement; } return out; };
  const path = document.elementsFromPoint(f.left + 26, f.top + 40).find((e) => e.tagName.toLowerCase() === 'path');
  return {
    path: path ? { d: (path.getAttribute('d') || '').slice(0, 60), fill: getComputedStyle(path).fill, n: path.parentElement ? path.parentElement.children.length : 0, cami: cami(path) } : null,
    svgs: [...fr.querySelectorAll('svg')].map((s) => { const x = s.getBoundingClientRect(); return { vb: s.getAttribute('viewBox'), w: +x.width.toFixed(1), h: +x.height.toFixed(1), x: +x.left.toFixed(1), paths: s.querySelectorAll('path').length, fill: getComputedStyle(s).fill }; }),
  };
});
console.log(`${w}x${h}`);
console.log(' path:', JSON.stringify(r.path));
console.log(' svgs dins la franja:', JSON.stringify(r.svgs));
await b.close();
