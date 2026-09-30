// TEMPORAL (28/09/2026): les mides del HEADER a la vista vertical (768x1024),
// per veure si alguna cosa esta desplacada respecte el carril.
// Us: node scripts/_tmp-header-mides.mjs <etiqueta>
import { chromium } from '@playwright/test';

const etiqueta = process.argv[2] || 'ara';

const MESURA = () => {
  const R = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10];
  };
  const cs = getComputedStyle(document.documentElement);
  const headers = [...document.querySelectorAll('header, body > div > div')].slice(0, 6);
  const out = {
    vars: {
      siteX: cs.getPropertyValue('--site-xL').trim(),
      siteW: cs.getPropertyValue('--site-w').trim(),
      rulerInset: cs.getPropertyValue('--rulerInset').trim(),
      ampleFinestra: window.innerWidth,
    },
    capçaleres: headers.map((h) => ({ etq: `${h.tagName.toLowerCase()}.${(h.className || '').toString().slice(0, 26)}`, box: R(h) })),
    logo: R(document.querySelector('header svg, header img')),
    nav1: R(document.querySelector('header nav')),
    nav2: R(document.querySelectorAll('nav')[1]),
    taula1: R(document.querySelector('[data-taula-vertical="1"]')),
    taula2: R(document.querySelector('[data-taula-vertical="2"]')),
    mega1: R(document.querySelector('[data-mega-page-viewport="1"]')),
    logoMark: R(document.querySelector('#stripe-guide-header-logo-mark-anchor')),
    adminIcona: R(document.querySelector('[data-admin-icona="1"]')),
    logoAncestre: (() => {
      const out = [];
      let el = document.querySelector('#stripe-guide-header-logo-mark-anchor');
      for (let i = 0; el && i < 6; i++) {
        const s = getComputedStyle(el);
        out.push({
          etq: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${(el.className || '').toString().slice(0, 22)}`,
          box: R(el),
          ml: s.marginLeft, w: s.width, pad: s.paddingLeft, tr: s.transform.slice(0, 30),
        });
        el = el.parentElement;
      }
      return out;
    })(),
  };
  return out;
};

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

await p.screenshot({ path: `_tmp-header-${etiqueta}.png`, clip: { x: 0, y: 0, width: 768, height: 150 } });
console.log(`desat _tmp-header-${etiqueta}.png (els 150 px de dalt)`);

const r = await p.evaluate(MESURA);
console.log(`\n===== HEADER ${etiqueta} (768x1024)  [esquerra, dalt, ample, alt]`);
console.log('  vars          ', JSON.stringify(r.vars));
r.capçaleres.forEach((h) => console.log(`  ${h.etq.padEnd(30)} ${JSON.stringify(h.box)}`));
for (const k of ['logo', 'adminIcona', 'logoMark', 'nav1', 'nav2', 'mega1', 'taula1', 'taula2']) console.log(`  ${k.padEnd(30)} ${JSON.stringify(r[k])}`);
for (const a of r.logoAncestre) console.log(`  ANC ${a.etq.padEnd(34)} ${JSON.stringify(a.box)} ml=${a.ml} w=${a.w} pad=${a.pad} tr=${a.tr}`);
console.log('  errors:', errors.length ? errors.join(' | ') : 'cap');
await b.close();
