#!/usr/bin/env node
/**
 * Dibuixa els CONTENIDORS d'una pagina sobre una captura, amb etiqueta i
 * mides. Serveix per VEURE com esta feta una zona (quines caixes hi ha, on
 * comencen i on acaben) sense haver d'activar cap mode de depuracio.
 *
 * Us:
 *   node scripts/dibuixa-contenidors.mjs /austen
 *   node scripts/dibuixa-contenidors.mjs /austen 768 1024
 *   HG_URL=http://127.0.0.1:3003 node scripts/dibuixa-contenidors.mjs /austen
 *
 * Desa la imatge a docs/comparacio/containers-<ruta>-<mida>.png
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const ruta = process.argv[2] || '/austen';
const AMPLE = Number(process.argv[3] || 768);
const ALCADA = Number(process.argv[4] || 1024);
/** Si ve, retalla la imatge a aquesta alcada (per veure una zona de prop).
 *  Es un segon argument opcional: `node ... /austen 768 1024 hero` */
const ZONA = process.argv[5] || null;
const ZONES = {
  hero: { selector: '[data-hero="1"]', marge: 24 },
};
const OUT = path.resolve('docs/comparacio');
const NOM = `containers-${ruta.replace(/^\//, '') || 'inici'}-${AMPLE}x${ALCADA}.png`;

/** Contenidors que volem veure, en ordre de dibuix (el primer, a sota). */
const SELECTORS = [
  ['[data-hero="1"]', 'hero', '#e11d48'],
  ['[data-hero="1"] img', 'imatge', '#2563eb'],
  ['[data-hero-band="1"]', 'franja 1 (dalt)', '#7c3aed'],
  ['[aria-label="Títol col·lecció"]', 'franja 2 (títol)', '#059669'],
  ['[data-hero-band-bottom="1"]', 'franja 3 (baix)', '#d97706'],
  ['[data-hero="1"] > div:last-child', 'icones', '#0891b2'],
  ['[data-tram-final="1"]', 'bloc final', '#be185d'],
  ['[data-component="tambe-rail"]', 'rail', '#65a30d'],
  ['[data-component="respesca-title"]', 'títol del rail', '#0d9488'],
  ['[data-poster-text="1"]', 'pòster', '#9333ea'],
  ['[data-pauta-grid]', 'graella', '#dc2626'],
];

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ viewport: { width: AMPLE, height: ALCADA }, hasTouch: AMPLE <= 1024, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => document.documentElement.scrollHeight > window.innerHeight * 2, { timeout: 25000 }).catch(() => {});
await page.waitForTimeout(2500);

// Amaga l'inspector si el port el tingués activat, perque no embruti el dibuix.
await page.evaluate(() => document.body.classList.remove('debug-containers'));

// Dibuixa cada contenidor amb el seu color i una etiqueta amb les mides.
const dibuixats = await page.evaluate((selectors) => {
  const fets = [];
  const capa = document.createElement('div');
  capa.id = '__dibuix_contenidors__';
  capa.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(capa);

  for (const [sel, etiqueta, color] of selectors) {
    let els = [];
    try { els = [...document.querySelectorAll(sel)]; } catch { continue; }
    for (const el of els) {
      const b = el.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      const top = b.top + window.scrollY;
      const caixa = document.createElement('div');
      caixa.style.cssText = `position:absolute;left:${b.left}px;top:${top}px;width:${b.width}px;height:${b.height}px;border:2px solid ${color};box-sizing:border-box;`;
      const text = document.createElement('div');
      text.textContent = `${etiqueta}  ${Math.round(b.width)}×${Math.round(b.height)}  y=${Math.round(top)}`;
      text.style.cssText = `position:absolute;left:${b.left}px;top:${top}px;transform:translateY(-100%);background:${color};color:#fff;font:600 12px/1.4 monospace;padding:1px 5px;white-space:nowrap;`;
      capa.appendChild(caixa);
      capa.appendChild(text);
      fets.push({ etiqueta, x: Math.round(b.left), y: Math.round(top), w: Math.round(b.width), h: Math.round(b.height) });
    }
  }
  return fets;
}, SELECTORS);

const alcada = await page.evaluate(() => document.documentElement.scrollHeight);
await mkdir(OUT, { recursive: true });
let retall = undefined;
if (ZONA && ZONES[ZONA]) {
  const z = await page.evaluate((sel) => {
    const b = document.querySelector(sel).getBoundingClientRect();
    return { top: b.top + window.scrollY, height: b.height };
  }, ZONES[ZONA].selector).catch(() => null);
  if (z) retall = { x: 0, y: Math.max(0, z.top - ZONES[ZONA].marge), width: AMPLE, height: Math.min(z.height + ZONES[ZONA].marge * 2, 4000) };
}
await page.screenshot({ path: path.join(OUT, NOM), fullPage: true, clip: retall });
await page.evaluate(() => document.getElementById('__dibuix_contenidors__')?.remove());
await navegador.close();

console.log(`\n${ruta} a ${AMPLE}x${ALCADA} (pagina de ${alcada}px)`);
console.log('contenidors dibuixats:');
for (const d of dibuixats) console.log(`  ${d.etiqueta.padEnd(20)} ${String(d.w).padStart(5)}×${String(d.h).padEnd(5)} a x=${d.x} y=${d.y}`);
console.log(`\nimatge: docs/comparacio/${NOM}`);
