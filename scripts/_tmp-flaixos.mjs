// 04/10/2026 — Els flaixos en refrescar: quina peca es mou i quan.
//
// En Marc: «Mira, quan refresco, què passa. Això és perquè l'iframe té retard o
// perquè carrega així de malament?». La hero ja està fixada (les seves mides
// surten d'un `calc`); això mesura la RESTA de peces al llarg de la càrrega.
//
// Per cada estat (megaslide tancat i obert) imprimeix una línia per instant amb
// la geometria de cada peça. El que canvia entre el primer i l'últim mostreig és
// el flaix.
import { chromium } from '@playwright/test';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const MARQUES = [150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 8000];
const ESTATS = [
  { nom: 'tancat', url: '/nova/inici?carril=1' },
  { nom: 'obert ', url: '/nova/inici?carril=1&active=first_contact' },
];

const b = await chromium.launch();
for (const estat of ESTATS) {
  const ctx = await b.newContext({ viewport: { width: 1376, height: 954 }, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(`${BASE}${estat.url}`, { waitUntil: 'load', timeout: 120000 });
  let anterior = 0;
  const files = [];
  for (const t of MARQUES) {
    await p.waitForTimeout(Math.max(0, t - anterior));
    anterior = t;
    const m = await p.evaluate(() => {
      const rd = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : null);
      const q = (s) => document.querySelector(s);
      const box = (s) => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return [rd(r.top), rd(r.width), rd(r.height)]; };
      return {
        fonts: document.fonts ? document.fonts.status : '?',
        carril: getComputedStyle(document.documentElement).getPropertyValue('--inici-nou-carril').trim(),
        vora: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom').trim(),
        panell: box('[data-mega-panel-surface="1"]'),
        hero: box('[data-hero-caixa="1"]'),
        icones: box('[data-icones-colleccions="1"]'),
        p2sel: box('[data-p2-color-selector] [data-stripe-buttonbar="bn"], [data-p2-color-selector] [data-stripe-buttonbar="bn-p1"]'),
        p2franja: box('[data-stripe-visual-content="2"]'),
        p1stripe: box('[data-stripe-visual-content="1"]'),
        cadenat: box('img[src*="cadenat"]'),
      };
    });
    files.push(`${String(t).padStart(5)}ms fonts=${m.fonts.padEnd(6)} carril=${(m.carril || '-').padEnd(7)} vora=${(m.vora || '-').padEnd(5)} panell=${JSON.stringify(m.panell)} hero=${JSON.stringify(m.hero)} icones=${JSON.stringify(m.icones)} p2sel=${JSON.stringify(m.p2sel)} p2franja=${JSON.stringify(m.p2franja)} p1stripe=${JSON.stringify(m.p1stripe)} cadenat=${JSON.stringify(m.cadenat)}`);
  }
  console.log(`\n=== megaslide ${estat.nom} ${estat.url}`);
  for (const f of files) console.log('  ' + f);
  await ctx.close();
}
await b.close();
