// 05/10/2026 — La banda (espaiMegaslideCss) contra el megaslide de debò, i la
// hero que en surt, a cada vista. En Marc: «Torna a recalcular les heros».
import { chromium } from '@playwright/test';
const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const VISTES = [
  { n: 'mobil 360', w: 360, h: 780 },
  { n: 'mobil 390', w: 390, h: 844 },
  { n: '640x310', w: 640, h: 310 },
  { n: 'vertical 744', w: 744, h: 1061 },
  { n: 'vertical 768', w: 768, h: 952 },
  { n: 'vertical 820', w: 820, h: 1108 },
  { n: 'vertical 1032', w: 1032, h: 1304 },
  { n: '1024x690', w: 1024, h: 690 },
  { n: '1180x742', w: 1180, h: 742 },
  { n: '1200x742', w: 1200, h: 742 },
  { n: '1366x946', w: 1366, h: 946 },
  { n: '1376x954', w: 1376, h: 954 },
  { n: 'portatil 1280', w: 1280, h: 666 },
  { n: 'portatil 1366', w: 1366, h: 634 },
  { n: 'portatil 1440', w: 1440, h: 900 },
  { n: 'portatil 1512', w: 1512, h: 858 },
  { n: 'escriptori 1920', w: 1920, h: 946 },
  { n: 'escriptori 2560', w: 2560, h: 1440 },
];
const b = await chromium.launch();
for (const v of VISTES) {
  const ctx = await b.newContext({ viewport: { width: v.w, height: v.h } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/nova/inici?active=first_contact&carril=1`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(7000);
  const m = await p.evaluate(async () => {
    const model = await import('/src/utils/layoutModel.js');
    const cl = model.deviceLayoutFromViewport(window.innerWidth, window.innerHeight);
    const classe = cl.isMobil ? 'mobil' : cl.isPortraitTablet ? 'vertical' : cl.isLandscapeTablet ? 'apaissada' : 'escriptori';
    const cs = getComputedStyle(document.documentElement);
    const n = (s) => { const x = parseFloat(s); return Number.isFinite(x) ? x : null; };
    const r = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { top: Math.round(x.top), h: Math.round(x.height) }; };
    const taula = document.querySelector('[data-taula-inici="1"]');
    const cella1 = document.querySelector('[data-cella="1"]');
    const cella2 = document.querySelector('[data-cella="2"]');
    const panel = document.querySelector('[data-mega-panel-surface]');
    const hero = document.querySelector('[data-hero-caixa="1"]');
    return {
      classe,
      versio: model.versioMegaslide(),
      carrilMega: n(cs.getPropertyValue('--hg-mega-w')),
      carrilPagina: n(cs.getPropertyValue('--inici-nou-carril')),
      banda: cella1 ? Math.round(cella1.getBoundingClientRect().height) : null,
      mega: r(panel),
      megaBottom: n(cs.getPropertyValue('--hg-mega-bottom')),
      espaiHero: cella2 ? Math.round(cella2.getBoundingClientRect().height) : null,
      hero: r(hero),
      cella2Top: cella2 ? Math.round(cella2.getBoundingClientRect().top) : null,
      vora: n(cs.getPropertyValue('--hg-mega-bottom')),
      heroDeclarat: n(cs.getPropertyValue('--inici-hero-alcada')),
      headerOffset: n(cs.getPropertyValue('--appHeaderOffset')),
    };
  });
  const delta = (m.cella2Top != null && m.vora != null) ? Math.round((m.cella2Top - m.vora) * 10) / 10 : null;
  console.log(`${v.n.padEnd(17)} ${m.classe.padEnd(11)} ${String(m.versio || '-').padEnd(14)} carrilMega=${String(m.carrilMega).padEnd(6)} carrilPagina=${String(m.carrilPagina).padEnd(6)} banda=${String(m.banda).padEnd(5)} megaAlcada=${String(m.mega?.h).padEnd(5)} delta=${String(delta).padEnd(6)} cella2Top=${String(m.cella2Top).padEnd(6)} vora=${String(m.vora).padEnd(6)} espaiHero=${String(m.espaiHero).padEnd(5)} hero=${JSON.stringify(m.hero)} heroDeclarat=${m.heroDeclarat}`);
  await ctx.close();
}
await b.close();
