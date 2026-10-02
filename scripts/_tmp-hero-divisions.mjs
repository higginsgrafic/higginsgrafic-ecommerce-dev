// LA TAULA DE DIVISIONS, APLICADA I MESURADA (04/10/2026).
//
// Per cada format: l'espai de la taula, on cau el final de debò del megaslide, la
// divisio que li toca, els blocs (megaslide / pagina) i on queda la hero. Serveix
// per comparar abans i despres d'aplicar la regla de les 20 divisions (16 de hero
// i 2 d'aire a cada banda).
//
//     node scripts/_tmp-hero-divisions.mjs
import { chromium } from '@playwright/test';

const VISTES = [
  { nom: 'iPad Pro 13 apaissada', w: 1376, h: 954 },
  { nom: 'iPad Air 13 apaissada', w: 1366, h: 946 },
  { nom: 'Portatil 1280x666', w: 1280, h: 666 },
  { nom: 'Portatil 1280x586', w: 1280, h: 586 },
  { nom: 'iPad Air 11 apaissada', w: 1180, h: 742 },
  { nom: 'Model 1200x820', w: 1200, h: 820 },
  { nom: 'Model 1180x780', w: 1180, h: 780 },
  { nom: 'iPad 10.2 apaisada', w: 1024, h: 690 },
  { nom: 'iPad Pro 13 vertical', w: 1032, h: 1304 },
  { nom: 'iPad 10.2 vertical', w: 768, h: 952 },
  { nom: 'Portatil 1440', w: 1440, h: 900 },
  { nom: 'Escriptori 1920', w: 1920, h: 1080 },
];

const r1 = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : null);
const b = await chromium.launch();
console.log('');
console.log('vista                        S    final  divisio   k/N   aire   hero top/alcada   aire dalt/baix   blocs mega/pagina');
for (const v of VISTES) {
  const ctx = await b.newContext({ viewport: { width: v.w, height: v.h }, hasTouch: v.w < 1500 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?carril=1', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2600);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const m = await p.evaluate(() => {
    const rd = (n) => Math.round(n * 10) / 10;
    const z = document.querySelector('[data-taula-inici="1"]');
    const cala = document.createElement('div');
    cala.style.cssText = 'position:absolute;visibility:hidden;height:0;width:1px';
    z.appendChild(cala);
    const px = (v) => { cala.style.width = `var(${v}, 0px)`; return parseFloat(getComputedStyle(cala).width) || 0; };
    const capcalera = px('--appHeaderOffset');
    const divisio = px('--inici-hero-divisio');
    const aire = px('--inici-hero-aire');
    const k = (() => { cala.style.width = 'calc(var(--inici-hero-k, 0) * 1px)'; return parseFloat(getComputedStyle(cala).width) || 0; })();
    cala.remove();
    const hero = document.querySelector('[data-hero-caixa="1"]');
    const pan = document.querySelector('[data-mega-panel-surface="1"]');
    const hr = hero ? hero.getBoundingClientRect() : null;
    const pr = pan ? pan.getBoundingClientRect() : null;
    return {
      capcalera: rd(capcalera),
      S: rd(window.innerHeight - capcalera),
      final: pr ? rd(pr.bottom) : null,
      divisio: rd(divisio), k, N: k ? k + 20 : 0, aire: rd(aire),
      heroTop: hr ? rd(hr.top) : null, heroAlcada: hr ? rd(hr.height) : null,
      heroBaix: hr ? rd(hr.bottom) : null,
      blocMega: rd(parseFloat(getComputedStyle(z).getPropertyValue('--inici-bloc-mega')) || 0),
      blocPagina: rd(parseFloat(getComputedStyle(z).getPropertyValue('--inici-bloc-pagina')) || 0),
      alt: window.innerHeight,
    };
  });
  await ctx.close();
  const aireDalt = m.final != null && m.heroTop != null ? r1(m.heroTop - m.final) : null;
  const aireBaix = m.heroBaix != null ? r1(m.alt - m.heroBaix) : null;
  console.log(
    `${v.nom.padEnd(28)} ${String(m.S).padStart(4)} ${String(m.final).padStart(6)} ${String(m.divisio).padStart(8)} ${String(m.k).padStart(3)}/${String(m.N).padEnd(3)} ${String(m.aire).padStart(6)}   ${String(m.heroTop).padStart(7)}/${String(m.heroAlcada).padStart(7)}   ${String(aireDalt).padStart(7)}/${String(aireBaix).padStart(6)}   ${String(m.blocMega).padStart(7)}/${String(m.blocPagina).padStart(7)}`
  );
}
await b.close();
