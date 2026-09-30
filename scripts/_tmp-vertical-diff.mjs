// TEMPORAL (28/09/2026): L'ARBRE DE LA FRANJA VERTICAL, 23/09 contra ara.
//
// Per cada element de la franja (i del seu voltant) diu la mida i la posicio,
// als dos estats, per trobar que queda deslligat despres d'arreglar el
// calibratge del tile.
//
// SEGURETAT: la feina sense cometre es desa amb `git stash` i es torna a posar
// al final. Els guions anteriors feien `git reset --hard` i van esborrar feina
// dues vegades.
//
// Us: node scripts/_tmp-vertical-diff.mjs
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const COMMITS = [['e479d2fa', '23/09'], ['HEAD', 'ara']];
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: 'pipe' });

// Desa la feina sense cometre.
const abans = git('status', '--porcelain').split('\n').filter((l) => l && !l.startsWith('??'));
const teFeina = abans.length > 0;
if (teFeina) { git('stash', 'push', '-m', 'dsh-mesura-vertical'); console.log(`  (desada la feina sense cometre: ${abans.length} fitxers)`); }

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
      d = await p.evaluate(() => {
        const arbre = (arrel) => {
          if (!arrel) return null;
          const files = [];
          for (const el of arrel.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) continue;
            if (r.top < -400 || r.top > 1400) continue;
            const src = (el.getAttribute('src') || '').split('/').pop();
            // NOME'S les imatges dels dibuixos de la franja: clau estable.
            if (!src || !src.includes('-stripe')) continue;
            files.push({ q: src, w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top) });
          }
          return files;
        };
        const celaFranjaP1 = document.querySelector('[data-taula-vertical="1"] [data-taula-cela="7-9+12-14"]');
        const celaFranjaP2 = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="8-10+13-15"]');
        return {
          p1: arbre(celaFranjaP1),
          p2: arbre(celaFranjaP2),
          tile: getComputedStyle(document.documentElement).getPropertyValue('--hgGridFitScale'),
        };
      });
      if (!d || !d.p1 || !d.p1.length) d = null;
    }
    out[q] = d || { error: 'buit' };
    await p.close();
  }
} finally {
  git('checkout', 'HEAD', '--', 'src');
  if (teFeina) { git('stash', 'pop'); console.log('  (feina sense cometre tornada a posar)'); }
  await ctx.close();
  await b.close();
}

// Comparacio: la mateixa posicio a la llista, element a element.
for (const pag of ['p1', 'p2']) {
  const A = out['23/09']?.[pag] || [];
  const B = out['ara']?.[pag] || [];
  console.log(`\n===== ${pag} · franja (${A.length} elements el 23/09, ${B.length} ara) =====`);
  console.log(`${'element'.padEnd(40)} ${'23/09'.padEnd(18)} ${'ara'.padEnd(18)} diferencia`);
  const perNom = (L) => Object.fromEntries(L.map((v) => [v.q, v]));
  const ma = perNom(A); const mb = perNom(B);
  const noms = [...new Set([...Object.keys(ma), ...Object.keys(mb)])].sort();
  for (const nom of noms) {
    const a = ma[nom]; const b2 = mb[nom];
    const f = (v) => (v ? `${v.w}x${v.h} y${v.y}` : '(—)');
    const dif = (a && b2) ? `${b2.w - a.w} / ${b2.h - a.h} / ${b2.y - a.y}` : '';
    const marca = dif && dif !== '0 / 0 / 0' ? '  <--' : '';
    console.log(`${nom.slice(0, 40).padEnd(40)} ${f(a).padEnd(18)} ${f(b2).padEnd(18)} ${dif}${marca}`);
  }
}
console.log('\n-- arbre --');
console.log(git('status', '--short').split('\n').filter((l) => l && !l.startsWith('??')).join('\n'));
