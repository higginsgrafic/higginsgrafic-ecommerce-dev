// TEMPORAL (28/09/2026): la pastilla blanca del selector BLANC/COLOR/NEGRE de la
// taula vertical de la p2. Mesura si es mou tota sola (en repòs) i on cau en
// clicar cada acabat.
// Us: node scripts/_tmp-pastilla-balla.mjs [segons]
import { chromium } from '@playwright/test';

const segons = Number(process.argv[2] || 3);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

// Tots els selectors BLANC/COLOR/NEGRE que hi hagi, amb la pastilla cadascun.
const llista = await p.evaluate(() => {
  const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')];
  return bars.map((bar, i) => {
    const r = bar.getBoundingClientRect();
    return { i, format: bar.getAttribute('data-stripe-buttonbar-format'), visible: r.width > 5 && r.height > 5, w: +r.width.toFixed(1), h: +r.height.toFixed(1), x: +r.left.toFixed(1), y: +r.top.toFixed(1) };
  });
});
console.log('selectors:', JSON.stringify(llista, null, 1));

const mostreig = (idx, ms) => p.evaluate(async ({ idx, ms }) => {
  const bar = [...document.querySelectorAll('[data-stripe-buttonbar]')][idx];
  const pastilla = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
  const botoActiu = [...bar.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') && getComputedStyle(x).zIndex === '2' && x.querySelector('span') && getComputedStyle(x.querySelector('span')).fontWeight === '400');
  const valors = [];
  const t0 = performance.now();
  return await new Promise((res) => {
    const pas = () => {
      const rp = pastilla.getBoundingClientRect();
      const rb = bar.getBoundingClientRect();
      const ra = botoActiu ? botoActiu.getBoundingClientRect() : null;
      valors.push({
        t: +(performance.now() - t0).toFixed(0),
        top: +(rp.top - rb.top).toFixed(3),
        left: +(rp.left - rb.left).toFixed(3),
        alt: +rp.height.toFixed(3),
        ample: +rp.width.toFixed(3),
        topBoto: ra ? +(ra.top - rb.top).toFixed(3) : null,
        altBoto: ra ? +ra.height.toFixed(3) : null,
        barH: +rb.height.toFixed(3),
        barW: +rb.width.toFixed(3),
      });
      if (performance.now() - t0 >= ms) res(valors);
      else requestAnimationFrame(pas);
    };
    pas();
  });
}, { idx, ms });

const unics = (v, camp) => [...new Set(v.map((x) => x[camp]))];

for (const s of llista) {
  if (!s.visible) continue;
  console.log(`\n=== selector ${s.i} (format ${s.format}) ${s.w} x ${s.h} ===`);
  const v = await mostreig(s.i, segons * 1000);
  for (const camp of ['top', 'left', 'alt', 'ample', 'topBoto', 'altBoto', 'barH', 'barW']) {
    const u = unics(v, camp);
    const nums = u.filter((x) => x !== null);
    const rang = nums.length ? +(Math.max(...nums) - Math.min(...nums)).toFixed(3) : 0;
    console.log(`  ${camp.padEnd(8)} valors distints=${String(u.length).padStart(3)}  rang=${rang}  ${u.length <= 4 ? JSON.stringify(u) : `min=${Math.min(...nums)} max=${Math.max(...nums)}`}`);
  }
  // I en clicar cada acabat.
  const noms = await p.evaluate((i) => [...document.querySelectorAll('[data-stripe-buttonbar]')[i].querySelectorAll('button')].map((x) => x.getAttribute('aria-label')), s.i);
  for (let k = 0; k < noms.length; k += 1) {
    await p.evaluate(({ i, k }) => document.querySelectorAll('[data-stripe-buttonbar]')[i].querySelectorAll('button')[k].click(), { i: s.i, k });
    await p.waitForTimeout(600);
    const r = await p.evaluate((i) => {
      const bar = [...document.querySelectorAll('[data-stripe-buttonbar]')][i];
      const pastilla = [...bar.querySelectorAll('span')].find((x) => getComputedStyle(x).position === 'absolute' && getComputedStyle(x).backgroundColor === 'rgb(255, 255, 255)');
      const rb = bar.getBoundingClientRect(); const rp = pastilla.getBoundingClientRect();
      const bots = [...bar.querySelectorAll('button')].map((x) => { const b = x.getBoundingClientRect(); return { label: x.getAttribute('aria-label'), top: +(b.top - rb.top).toFixed(2), alt: +b.height.toFixed(2) }; });
      return { pastilla: { top: +(rp.top - rb.top).toFixed(2), alt: +rp.height.toFixed(2) }, bots };
    }, s.i);
    const boto = r.bots[k];
    console.log(`  clic ${String(noms[k]).padEnd(7)} pastilla top=${String(r.pastilla.top).padStart(7)} alt=${String(r.pastilla.alt).padStart(6)} | boto top=${String(boto.top).padStart(7)} alt=${boto.alt}  desviacio=${(r.pastilla.top - boto.top).toFixed(2)}`);
  }
}
await b.close();
