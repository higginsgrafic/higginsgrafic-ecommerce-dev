// TEMPORAL (28/09/2026): que fa la pastilla del selector BLANC/COLOR/NEGRE quan
// es clica l'enllaç LOOKING FOR MY DARCY (nome's existeix en color).
// Us: node scripts/_tmp-pastilla-darcy.mjs [ms]
import { chromium } from '@playwright/test';

const ms = Number(process.argv[2] || 5000);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 90)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const estat = () => p.evaluate(() => {
  const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')];
  const bar = bars.find((x) => { const r = x.getBoundingClientRect(); return r.width > 5 && r.height > 5; });
  if (!bar) return null;
  const pastilla = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
  const rb = bar.getBoundingClientRect();
  const rp = pastilla ? pastilla.getBoundingClientRect() : null;
  return {
    pillTopPct: rp ? +(((rp.top - rb.top) / rb.height) * 100).toFixed(2) : null,
    pillAltPct: rp ? +((rp.height / rb.height) * 100).toFixed(2) : null,
    barH: +rb.height.toFixed(2),
    styleAttr: pastilla ? pastilla.getAttribute('style') : null,
    buttons: [...bar.querySelectorAll('button')].map((x) => ({
      label: x.getAttribute('aria-label'),
      disabled: !!x.disabled,
      pes: getComputedStyle(x.querySelector('span')).fontWeight,
      topPct: +(((x.getBoundingClientRect().top - rb.top) / rb.height) * 100).toFixed(2),
    })),
  };
});

console.log('--- ABANS de clicar ---');
console.log(JSON.stringify(await estat(), null, 1));

const idx = await p.evaluate(() => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
  .findIndex((x) => x.textContent.trim().toUpperCase().startsWith('LOOKING')));
console.log(`\nclic a la colleccio idx ${idx} (LOOKING FOR MY D...)`);

// Mostreig continu des del clic.
const serie = await p.evaluate(async ({ idx, ms }) => {
  const boto = document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[idx];
  const bar = () => [...document.querySelectorAll('[data-stripe-buttonbar]')].find((x) => { const r = x.getBoundingClientRect(); return r.width > 5 && r.height > 5; });
  const t0 = performance.now();
  const mostres = [];
  boto.click();
  return await new Promise((res) => {
    const pas = () => {
      const bb = bar();
      if (bb) {
        const pa = [...bb.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
        const rb = bb.getBoundingClientRect();
        const rp = pa ? pa.getBoundingClientRect() : null;
        mostres.push({
          t: +(performance.now() - t0).toFixed(0),
          topPct: rp ? +(((rp.top - rb.top) / rb.height) * 100).toFixed(2) : null,
          altPct: rp ? +((rp.height / rb.height) * 100).toFixed(2) : null,
          barH: +rb.height.toFixed(2),
          desactivats: [...bb.querySelectorAll('button')].filter((x) => x.disabled).map((x) => x.getAttribute('aria-label')).join(','),
        });
      }
      if (performance.now() - t0 >= ms) res(mostres);
      else requestAnimationFrame(pas);
    };
    pas();
  });
}, { idx, ms });

// Els trams amb valors distints.
const trams = [];
let act = null;
for (const m of serie) {
  const clau = `${m.topPct}|${m.altPct}|${m.barH}|${m.desactivats}`;
  if (!act || act.clau !== clau) { act = { clau, des: m.t, fins: m.t, ...m }; trams.push(act); } else { act.fins = m.t; }
}
console.log(`\nmostres: ${serie.length}, trams distints: ${trams.length}`);
console.log('  t_inici  t_fi   topPct  altPct   barH   desactivats');
for (const t of trams) console.log(`  ${String(t.des).padStart(6)} ${String(t.fins).padStart(6)} ${String(t.topPct).padStart(7)} ${String(t.altPct).padStart(7)} ${String(t.barH).padStart(7)}   ${t.desactivats}`);

console.log('\n--- DESPRES ---');
console.log(JSON.stringify(await estat(), null, 1));
console.log('errors:', errors.length ? errors.join(' | ') : 'cap');
await b.close();
