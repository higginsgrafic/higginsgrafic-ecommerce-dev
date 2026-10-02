// LA TAULA DE DIVISIONS (04/10/2026).
//
// En Marc: «Calculem les divisions des del bottom del viewport fins al bottom del
// header. Quantes divisions? Tantes com calguin perque un dels tops o bottoms de
// la taula encaixin amb el final del megaslide (encara que no sigui al px). A
// partir d'aquell punt sabras fins on arriba el megaslide i podras centrar la
// hero amb les divisions que et quedin del megaslide fins a baix de tot.»
//
// Aquest guio NO toca l'aplicacio: mesura cada format i calcula, per a cada mida
// de taula, quina divisio cau mes a prop del final del megaslide i quina hero en
// sortiria (els 8/10 de les divisions que queden, amb l'aire repartit).
//
//     node scripts/_tmp-divisions.mjs
import { chromium } from '@playwright/test';

const VISTES = [
  { nom: 'iPad Pro 13 apaissada', w: 1376, h: 954 },
  { nom: 'iPad Air 13 apaissada', w: 1366, h: 946 },
  { nom: 'Portatil 1280', w: 1280, h: 666 },
  { nom: 'iPad Air 11 apaissada', w: 1180, h: 742 },
  { nom: 'Model 1200x820', w: 1200, h: 820 },
  { nom: 'Model 1180x780', w: 1180, h: 780 },
  { nom: 'iPad 10.2 apaisada', w: 1024, h: 690 },
  { nom: 'iPad Pro 13 vertical', w: 1032, h: 1304 },
  { nom: 'iPad minia 6 vertical', w: 744, h: 1061 },
  { nom: 'Portatil 1440', w: 1440, h: 900 },
  { nom: 'Escriptori 1920', w: 1920, h: 1080 },
];
// Mides de taula a provar: quantes divisions del espai (viewport - capcalera).
const TAULES = [8, 9, 10, 12, 16, 20, 24, 32];

const r1 = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : null);
const r2 = (n) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : null);

