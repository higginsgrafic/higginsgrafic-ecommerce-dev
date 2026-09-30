import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w, h] of [[2560, 1440], [2200, 1200], [1920, 1080], [1800, 1000], [1680, 1050], [1600, 900], [1536, 864], [1440, 900], [1366, 768], [1280, 720], [1200, 800], [1100, 800], [1024, 768], [900, 700], [820, 1180], [768, 1024]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3200);
  const d = await p.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const c = document.createElement('div'); c.style.cssText = 'position:absolute;visibility:hidden;height:0;width:1px'; document.body.appendChild(c);
    const llegir = (v) => { c.style.width = `var(${v}, 0px)`; const x = getComputedStyle(c).width; return Math.round(parseFloat(x)) || 0; };
    const r = { carril: llegir('--inici-nou-carril'), megaBottom: llegir('--hg-mega-bottom'), offset: llegir('--appHeaderOffset') };
    c.remove();
    return r;
  });
  console.log(`${String(w).padStart(4)}x${h}  carril=${String(d.carril).padStart(4)}  capcalera=${d.offset}  megaBottom=${d.megaBottom}  alcadaPanell=${d.megaBottom - d.offset}`);
  await p.close();
}
await b.close();
