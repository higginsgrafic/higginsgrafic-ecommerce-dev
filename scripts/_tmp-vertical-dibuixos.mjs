// TEMPORAL (28/09/2026): EL TRANSFORM DE CADA DIBUIX DE LA FRANJA VERTICAL.
//
// Per cada dibuix (clavat pel nom de la imatge, sigui `src`, `href` o fons CSS)
// diu la mida que ocupa i el transform que porta posat. Serveix per saber si el
// que canvia entre el 23/09 i ara es l'ESCALA del dibuix o una altra cosa.
//
// SEGURETAT: la feina sense cometre es desa amb `git stash` i es torna a posar.
//
// Us: node scripts/_tmp-vertical-dibuixos.mjs
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const COMMITS = [['e479d2fa', '23/09'], ['HEAD', 'ara']];
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: 'pipe' });
const abans = git('status', '--porcelain').split('\n').filter((l) => l && !l.startsWith('??'));
if (abans.length) { git('stash', 'push', '-m', 'dsh-dibuixos'); console.log(`  (desada la feina: ${abans.length} fitxers)`); }

const MESURA = () => {
  const extreu = (el) => {
    const st = getComputedStyle(el);
    const fons = st.backgroundImage && st.backgroundImage !== 'none'
      ? (st.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/) || [])[1] : '';
    return el.getAttribute('src') || el.getAttribute('href') || el.getAttribute('xlink:href') || fons || '';
  };
  const escalaDe = (t) => {
    if (!t || t === 'none') return 'none';
    const m = t.match(/matrix\(([^)]+)\)/);
    if (m) { const v = m[1].split(',').map(Number); return `scale ${v[0].toFixed(3)}`; }
    const m3 = t.match(/matrix3d\(([^)]+)\)/);
    if (m3) { const v = m3[1].split(',').map(Number); return `scale ${v[0].toFixed(3)}`; }
    return t.slice(0, 40);
  };
  const files = [];
  for (const pag of [1, 2]) {
    const cela = document.querySelector(`[data-taula-vertical="${pag}"] [data-taula-cela="${pag === 1 ? '7-9+12-14' : '8-10+13-15'}"]`);
    if (!cela) continue;
    for (const el of cela.querySelectorAll('*')) {
      const src = extreu(el);
      if (!src || !/-stripe|\.webp|\.svg/i.test(src)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 3 || r.height < 3) continue;
      files.push({
        q: `p${pag} ${src.split('/').pop()}`,
        w: Math.round(r.width), h: Math.round(r.height),
        t: escalaDe(getComputedStyle(el).transform),
        nat: el.naturalWidth ? `${el.naturalWidth}x${el.naturalHeight}` : '',
      });
    }
  }
  return files;
};

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const out = {};
let p;
try {
  for (const [c, q] of COMMITS) {
    git('checkout', c, '--', 'src');
    p = await ctx.newPage();
    let d = null;
    for (let i = 0; i < 2 && !d; i += 1) {
      await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
      await p.waitForTimeout(5000);
      await p.click('button:has(svg.lucide-search)').catch(() => {});
      await p.waitForTimeout(10000);
      d = await p.evaluate(MESURA);
      if (!d || !d.length) d = null;
    }
    out[q] = d || [];
    console.log(`  ${q}: ${out[q].length} dibuixos`);
    await p.close();
  }
} finally {
  git('reset', '-q', 'HEAD', '--', 'src');
  git('checkout', 'HEAD', '--', 'src');
  if (abans.length) { git('stash', 'pop'); console.log('  (feina tornada a posar)'); }
  await ctx.close();
  await b.close();
}

const perNom = (L) => Object.fromEntries(L.map((v) => [v.q, v]));
const A = perNom(out['23/09'] || []); const B = perNom(out['ara'] || []);
const noms = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
console.log(`\n${'dibuix'.padEnd(46)} ${'23/09'.padEnd(24)} ${'ara'.padEnd(24)}`);
for (const n of noms) {
  const a = A[n]; const b2 = B[n];
  const f = (v) => (v ? `${v.w}x${v.h} · ${v.t}${v.nat ? ' · nat ' + v.nat : ''}` : '(—)');
  const marca = a && b2 && (a.w !== b2.w || a.t !== b2.t) ? '  <--' : '';
  console.log(`${n.slice(0, 45).padEnd(46)} ${f(a).padEnd(24)} ${f(b2).padEnd(24)}${marca}`);
}
console.log('\n-- arbre --');
console.log(git('status', '--short').split('\n').filter((l) => l && !l.startsWith('??')).join('\n'));
