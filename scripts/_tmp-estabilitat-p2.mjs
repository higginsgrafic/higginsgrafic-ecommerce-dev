// TEMPORAL — no es comiteja. La composicio de la pagina 2 es mou DESPRES del
// primer fotograma pintat? (posicions relatives a la vista, que la vista tambe
// es mou amb l'animacio del panell)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1366, 768]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.evaluate(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      if (v2) {
        const v = v2.getBoundingClientRect().top;
        const cont = v2.querySelector('[data-carrusel="1"] > div');
        const sel = v2.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
        const franja = v2.querySelector('[data-stripe-visual-content="2"]');
        const btn = cont?.querySelector('button');
        // El que es mira es el que ES VEU: la primera peça (no la caixa del
        // retall, que no te fons i nome's retalla).
        const rel = (el) => (el ? +(el.getBoundingClientRect().top - v).toFixed(2) : null);
        if (cont) cont.__primera = cont.querySelector('button');
        window.__m.push({
          t: Math.round(performance.now()),
          filera: rel(cont && cont.__primera ? cont.__primera : cont),
          selector: rel(sel),
          franja: rel(franja),
          retall: cont ? +cont.getBoundingClientRect().height.toFixed(2) : null,
          cella: btn ? btn.style.width : null,
        });
      }
      // Mostreja DESPRES del pintat del fotograma (el setTimeout corre un cop
      // el navegador ha pintat): aixi el que es compara es el que s'ha vist.
      if (window.__m.length < 300) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(foto);
  });
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(5000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.filera != null);
  let previ = null;
  for (const x of m) {
    const clau = `${x.filera}|${x.selector}|${x.franja}|${x.retall}|${x.cella}`;
    if (clau !== previ) {
      console.log(`${w}x${h}  t=${String(x.t).padStart(5)}  filera=${String(x.filera).padStart(7)}  selector=${String(x.selector).padStart(7)}  franja=${String(x.franja).padStart(7)}  retall=${x.retall}  cella=${x.cella}`);
    }
    previ = clau;
  }
  console.log(`${w}x${h}  -> fotogrames amb composicio distinta: ${new Set(m.map((x) => `${x.filera}|${x.selector}|${x.franja}|${x.retall}|${x.cella}`)).size}`);
  await p.close();
}
await b.close();
