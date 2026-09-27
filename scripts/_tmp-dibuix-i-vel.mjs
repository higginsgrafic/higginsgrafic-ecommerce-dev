// TEMPORAL — no es comiteja. Casa per casa: dibuix (opacitat i posicio) i tinta del vel.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const actius = (process.argv[2] || 'miscellania').split(',');
const [w, h] = (process.argv[3] || '1920x946').split('x').map(Number);
for (const act of actius) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(1500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4500);
  const r = await p.evaluate(async () => {
    const taula = document.querySelector('[data-taula-vertical="2"]');
    const franja = (taula || document.querySelector('[data-mega-page-viewport="2"]')).querySelector('[data-stripe-visual-content="2"]');
    const rf = franja.getBoundingClientRect();
    // la tinta del vel per casa: dibuixem la imatge del vel en un canvas
    const velImg = [...franja.querySelectorAll('img')].find((im) => {
      const s = im.getAttribute('src') || '';
      return s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s));
    });
    let tinta = null;
    if (velImg) {
      const im = new Image();
      im.src = velImg.getAttribute('src');
      await im.decode();
      const c = document.createElement('canvas');
      c.width = 2866; c.height = 307;
      const g = c.getContext('2d');
      g.clearRect(0, 0, 2866, 307);
      g.drawImage(im, 0, 0, 2866, 307);
      const d = g.getImageData(0, 0, 2866, 307).data;
      tinta = [];
      const pas = 2866 / 14;
      for (let k = 0; k < 14; k++) {
        let n = 0;
        for (let x = Math.floor(k * pas); x < Math.floor((k + 1) * pas); x++) {
          for (let y = 0; y < 307; y++) { if (d[(y * 2866 + x) * 4 + 3] > 25) n += 1; }
        }
        tinta.push(n);
      }
    }
    const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => {
      const img = el.querySelector('img');
      const cs = img ? getComputedStyle(img) : null;
      const cs2 = img && img.parentElement ? getComputedStyle(img.parentElement) : null;
      const rr = el.getBoundingClientRect();
      const ri = img ? img.getBoundingClientRect() : null;
      return {
        i: Number(el.getAttribute('data-stripe-tile')),
        c: el.getAttribute('data-stripe-collection'),
        op: cs ? cs.opacity : null,
        pop: cs2 ? cs2.opacity : null,
        src: img ? String(img.getAttribute('src')).split('/').slice(-1)[0].slice(0, 24) : '',
        casaX: +(rr.left - rf.left).toFixed(1),
        casaW: +rr.width.toFixed(1),
        dibX: ri ? +(ri.left - rf.left).toFixed(1) : null,
        dibW: ri ? +ri.width.toFixed(1) : null,
        dibY: ri ? +(ri.top - rf.top).toFixed(1) : null,
        dibH: ri ? +ri.height.toFixed(1) : null,
      };
    }).sort((a, b2) => a.i - b2.i);
    return { tinta, cases, franjaW: +rf.width.toFixed(1), franjaH: +rf.height.toFixed(1) };
  });
  console.log(`\n=== active=${act} ${w}x${h} franja ${r.franjaW}x${r.franjaH} tinta per casa: ${r.tinta ? r.tinta.join(' ') : 'sense vel'}`);
  for (const c of r.cases) {
    const vel = r.tinta ? (r.tinta[c.i] > 500 ? 'VEL' : '   ') : ' ? ';
    const toca = c.c && c.c !== act;
    const opac = c.pop === '0.12' ? 'fluix' : (c.pop === '1' ? 'viu  ' : `op${c.pop}`);
    const mal = (toca && c.pop !== '0.12') || (!toca && c.pop === '0.12') ? ' <-- OPACITAT' : '';
    console.log(`  casa ${String(c.i).padStart(2)} ${String(c.c).padEnd(16)} ${opac} ${vel} dibuix x${c.dibX} w${c.dibW} (casa x${c.casaX} w${c.casaW}) y${c.dibY} h${c.dibH} ${c.src}${mal}`);
  }
  await ctx.close();
}
await b.close();
