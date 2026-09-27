// TEMPORAL — la p1: qui aclareix les samarretes?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const franja = v.querySelector('[data-stripe-visual-content="1"]');
  const out = { imgs: [], maskes: [] };
  for (const im of franja.querySelectorAll('img')) {
    const cs = getComputedStyle(im);
    out.imgs.push({ src: (im.getAttribute('src') || '').slice(0, 48), z: cs.zIndex, op: cs.opacity, vis: cs.visibility });
  }
  for (const el of [franja, ...franja.querySelectorAll('*')]) {
    const cs = getComputedStyle(el);
    const m = cs.maskImage || cs.webkitMaskImage || 'none';
    if (!m || m === 'none') continue;
    out.maskes.push({ classe: String(el.className).slice(0, 20), size: cs.maskSize, mode: cs.maskMode, mask: m.slice(0, 90), op: cs.opacity });
  }
  // la cadena de pares de la imatge de la franja: mascares i opacitats
  const tinta = [...franja.querySelectorAll('img')].find((i) => /stripe\.(webp|png)/.test(i.getAttribute('src') || ''));
  const cami = [];
  let e = tinta;
  for (let k = 0; k < 8 && e && e !== v; k++) {
    const cs = getComputedStyle(e);
    cami.push(`${e.tagName}.${String(e.className || '').slice(0, 14)} op=${cs.opacity} mask=${(cs.maskImage || 'none').slice(0, 30)} z=${cs.zIndex}`);
    e = e.parentElement;
  }
  out.cami = cami;
  return out;
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
