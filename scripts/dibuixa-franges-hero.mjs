#!/usr/bin/env node
/**
 * Dibuixa NOMES les franges de la hero, amb el seu contorn i les seves mides.
 *
 * Us:
 *   node scripts/dibuixa-franges-hero.mjs              # /austen a 768x1024
 *   node scripts/dibuixa-franges-hero.mjs /cube 1440 900
 *
 * Desa la imatge a docs/comparacio/franges-hero-<ruta>-<mida>.png
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const ruta = process.argv[2] || '/austen';
const AMPLE = Number(process.argv[3] || 768);
const ALCADA = Number(process.argv[4] || 1024);
const OUT = path.resolve('docs/comparacio');
const NOM = `franges-hero-${ruta.replace(/^\//, '') || 'inici'}-${AMPLE}x${ALCADA}.png`;

/** Les franges, amb el seu color. Tambe les que son buides. */
const FRANGES = [
  ['[data-hero="1"]', 'HERO (contenidor)', '#111827', 'tothom'],
  ['[data-hero="1"] img', 'imatge de fons', '#2563eb', 'gruixut-fi'],
  ['[data-hero-band="1"]', 'FRANJA 1', '#dc2626', 'gruixut'],
  ['[aria-label="Títol col·lecció"]', 'FRANJA 2 (títol)', '#16a34a', 'gruixut'],
  ['[data-hero-band-bottom="1"]', 'FRANJA 3', '#d97706', 'gruixut'],
];

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ viewport: { width: AMPLE, height: ALCADA }, hasTouch: AMPLE <= 1024, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => document.documentElement.scrollHeight > window.innerHeight * 2, { timeout: 25000 }).catch(() => {});
await page.waitForTimeout(2500);
await page.evaluate(() => document.body.classList.remove('debug-containers'));

const info = await page.evaluate((franges) => {
  const hero = document.querySelector('[data-hero="1"]');
  if (!hero) return { error: 'sense hero' };
  const heroTop = hero.getBoundingClientRect().top + window.scrollY;
  const capa = document.createElement('div');
  capa.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(capa);
  const fets = [];
  for (const [sel, etiqueta, color, gruix] of franges) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const b = el.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) continue;
    const top = b.top + window.scrollY;
    const caixa = document.createElement('div');
    const ampladaVora = gruix === 'gruixut' ? 4 : 2;
    caixa.style.cssText = `position:absolute;left:${b.left}px;top:${top}px;width:${b.width}px;height:${b.height}px;border:${ampladaVora}px solid ${color};box-sizing:border-box;`;
    capa.appendChild(caixa);
    const text = document.createElement('div');
    text.textContent = `${etiqueta} · alcada ${Math.round(b.height)}px · y ${Math.round(top)} a ${Math.round(b.bottom + window.scrollY)}`;
    text.style.cssText = `position:absolute;left:${b.left + 6}px;top:${top + 6}px;background:${color};color:#fff;font:700 15px/1.6 monospace;padding:2px 8px;white-space:nowrap;`;
    capa.appendChild(text);
    fets.push({ etiqueta, y: Math.round(top), alcada: Math.round(b.height) });
  }
  return { heroTop: Math.round(heroTop), heroAlcada: Math.round(hero.getBoundingClientRect().height), fets };
}, FRANGES);

if (info.error) { console.log(info.error); await navegador.close(); process.exit(1); }

await mkdir(OUT, { recursive: true });
await page.screenshot({ path: path.join(OUT, NOM), fullPage: true, clip: { x: 0, y: Math.max(0, info.heroTop - 20), width: AMPLE, height: Math.min(info.heroAlcada + 40, 4000) } });
await navegador.close();

console.log(`\n${ruta} a ${AMPLE}x${ALCADA} · hero de ${info.heroAlcada}px`);
for (const f of info.fets) console.log(`  ${f.etiqueta.padEnd(20)} alcada ${String(f.alcada).padStart(4)}px   y=${f.y}`);
console.log(`\nimatge: docs/comparacio/${NOM}`);
