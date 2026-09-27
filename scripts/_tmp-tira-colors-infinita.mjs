// TEMPORAL — la tira de colors: la rodeta dona la volta?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const triat = () => p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const b = [...v.querySelectorAll('[data-color-barra]')].find((x) => getComputedStyle(x).outlineStyle !== 'none');
  return b ? b.getAttribute('data-color-barra') : null;
});
const tots = await p.evaluate(() => [...document.querySelectorAll('[data-color-barra]')].map((x) => x.getAttribute('data-color-barra')));
console.log('colors:', tots.length, tots[0], '...', tots[tots.length - 1]);
const caixa = await p.evaluate(() => {
  const g = document.querySelector('[data-p2-color-grid]');
  const r = g.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.move(caixa.x, caixa.y);
// 0) clico el PRIMER color i el DARRER, i comprovo la volta als extrems
const clica = async (slug) => {
  await p.evaluate((s) => { document.querySelector(`[data-color-barra="${s}"]`).click(); }, slug);
  await p.waitForTimeout(250);
};
await clica('white');
console.log('triat:', await triat());
await p.mouse.wheel(0, 120); await p.waitForTimeout(250);
console.log('des del PRIMER, una enrere (ha de ser black):', await triat());
await clica('black');
console.log('triat:', await triat());
await p.mouse.wheel(0, -120); await p.waitForTimeout(250);
console.log('des de l\'ULTIM, una endavant (ha de ser white):', await triat());
// 1) fins al primer color (rodeta avall = enrere)
for (let i = 0; i < 30; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(60); }
console.log('despres de 30 voltes enrere:', await triat());
// 2) una mes enrere: ha de donar la volta a l'ultim
await p.mouse.wheel(0, 120); await p.waitForTimeout(250);
console.log('una mes enrere (ha de ser l\'ultim):', await triat());
// 3) una endavant: ha de tornar al primer
await p.mouse.wheel(0, -120); await p.waitForTimeout(250);
console.log('una endavant (ha de ser el primer):', await triat());
// 4) fins al darrer i una mes endavant: ha de donar la volta al primer
for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(50); }
console.log('despres de 40 voltes endavant:', await triat());
await p.mouse.wheel(0, -120); await p.waitForTimeout(250);
console.log('una mes endavant (ha de ser el primer):', await triat());
await ctx.close(); await b.close();
