// TEMPORAL (28/09/2026): que li passa a la pastilla del selector visible en
// clicar LOOKING FOR MY DARCY: escriptures de l'estil, transicions vives i
// valors computats.
// Us: node scripts/_tmp-pastilla-detall.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

// El selector VISIBLE: el que cau dins la pantalla i te la pastilla mes ampla.
const idxBar = await p.evaluate(() => {
  const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')];
  let millor = -1; let area = 0;
  bars.forEach((bar, i) => {
    const r = bar.getBoundingClientRect();
    if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) return;
    if (r.width * r.height > area) { area = r.width * r.height; millor = i; }
  });
  return millor;
});
console.log('selector visible:', idxBar);

const detall = await p.evaluate(async (i) => {
  const bar = [...document.querySelectorAll('[data-stripe-buttonbar]')][i];
  const pa = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
  const registre = { escriptures: [], computed: [], transicions: [] };
  const abans = {
    inline: pa.style.top,
    computed: getComputedStyle(pa).top,
    transicio: getComputedStyle(pa).transition,
    animacions: pa.getAnimations().map((a) => ({ prop: a.transitionProperty, estat: a.playState, t: a.currentTime })),
  };
  const obs = new MutationObserver(() => {
    registre.escriptures.push({ t: Math.round(performance.now()), top: pa.style.top, computed: getComputedStyle(pa).top });
  });
  obs.observe(pa, { attributes: true, attributeFilter: ['style'] });
  // Clica la colleccio DARCY des de dins.
  const links = [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')];
  const k = links.findIndex((x) => x.textContent.trim().toUpperCase().startsWith('LOOKING'));
  links[k].click();
  const t0 = performance.now();
  await new Promise((res) => {
    const pas = () => {
      registre.computed.push({ t: Math.round(performance.now() - t0), computed: getComputedStyle(pa).top, inline: pa.style.top, anim: pa.getAnimations().length });
      if (performance.now() - t0 > 2500) res();
      else requestAnimationFrame(pas);
    };
    pas();
  });
  obs.disconnect();
  const despres = {
    inline: pa.style.top,
    computed: getComputedStyle(pa).top,
    animacions: pa.getAnimations().map((a) => ({ prop: a.transitionProperty, estat: a.playState, t: Math.round(a.currentTime) })),
  };
  // Els avantpassats: algu que no es pinti?
  const cadenes = [];
  let el = pa;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    cadenes.push({
      q: `${el.tagName}.${(el.className || '').toString().slice(0, 24)}`,
      display: cs.display, visibility: cs.visibility, contentVisibility: cs.contentVisibility,
      contain: cs.contain, position: cs.position, filter: cs.filter === 'none' ? null : 'si',
      willChange: cs.willChange === 'auto' ? null : cs.willChange,
    });
    el = el.parentElement;
  }
  const compDistints = [...new Set(registre.computed.map((c) => c.computed))];
  return { abans, despres, escriptures: registre.escriptures, compDistints, mostres: registre.computed.length, cadenes };
}, idxBar);

console.log('\nABANS:', JSON.stringify(detall.abans, null, 1));
console.log('\nESCRIPTURES DE L\'ESTIL:', JSON.stringify(detall.escriptures, null, 1));
console.log('\nVALORS COMPUTATS DISTINTS durant 2,5 s:', JSON.stringify(detall.compDistints), `(${detall.mostres} mostres)`);
console.log('\nDESPRES:', JSON.stringify(detall.despres, null, 1));
console.log('\nCADENA D AVANTPASSATS (nome\'s els que no son normals):');
for (const c of detall.cadenes) {
  if (c.display !== 'block' || c.visibility !== 'visible' || c.contentVisibility !== 'visible' || c.contain !== 'none' || c.willChange || c.filter) {
    console.log(' ', JSON.stringify(c));
  }
}
await b.close();
