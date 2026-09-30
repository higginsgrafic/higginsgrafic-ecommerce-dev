// TEMPORAL — quines capes hi ha sota un punt de la franja de la p1.
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
  // Un punt on es veu la vora blanca desalineada de la primera samarreta.
  const punts = [[f.left + 26, f.top + 40], [f.left + 60, f.top + 45], [f.left + 30, f.top + 70]];
  return punts.map(([x, y]) => ({
    punt: [Math.round(x), Math.round(y)],
    capes: document.elementsFromPoint(x, y).slice(0, 6).map((e) => {
      const cs = getComputedStyle(e);
      return {
        tag: e.tagName.toLowerCase(),
        cls: (e.className || '').toString().slice(0, 30),
        data: [...e.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name).join(','),
        src: e.getAttribute && e.getAttribute('src') ? decodeURI(e.getAttribute('src')).split('/').slice(-2).join('/') : '',
        bg: cs.backgroundColor,
        bgIm: cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0, 42),
        z: cs.zIndex,
        mask: (cs.maskImage || cs.webkitMaskImage || 'none').slice(0, 40),
        w: +e.getBoundingClientRect().width.toFixed(1),
      };
    }),
  }));
});
console.log(`${w}x${h}`);
for (const q of r) { console.log(' punt', JSON.stringify(q.punt)); for (const c of q.capes) console.log('    ', JSON.stringify(c)); }
await b.close();
