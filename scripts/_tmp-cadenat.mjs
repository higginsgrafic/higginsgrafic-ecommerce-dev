// TEMPORAL — el cadenat: on cau respecte la vora dreta del carril.
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1024, 768]];

const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(6000);
    const r = await p.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const carrilX = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
      const carrilW = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
      const btn = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('megaslide'));
      const img = btn ? btn.querySelector('img') : null;
      return {
        carril: [+carrilX.toFixed(1), +(carrilX + carrilW).toFixed(1)],
        btn: btn ? [+btn.getBoundingClientRect().left.toFixed(1), +btn.getBoundingClientRect().right.toFixed(1), +btn.getBoundingClientRect().top.toFixed(1), +btn.getBoundingClientRect().bottom.toFixed(1)] : null,
        src: img ? img.getAttribute('src') : null,
        imgW: img ? +img.getBoundingClientRect().width.toFixed(1) : null,
        imgH: img ? +img.getBoundingClientRect().height.toFixed(1) : null,
        label: btn ? btn.getAttribute('aria-label') : null,
      };
    });
    const dreta = r.btn ? (r.carril[1] - r.btn[1]).toFixed(1) : 'n/a';
    console.log(`${w}x${h}  carril dreta ${r.carril[1]}  cadenat ${JSON.stringify(r.btn)} (${r.imgW}x${r.imgH})  src=${r.src}`);
    console.log(`     vora dreta del cadenat - vora dreta del carril = ${dreta} px   label="${r.label}"  errors=${errors.length}${errors.length ? ' :: ' + errors[0] : ''}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