const b = await chromium.launch();
const files = [];
for (const v of VISTES) {
  const ctx = await b.newContext({ viewport: { width: v.w, height: v.h }, hasTouch: v.w < 1500 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:3003/nova/inici?carril=1`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2600);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const m = await p.evaluate(() => {
    const rd = (n) => Math.round(n * 10) / 10;
    const cala = document.createElement('div');
    cala.style.cssText = 'position:absolute;visibility:hidden;height:0;width:1px';
    document.body.appendChild(cala);
    const varPx = (nom) => { cala.style.width = `var(${nom}, 0px)`; return parseFloat(getComputedStyle(cala).width) || 0; };
    const capcalera = varPx('--appHeaderOffset');
    const carril = varPx('--inici-nou-carril');
    const ample = window.innerWidth;
    const alt = window.innerHeight;
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const hero = document.querySelector('[data-hero-caixa="1"]');
    const pr = panell ? panell.getBoundingClientRect() : null;
    const hr = hero ? hero.getBoundingClientRect() : null;
    const alcadaEstimada = ample <= 1376 ? 0.2529 * carril + 5.3 : 0.1775 * carril + 111.3;
    cala.remove();
    return {
      capcalera: rd(capcalera), carril: rd(carril), ample, alt,
      finalReal: pr ? rd(pr.bottom) : null,
      alcadaEstimada: rd(alcadaEstimada),
      heroTop: hr ? rd(hr.top) : null, heroAlcada: hr ? rd(hr.height) : null,
      esHoritzontal: ample >= 768 && ample >= alt,
    };
  });
  await ctx.close();

  const S = m.alt - m.capcalera;                     // l'espai de la taula
  const P = (m.finalReal != null ? m.finalReal : m.capcalera + m.alcadaEstimada) - m.capcalera;
  const files2 = [];
  for (const N of TAULES) {
    const k = Math.max(1, Math.min(N - 1, Math.round((P / S) * N)));
    const linia = (k / N) * S;                        // on cau la divisio triada
    const error = linia - P;
    const r = N - k;                                  // divisions que queden
    const alcada = 0.8 * (r / N) * S;                 // els 8/10 del que queda
    const top = m.capcalera + linia + 0.1 * (r / N) * S;
    files2.push({ N, k, r, linia: r1(linia), error: r1(error), alcada: r1(alcada), top: r1(top) });
  }
  files.push({ nom: v.nom, ...m, S: r1(S), P: r1(P), taules: files2 });
}
await b.close();

console.log('\nLA TAULA DE DIVISIONS — espai = viewport - capcalera\n');
console.log('vista                        capç.  S(espai)  final megaslide   estimacio  desviacio   hero avui (top/alcada)');
for (const f of files) {
  const est = f.capcalera + f.alcadaEstimada;
  const desv = f.finalReal != null ? r1(f.finalReal - est) : null;
  console.log(
    `${f.nom.padEnd(28)} ${String(f.capcalera).padStart(5)} ${String(f.S).padStart(9)} ${String(f.finalReal).padStart(15)} ${String(est).padStart(12)} ${String(desv).padStart(10)}   ${String(f.heroTop).padStart(7)}/${String(f.heroAlcada).padStart(7)}`
  );
}
console.log('\nPER CADA MIDA DE TAULA: on cau la divisio mes propera i quina hero en surt\n');
for (const f of files) {
  if (!f.esHoritzontal) { console.log(`${f.nom}: vertical (la regla de la hero no s'hi aplica)\n`); continue; }
  console.log(`${f.nom}  (S=${f.S}, final del megaslide a ${f.P} px de la capcalera, avui hero ${f.heroTop}/${f.heroAlcada})`);
  for (const t of f.taules) {
    const dTop = f.heroTop != null ? r1(t.top - f.heroTop) : null;
    const dAlc = f.heroAlcada != null ? r1(t.alcada - f.heroAlcada) : null;
    console.log(`   N=${String(t.N).padStart(2)}  divisio ${String(t.k).padStart(2)}/${String(t.N).padStart(2)} a ${String(t.linia).padStart(7)} px (error ${String(t.error).padStart(6)})  queden ${String(t.r).padStart(2)}  hero top=${String(t.top).padStart(7)} (${String(dTop).padStart(6)})  alcada=${String(t.alcada).padStart(7)} (${String(dAlc).padStart(6)})`);
  }
  console.log('');
}

// --- RESUM 1: la taula mes petita que encaixa dins d'una tolerancia ---------
const horitzontals = files.filter((f) => f.esHoritzontal && f.heroTop != null);
const MAX_N = 32;
const encaix = (f, tol) => {
  for (let N = 2; N <= MAX_N; N += 1) {
    const k = Math.max(1, Math.min(N - 1, Math.round((f.P / f.S) * N)));
    const linia = (k / N) * f.S;
    if (Math.abs(linia - f.P) <= tol) {
      const r = N - k;
      return { N, k, r, error: linia - f.P, top: f.capcalera + linia + 0.1 * (r / N) * f.S, alcada: 0.8 * (r / N) * f.S };
    }
  }
  return null;
};
for (const tol of [2, 4, 6, 10]) {
  console.log(`\nTAULA ADAPTATIVA: la mida mes petita (<= ${MAX_N}) amb la divisio a menys de ${tol} px del final del megaslide`);
  console.log('vista                        N   divisio   error   hero top (avui)        alcada (avui)');
  for (const f of horitzontals) {
    const e = encaix(f, tol);
    if (!e) { console.log(`${f.nom.padEnd(28)} — cap mida de taula hi encaixa`); continue; }
    console.log(`${f.nom.padEnd(28)} ${String(e.N).padStart(2)}   ${String(e.k).padStart(2)}/${String(e.N).padStart(2)}   ${String(r1(e.error)).padStart(6)}   ${String(r1(e.top)).padStart(7)} (${String(r1(e.top - f.heroTop)).padStart(6)})   ${String(r1(e.alcada)).padStart(7)} (${String(r1(e.alcada - f.heroAlcada)).padStart(6)})`);
  }
}

// --- RESUM 2: una sola mida de taula per a tots els formats ----------------
console.log('\nTAULA UNICA per a tots els formats horitzontals: pitjor error i pitjor desviacio de la hero');
console.log('  N    pitjor error   pitjor |d top|   pitjor |d alcada|');
for (const N of TAULES) {
  let pitjorError = 0; let pitjorTop = 0; let pitjorAlcada = 0;
  for (const f of horitzontals) {
    const k = Math.max(1, Math.min(N - 1, Math.round((f.P / f.S) * N)));
    const linia = (k / N) * f.S;
    const r = N - k;
    pitjorError = Math.max(pitjorError, Math.abs(linia - f.P));
    const top = f.capcalera + linia + 0.1 * (r / N) * f.S;
    const alcada = 0.8 * (r / N) * f.S;
    pitjorTop = Math.max(pitjorTop, Math.abs(top - f.heroTop));
    pitjorAlcada = Math.max(pitjorAlcada, Math.abs(alcada - f.heroAlcada));
  }
  console.log(`  ${String(N).padStart(2)}   ${String(r1(pitjorError)).padStart(11)} px   ${String(r1(pitjorTop)).padStart(9)} px   ${String(r1(pitjorAlcada)).padStart(11)} px`);
}

// --- RESUM 3: la hero amb les divisions senceres ---------------------------
//
// A: la hero fa els 8/10 EXACTES de les divisions que queden.
// B: la hero fa un nombre SENCER de divisions (les mes properes als 8/10), amb
//    l'aire repartit a parts iguals i de la mateixa paritat.
console.log('\nLA HERO, AMB DUES LECTURES DELS 8/10 (taula unica per a tots els formats)');
for (const N of [16, 20, 24, 32]) {
  console.log(`\n  --- taula de ${N} divisions`);
  console.log('  vista                        divisio  error    hero A (top/alcada)      hero B (top/alcada)      m');
  for (const f of horitzontals) {
    const k = Math.max(1, Math.min(N - 1, Math.round((f.P / f.S) * N)));
    const linia = (k / N) * f.S;
    const r = N - k;
    const topA = f.capcalera + linia + 0.1 * (r / N) * f.S;
    const alcadaA = 0.8 * (r / N) * f.S;
    let m = Math.round(0.8 * r);
    if (((r - m) % 2) !== 0) m -= 1;             // aire simetric en divisions senceres
    if (m < 1) m = 1;
    const topB = f.capcalera + (k + (r - m) / 2) * (f.S / N);
    const alcadaB = m * (f.S / N);
    console.log(`  ${f.nom.padEnd(28)} ${String(k).padStart(2)}/${String(N).padStart(2)}  ${String(r1(linia - f.P)).padStart(6)}   ${String(r1(topA)).padStart(7)}/${String(r1(alcadaA)).padStart(7)}   ${String(r1(topB)).padStart(7)}/${String(r1(alcadaB)).padStart(7)}   ${String(m).padStart(2)}`);
  }
}

// --- RESUM 4: quantes divisions QUEDEN del megaslide fins a baix -------------
console.log('\nQUANTES DIVISIONS QUEDEN DEL MEGASLIDE FINS AL BOTTOM DEL VIEWPORT');
for (const tol of [2, 4]) {
  console.log(`\n  tolerancia ${tol} px:`);
  console.log('  vista                        N    divisio   queden   mida divisio   error');
  for (const f of horitzontals) {
    const e = encaix(f, tol);
    if (!e) { console.log(`  ${f.nom.padEnd(28)} —`); continue; }
    console.log(`  ${f.nom.padEnd(28)} ${String(e.N).padStart(2)}   ${String(e.k).padStart(2)}/${String(e.N).padStart(2)}   ${String(e.r).padStart(6)}   ${String(r1(f.S / e.N)).padStart(12)}   ${String(r1(e.error)).padStart(6)}`);
  }
}

// --- RESUM 5: que quedin SEMPRE les mateixes divisions ---------------------
//
// Si el que queda son sempre les mateixes divisions, els 8/10 de la regla son
// divisions senceres i l'aire tambe (amb 10: hero 8, aire 1 a cada banda).
console.log('\nSI EL QUE QUEDA SON SEMPRE LES MATEIXES DIVISIONS (k triat per encaixar-hi el final del megaslide)');
for (const r of [10, 20, 30, 40]) {
  console.log(`\n  queden ${r} divisions (hero = ${Math.round(0.8 * r)}, aire = ${(r - Math.round(0.8 * r)) / 2} a cada banda):`);
  console.log('  vista                     k/N      linia   error   mida divisio   hero top/alcada');
  for (const f of horitzontals) {
    let millor = null;
    for (let k = 1; k <= 60; k += 1) {
      const N = k + r;
      const linia = (k / N) * f.S;
      const err = Math.abs(linia - f.P);
      if (millor == null || err < millor.err) millor = { k, N, linia, err, error: linia - f.P };
    }
    const m = Math.round(0.8 * r);
    const air = (r - m) / 2;
    const top = f.capcalera + (millor.k + air) * (f.S / millor.N);
    const alcada = m * (f.S / millor.N);
    console.log(`  ${f.nom.padEnd(26)} ${String(millor.k).padStart(2)}/${String(millor.N).padStart(2)}  ${String(r1(millor.linia)).padStart(7)}  ${String(r1(millor.error)).padStart(6)}   ${String(r1(f.S / millor.N)).padStart(12)}   ${String(r1(top)).padStart(7)}/${String(r1(alcada)).padStart(7)}   (avui ${f.heroTop}/${f.heroAlcada})`);
  }
}
