// TEMPORAL (28/09/2026): COMPTA els dibuixos de cada franja (p1 i p2) a les
// mides de treball. Serveix per comprovar si les samarretes d'una pagina tenen
// el dibuix a sobre o no, que es una cosa que el registre de geometria no pot
// veure si el dibuix ja hi era absent a la linia de base.
//
// Us: node scripts/_tmp-p1-dibuixos.mjs <etiqueta>
import { chromium } from 'playwright';

const MIDES = [
  [1920, 946, 'escriptori'],
  [1024, 768, 'tauleta-apaissada'],
  [768, 1024, 'tauleta-vertical'],
];

const MESURA = () => {
  const out = {};
  for (const [etq, sel] of [
    ['p1', '[data-stripe-visual-content="1"]'],
    ['p2', '[data-stripe-visual-content="2"]'],
  ]) {
    const arrel = document.querySelector(sel);
    const imgs = arrel ? [...arrel.querySelectorAll('img')] : [];
    const info = (i) => {
      const r = i.getBoundingClientRect();
      const s = getComputedStyle(i);
      return {
        src: (i.getAttribute('src') || '').split('/').pop().slice(0, 34),
        w: Math.round(r.width), h: Math.round(r.height),
        op: s.opacity, vis: s.visibility, tr: s.transform.slice(0, 42),
      };
    };
    out[etq] = {
      arrel: !!arrel,
      imgs: imgs.length,
      ambSrc: imgs.filter((i) => (i.getAttribute('src') || '').length > 0).length,
      pintats: imgs.filter((i) => {
        const r = i.getBoundingClientRect();
        const s = getComputedStyle(i);
        return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none';
      }).length,
      mostres: imgs.slice(0, 6).map(info),
    };
  }
  return out;
};

const etiqueta = process.argv[2] || 'ara';
const b = await chromium.launch();
for (const [W, H, etq] of MIDES) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&stripeVariant=color', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(6000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(11000);
  const r = await p.evaluate(MESURA);
  console.log(`\n### ${etq}  ${W}x${H}   [${etiqueta}]`);
  for (const pagina of ['p1', 'p2']) {
    const d = r[pagina];
    console.log(`  ${pagina}: arrel=${d.arrel} imgs=${d.imgs} ambSrc=${d.ambSrc} pintats=${d.pintats}`);
    d.mostres.forEach((m) => console.log(`      ${m.src || '(sense src)'}  ${m.w}x${m.h} op=${m.op} vis=${m.vis} tr=${m.tr}`));
  }
  console.log('  errors:', errors.length ? errors.join(' | ') : 'cap');
  await ctx.close();
}
await b.close();
