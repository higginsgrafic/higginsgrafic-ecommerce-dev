/* ============================================================================
   Dibuixa els contorns de les FRANGES DE LA HERO, al teu navegador.
   ============================================================================

   COM FER-LO SERVIR (30 segons):

     1. Obre la pagina d'una colleccio (per exemple /austen).
     2. Prem  F12  (o Cmd+Option+I al Mac) per obrir les eines de desenvolupador.
     3. Vés a la pestanya "Console".
     4. Enganxa TOT aquest fitxer i prem Enter.

   Sortiran els contorns de cada franja amb el seu nom, la seva alcada i on
   comenca i acaba. Torna a enganxar-lo (o recarrega) per treure'ls.
   ========================================================================== */

(() => {
  const ID = '__franges_hero__';

  // Si ja hi son, els treiem (és un interruptor).
  const anterior = document.getElementById(ID);
  if (anterior) {
    anterior.remove();
    console.log('%cContorns de les franges: fora.', 'color:#666');
    return;
  }

  const hero = document.querySelector('[data-hero="1"]');
  if (!hero) {
    console.warn('No he trobat la hero en aquesta pàgina ([data-hero="1"]).');
    return;
  }

  // Les franges, amb el seu color i el gruix del contorn.
  const FRANGES = [
    ['[data-hero="1"]',                     'HERO (contenidor)', '#111827', 2],
    ['[data-hero="1"] img',                 'imatge de fons',    '#2563eb', 2],
    ['[data-hero-band="1"]',                'FRANJA 1',          '#dc2626', 4],
    ['[aria-label="Títol col·lecció"]',     'FRANJA 2 (títol)',  '#16a34a', 4],
    ['[data-hero-band-bottom="1"]',         'FRANJA 3',          '#d97706', 4],
  ];

  const capa = document.createElement('div');
  capa.id = ID;
  capa.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(capa);

  const files = [];
  for (const [selector, etiqueta, color, gruix] of FRANGES) {
    const el = document.querySelector(selector);
    if (!el) continue;
    const b = el.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) continue;
    const dalt = b.top + window.scrollY;

    const caixa = document.createElement('div');
    caixa.style.cssText = `position:absolute;left:${b.left}px;top:${dalt}px;width:${b.width}px;height:${b.height}px;border:${gruix}px solid ${color};box-sizing:border-box;`;
    capa.appendChild(caixa);

    const text = document.createElement('div');
    text.textContent = `${etiqueta} · alcada ${Math.round(b.height)}px · y ${Math.round(dalt)} a ${Math.round(b.bottom + window.scrollY)}`;
    text.style.cssText = `position:absolute;left:${b.left + 6}px;top:${dalt + 6}px;background:${color};color:#fff;font:700 15px/1.6 monospace;padding:2px 8px;white-space:nowrap;border-radius:3px;`;
    capa.appendChild(text);

    files.push({ etiqueta, alcada: Math.round(b.height), dalt: Math.round(dalt), baix: Math.round(b.bottom + window.scrollY) });
  }

  console.log('%cContorns de les franges de la hero:', 'font-weight:bold');
  console.table(files);
})();
