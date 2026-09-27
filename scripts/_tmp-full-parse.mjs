// TEMPORAL — per que el full de siluetes no es parseja quan li passo el text.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const FULL = readFileSync('public/placeholders/cercador/full-clic-area-5.svg', 'utf8');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const r = await p.evaluate((svgTxt) => {
  const doc = new DOMParser().parseFromString(svgTxt, 'image/svg+xml');
  const pe = doc.querySelector('parsererror');
  const paths = [...doc.querySelectorAll('.tshirt-outline')];
  const tots = [...doc.querySelectorAll('path')];
  return {
    len: svgTxt.length,
    primer: svgTxt.slice(0, 80),
    teDoctype: svgTxt.includes('DOCTYPE'),
    arrel: doc.documentElement.tagName,
    parseError: pe ? pe.textContent.slice(0, 200) : null,
    paths: paths.length,
    tots: tots.length,
    classes: tots.slice(0, 3).map((x) => x.getAttribute('class')),
  };
}, FULL);
console.log(JSON.stringify(r, null, 1));
// i ara amb la declaracio XML i el DOCTYPE fora
const net = FULL.replace(/<\?xml[^>]*\?>/, '').replace(/<!DOCTYPE[^>]*>/, '');
const r2 = await p.evaluate((svgTxt) => {
  const doc = new DOMParser().parseFromString(svgTxt, 'image/svg+xml');
  const paths = [...doc.querySelectorAll('.tshirt-outline')];
  return { len: svgTxt.length, arrel: doc.documentElement.tagName, paths: paths.length };
}, net);
console.log('sense declaracio:', JSON.stringify(r2));
await ctx.close();
await b.close();
