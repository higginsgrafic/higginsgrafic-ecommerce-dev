import { useEffect, useState } from 'react';

/**
 * MegaslideEndGuide — guia de desenvolupament (temporal).
 *
 * Dibuixa tres línies horitzontals per calibrar el checkout:
 *   1. On acaba el títol PAGAMENT + 20 px.
 *   2. Aquest límit − 20 px (el del mega-slide).
 *   3. El límit del mega-slide: on acaba el panell quan s'obre el cistell.
 *
 * Com s'activa (apagades per defecte):
 *   - Amb `?megaslide=1` a l'adreca.
 *   - O amb Alt+M, que les encen i les apaga.
 *
 * El panell del mega-slide només és al DOM mentre és obert: per això la guia
 * mesura quan el troba i es guarda l'últim valor bo.
 */
const CLAU = 'hg.megaslideGuide.enabled';
const CLAU_ALCADA = 'hg.megaslideGuide.bottom.v2';
const SELECTOR = '[data-mega-page-viewport="3"]';

function activadaAlQuery() {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('megaslide')) return null;
    const v = String(params.get('megaslide') || '').trim().toLowerCase();
    if (['1', 'true', 'on', 'yes'].includes(v)) return true;
    if (['0', 'false', 'off', 'no'].includes(v)) return false;
    return null;
  } catch {
    return null;
  }
}

function llegirActivat() {
  const alQuery = activadaAlQuery();
  if (alQuery !== null) return alQuery;
  // Apagades per defecte: nome s surten si es demanen expressament amb
  // ?megaslide=1 o amb Alt+M. Abans s'encenien totes soles en desenvolupament.
  try {
    return window.localStorage.getItem(CLAU) === '1';
  } catch {
    return false;
  }
}

function llegirAlcadaDesada() {
  try {
    const n = Number(window.localStorage.getItem(CLAU_ALCADA));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  } catch {
    return null;
  }
}

/**
 * Límits REALS de les lletres d'un element (no la seva caixa).
 *
 * getBoundingClientRect() dóna la caixa de la línia, que inclou l'espai que
 * deixa la interlineació: per a un text de 24px dins d'una línia de 36px, la
 * caixa sobresurt uns quants píxels per dalt i per baix. Per calibrar
 * distàncies òptiques cal el límit de la tinta, i això s'obté amb les mètriques
 * de la font que dóna el canvas.
 */
function limitsDeLaTinta(el) {
  const s = getComputedStyle(el);
  const box = el.getBoundingClientRect();
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    const m = ctx.measureText(el.textContent || '');
    const lh = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.2;
    const fAscent = m.fontBoundingBoxAscent ?? parseFloat(s.fontSize) * 0.8;
    const fDescent = m.fontBoundingBoxDescent ?? parseFloat(s.fontSize) * 0.2;
    const mig = (lh - (fAscent + fDescent)) / 2;      // espai repartit per la interlineació
    const base = box.top + mig + fAscent;             // línia de base de les lletres
    return {
      top: Math.round(base - (m.actualBoundingBoxAscent ?? fAscent)),
      bottom: Math.round(base + (m.actualBoundingBoxDescent ?? fDescent)),
    };
  } catch {
    return { top: Math.round(box.top), bottom: Math.round(box.bottom) };
  }
}

export default function MegaslideEndGuide() {
  const [activat, setActivat] = useState(llegirActivat);
  const [megaFinal, setMegaFinal] = useState(llegirAlcadaDesada);
  const [titolFinal, setTitolFinal] = useState(null);

  // El panell del mega-slide va i ve: mesurem mentre hi sigui.
  useEffect(() => {
    if (!activat) return undefined;
    let raf = 0;
    const mesura = () => {
      const el = document.querySelector(SELECTOR);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.height > 0) {
          // El panell no acaba on acaba la caixa del contingut del cistell: a
          // sota seu hi ha el peu del panell. Pugem pels pares fins a trobar la
          // vora de debò, que és la que porta el border-bottom.
          let panell = el;
          let pare = el.parentElement;
          while (pare) {
            if (getComputedStyle(pare).borderBottomWidth !== '0px') {
              panell = pare;
              break;
            }
            pare = pare.parentElement;
          }
          const bottom = Math.round(panell.getBoundingClientRect().bottom);
          setMegaFinal((prev) => {
            if (prev === bottom) return prev;
            try { window.localStorage.setItem(CLAU_ALCADA, String(bottom)); } catch { /* ignore */ }
            return bottom;
          });
        }
      }
      // El títol PAGAMENT, en canvi, sempre hi és. En mesurem la tinta (les
      // lletres de debò), no la caixa de la línia.
      const titol = [...document.querySelectorAll('span')].find((s) => s.textContent.trim() === 'PAGAMENT');
      if (titol) {
        const bottom = limitsDeLaTinta(titol).bottom + 20;
        setTitolFinal((prev) => (prev === bottom ? prev : bottom));
      }
      raf = requestAnimationFrame(mesura);
    };
    raf = requestAnimationFrame(mesura);
    return () => cancelAnimationFrame(raf);
  }, [activat]);

  // Permet encendre'l i apagar-lo sense recarregar (útil mentre es prova).
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        setActivat((prev) => {
          const next = !prev;
          try { window.localStorage.setItem(CLAU, next ? '1' : '0'); } catch { /* ignore */ }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!activat) return null;

  const linies = [
    titolFinal != null && { y: titolFinal, color: '#0A7A46', text: `títol + 20 px · ${titolFinal}` },
    megaFinal != null && { y: megaFinal - 20, color: '#2563EB', text: `mega-slide − 20 px · ${megaFinal - 20}` },
    megaFinal != null && { y: megaFinal, color: '#E11D48', text: `final del mega-slide · ${megaFinal} px (Alt+M per amagar)` },
  ].filter(Boolean);

  return (
    <>
      {linies.map((l) => (
        <div
          key={l.text}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: `${l.y}px`,
            zIndex: 2147483000,
            pointerEvents: 'none',
            borderTop: `1px dashed ${l.color}`,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '10px',
              lineHeight: 1.6,
              color: '#FFFFFF',
              background: l.color,
              padding: '1px 6px',
              whiteSpace: 'nowrap',
            }}
          >
            {l.text}
          </span>
        </div>
      ))}
      {megaFinal == null && (
        <div aria-hidden="true" style={{ position: 'fixed', left: 0, bottom: 0, zIndex: 2147483000, pointerEvents: 'none' }}>
          <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', color: '#FFFFFF', background: '#E11D48', padding: '1px 6px' }}>
            obre el cistell del mega-slide per calibrar-ne les línies (Alt+M per amagar)
          </span>
        </div>
      )}
    </>
  );
}
