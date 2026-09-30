// TEMPORAL — que hi ha dins de cada franja de samarretes (p1 i p2)?
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const r = await p.evaluate(() => {
  const desc = (el) => {
    const x = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().slice(0, 42),
      data: [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name).join(','),
      x: +x.left.toFixed(1), w: +x.width.toFixed(1), y: +x.top.toFixed(1), h: +x.height.toFixed(1),
      imgs: el.querySelectorAll('img').length,
      bg: cs.backgroundImage === 'none' ? '' : 'bg-img',
      z: cs.zIndex, op: cs.opacity, disp: cs.display,
    };
  };
  const files = [];
  for (const vp of document.querySelectorAll('[data-mega-page-viewport]')) {
    const pagina = vp.getAttribute('data-mega-page-viewport');
    for (const fr of vp.querySelectorAll('[data-stripe-visual-content]')) {
      const caps = [...fr.children].map(desc);
      files.push({ pagina, fr: desc(fr), fills: caps, imgsTotal: fr.querySelectorAll('img').length, divsTotal: fr.querySelectorAll('div').length });
    }
  }
  return files;
});
console.log(`${w}x${h}`);
for (const f of r) {
  console.log(` pagina ${f.pagina}: franja ${f.fr.x}->${(f.fr.x + f.fr.w).toFixed(1)} (${f.fr.w}) y ${f.fr.y} h ${f.fr.h} imgs=${f.imgsTotal} divs=${f.divsTotal}`);
  for (const c of f.fills) console.log('    ', JSON.stringify(c));
}
await b.close();
