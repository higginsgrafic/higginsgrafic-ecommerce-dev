// TEMPORAL (28/09/2026): desde el PRIMER fotograma, totes les pastilles dels
// selectors: quants cops canvia la seva posicio i quantes vegades s'escriu el
// seu `style` (una re-escriptura per fotograma amb `transition: top` es veu com
// una dansa).
// Us: node scripts/_tmp-pastilla-dansa.mjs [actiu]
import { chromium } from '@playwright/test';

const actiu = process.argv[2] || 'first_contact';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

await p.addInitScript(() => {
  window.__t0 = performance.now();
  window.__canvis = [];
  window.__escriptures = 0;
  window.__estat = new Map();
  const marca = () => {
    const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')];
    bars.forEach((bar, i) => {
      const pastilla = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
      if (!pastilla) return;
      const rb = bar.getBoundingClientRect();
      const rp = pastilla.getBoundingClientRect();
      if (rb.height < 5) return;
      const clau = `${(((rp.top - rb.top) / rb.height) * 100).toFixed(3)}|${((rp.height / rb.height) * 100).toFixed(3)}|${((rp.width / rb.width) * 100).toFixed(3)}|${rb.height.toFixed(2)}`;
      const previ = window.__estat.get(i);
      if (previ !== clau) {
        window.__estat.set(i, clau);
        window.__canvis.push({ t: +(performance.now() - window.__t0).toFixed(0), i, clau });
      }
    });
  };
  // Compta les escriptures de l'atribut style de les pastilles.
  const observa = () => {
    document.querySelectorAll('[data-stripe-buttonbar]').forEach((bar) => {
      const pastilla = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
      if (!pastilla || pastilla.__observada) return;
      pastilla.__observada = true;
      new MutationObserver(() => { window.__escriptures += 1; }).observe(pastilla, { attributes: true, attributeFilter: ['style'] });
    });
  };
  const bucle = () => { marca(); observa(); requestAnimationFrame(bucle); };
  bucle();
});

await p.goto(`http://127.0.0.1:3003/nova/inici?active=${actiu}`, { waitUntil: 'commit', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const r = await p.evaluate(() => ({ canvis: window.__canvis, escriptures: window.__escriptures }));
console.log(`canvis de posicio de les pastilles: ${r.canvis.length}`);
console.log('  t(ms)  selector  top%|alt%|ample%|barH');
for (const c of r.canvis.slice(0, 60)) console.log(`  ${String(c.t).padStart(6)}  ${String(c.i).padStart(8)}  ${c.clau}`);
if (r.canvis.length > 60) console.log(`  ... i ${r.canvis.length - 60} mes`);
console.log(`escriptures de l'atribut style de les pastilles: ${r.escriptures}`);
await b.close();
