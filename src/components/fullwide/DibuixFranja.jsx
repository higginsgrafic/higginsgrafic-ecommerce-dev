import React from 'react';
import {
  STRIPE_DRAWING_CALIBRATIONS,
  PASSOS_ESCALA_GAP_DIBUIX_VERTICAL,
  GAP_MOVIMENT_DIBUIX_VERTICAL,
  ESCALA_DIBUIX_VERTICAL,
} from '../../config/stripeCalibrations';
import {
  STRIPE_DRAWING_DY_VERTICAL,
  STRIPE_DRAWING_ESCALA_VERTICAL,
  STRIPE_DRAWING_DX_VERTICAL,
  FILTRE_DIBUIX_DESACTIVAT,
  FILTRE_DIBUIX_DESACTIVAT_COLOR,
} from '../../config/stripeCalibrationsVertical';
import {
  DIBUIXOS_FRANJA_DX,
  DIBUIXOS_FRANJA_DY,
  DIBUIXOS_FRANJA_AMPLADA_NATURAL,
  escalaDibuixFranja,
} from '../megaslide/geometriaMegaslide.js';

/**
 * EL FACTOR DELS CALIBRATGES DE LA FRANJA DE LA PAGINA 2, A LA VISTA VERTICAL.
 *
 * Els calibratges de la vertical es van fer amb la franja a escala 2,116 i ara
 * va a 2,059: els desplaçaments (que son en px, dins de l'embolcall escalat) no
 * s'han d'encongir amb ella, i per aixo es compensen amb aquest factor.
 *
 * ES NOME'S DE LA PAGINA 2. La franja de la pagina 1 te un altre embolcall i no
 * el porta; per aixo es una prop amb valor 1 per defecte i no una constant
 * aplicada sempre. (Fins avui era un numero escrit a ma dins del bloc del
 * dibuix, dues vegades, i la pagina 1 no el tenia.)
 */
export const FACTOR_ESCALA_CALIBRATGES_VERTICAL_P2 = 1.027683;

/**
 * DibuixFranja — LA IMPRESSIO D'UNA SAMARRETA DE LA FRANJA, COM A COMPONENT
 * -----------------------------------------------------------------------------
 * Fins ara el dibuix d'una casella de la franja era un `<img>` amb un
 * `transform` de quaranta línies, ESCRIT QUATRE VEGADES: dues a
 * `MegaStripePanelP1` i dues a `MegaStripePanel` (una per branca del ternari de
 * la vista vertical). Els quatre llocs havien de dir el mateix, i el que es
 * toca en un no arriba als altres.
 *
 * Aqui el dibuix es UN COMPONENT i el seu lloc el decideixen les seves PROPS:
 * no llegeix res del pare, no comparteix cap variable amb els dibuixos veïns i
 * no depen de l'ordre en que es pintin. Els dos panells el fan servir i, per
 * tant, el que es canvia aqui canvia als quatre llocs alhora.
 *
 * QUE HI VIU, I PER QUE
 *   - `canonicalKey` i `getTileCalibration`: els dos panells en tenien una
 *     COPIA IDENTICA. Ara viuen aqui i els panells els importen.
 *   - `escalaDibuixDelTile`: la mida del dibuix, que a la vista vertical no es
 *     el calibratge directe (`escalaGap` + el 80 % + el factor del mapa).
 *   - `desplacamentsGapFranja`: els desplacaments del gap de la vista vertical,
 *     CALCULATS COM UNA LLISTA i no acumulats en una variable que es va mutant
 *     mentre es pinta. Amb la llista, cada dibuix rep el seu desplacament per
 *     prop i no depen de qui s'hagi pintat abans.
 *   - `DibuixFranja`: el `<img>` i el seu transform.
 *
 * (La llista `desplacamentsGapFranja` esta feta perque els panells la puguin
 * fer servir quan passin el desplacament; avui encara li passen el seu, pero el
 * calcul ja es aqui i es pot canviar en un sol lloc.)
 */

/**
 * EL RESOLUTOR D'UNA CASELLA: de la plantilla a la imatge que es pinta.
 *
 * Aixo era DINS del `map` de cada franja, dues vegades per panell (quatre en
 * total), i per aixo nome's es podia calcular casella a casella, en ordre, i el
 * desplaçament del gap s'havia d'anar acumulant en una variable. Com que viu
 * aqui, el panell el pot cridar catorze vegades seguides ABANS de pintar res i
 * tenir totes les mides de cop.
 *
 * Fa dues coses, en aquest ordre: les plantilles (`{i}`, `{n}`, `{idx}`) i les
 * regles de color de cada casa (BLANC/NEGRE/COLOR i les cantonades de cada
 * filera). Es el MATEIX codi que hi havia als panells.
 *
 * @param {object} props
 * @param {string} props.base  la imatge de partida de la casella
 * @param {number} props.idx   la casella (0..13)
 * @param {boolean} props.hasPerTileSrc  si la casella te imatge propia
 * @returns {string|null}
 */
export function resolDibuixDeCasella({
  base, idx, hasPerTileSrc,
  active, resolvedOverlaySrc, humanInsideVariant, firstContactVariant,
  isPortraitTablet, shirtColor,
}) {
  // 1) LES PLANTILLES.
  const perTile = (() => {
    try {
      if (!base || typeof base !== 'string') return null;
      const tpl = String(base || '').trim();
      if (!tpl) return null;
      const i1 = idx + 1;
      const hasTpl = tpl.includes('{i}') || tpl.includes('{idx}') || tpl.includes('{n}');
      if (hasTpl) {
        return tpl
          .replace(/\{i\}/g, String(i1))
          .replace(/\{n\}/g, String(i1))
          .replace(/\{idx\}/g, String(idx));
      }
      return null;
    } catch {
      return null;
    }
  })();
  const candidate = perTile || base;
  if (hasPerTileSrc) return candidate;

  // 2) LES REGLES DE COLOR.
  const isAustenKeepCalm = active === 'austen'
    && typeof resolvedOverlaySrc === 'string'
    && /\/austen\/keep_calm\//i.test(resolvedOverlaySrc);
  const isAustenTileSwapBW = active === 'austen'
    && typeof resolvedOverlaySrc === 'string'
    && /\/austen\/(pemberley_house|crosswords|quotes)\//i.test(resolvedOverlaySrc);
  const shouldApplyRules = active === 'first_contact' || active === 'the_human_inside' || active === 'cube' || active === 'miscellania' || isAustenKeepCalm || isAustenTileSwapBW;
  const baseMode = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
  const isAustenPemberley = active === 'austen'
    && typeof resolvedOverlaySrc === 'string'
    && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);

  const resolt = (() => {
    try {
      const src = candidate;
      if (!src || typeof src !== 'string') return src;
      const safeIdx = Number.isFinite(Number(idx)) ? Number(idx) : 0;
      // A la vista vertical la franja son DUES fileres de 7: la samarreta
      // sencera (i el seu dibuix) es la de l'extrem de CADA filera.
      const isFirst = isPortraitTablet ? safeIdx % 7 === 0 : safeIdx === 0;
      const isLast = isPortraitTablet ? safeIdx % 7 === 6 : safeIdx === 13;
      const useEdgeOverride = active === 'first_contact' || active === 'the_human_inside' || active === 'miscellania' || isAustenPemberley || isAustenKeepCalm;
      const mode = useEdgeOverride && isFirst
        ? (baseMode === 'color' ? 'color' : 'black')
        : useEdgeOverride && isLast
          ? (baseMode === 'color' ? 'color' : 'white')
          : baseMode;

      const toBlack = (s) => {
        let out = s;
        out = out.replace(/\/white\//i, '/black/');
        out = out.replace(/-w(?=[-.])/i, '-b');
        return out;
      };
      const toWhite = (s) => {
        let out = s;
        out = out.replace(/\/black\//i, '/white/');
        out = out.replace(/-b(?=[-.])/i, '-w');
        return out;
      };

      if (!shouldApplyRules) return src;

      if ((active === 'the_human_inside' || active === 'miscellania' || isAustenTileSwapBW) && (mode === 'white' || mode === 'black') && !isAustenPemberley) {
        return mode === 'white' ? toWhite(src) : toBlack(src);
      }

      if (mode === 'color') {
        const hasMultiLight = src.toLowerCase().includes('-multi-light-');
        const hasMultiDark = src.toLowerCase().includes('-multi-dark-');
        const hasThruLight = src.toLowerCase().includes('-multi-thru-light-');
        const hasThruDark = src.toLowerCase().includes('-multi-thru-dark-');
        const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
        const hasWRed = src.toLowerCase().includes('-multi-w-red-');
        if (useEdgeOverride && !isAustenKeepCalm && isFirst && hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
        if (useEdgeOverride && !isAustenKeepCalm && isFirst && hasMultiDark) return src;
        if (useEdgeOverride && !isAustenKeepCalm && isLast && hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
        if (useEdgeOverride && !isAustenKeepCalm && isLast && hasMultiLight) return src;
        if (isAustenPemberley) {
          if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
          return src;
        }
        if (isAustenKeepCalm) {
          const safeIdxKc = safeIdx;
          if (safeIdxKc === 8) {
            if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
            return src;
          }
          const isRedShirt = shirtColor === '#CB001D';
          if (isRedShirt) {
            if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
            return src;
          }
          if (hasMultiLight) return src;
          if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
          if (hasThruLight) return src;
          if (hasThruDark) return src.replace(/-multi-thru-dark-/i, '-multi-thru-light-');
          if (hasWRed) return src;
          if (hasThruRed) return src.replace(/-multi-thru-red-/i, '-multi-w-red-');
          return src;
        }

        if (isAustenPemberley && (mode === 'white' || mode === 'black') && !(useEdgeOverride && (isFirst || isLast))) {
          return src;
        }

        if (mode === 'white') {
          const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
          const hasWRed = src.toLowerCase().includes('-multi-w-red-');
          if (hasThruRed || hasWRed) {
            return hasWRed ? src : src.replace(/-multi-thru-red-/i, '-multi-w-red-');
          }
          return toWhite(src);
        }
        if (mode === 'black') {
          return toBlack(src);
        }

        return src;
      }

      return src;
    } catch {
      return candidate;
    }
  })();

  return resolt || candidate;
}

/** La clau canonica d'un dibuix: el Keep Calm te una sola entrada per a totes
 *  les variants. */
export function canonicalKey(rawSrc) {  try {
    const s = String(rawSrc || '').trim();
    if (!s) return '';
    const lower = s.toLowerCase();
    if (lower.includes('/custom_logos/drawings/images_stripe/austen/keep_calm/')) {
      return '__HG_CANONICAL_STRIPE_DRAWING_OVERLAY__::austen::keep_calm';
    }
    return s;
  } catch {
    return String(rawSrc || '').trim();
  }
}

/** El calibratge d'una casella: override del HUD (nomes en desenvolupament),
 *  override de props, mapa declarat, i la regla dels dibuixos de la franja. */
export function getTileCalibration(src, overrides) {
  if (!src) return { dx: 0, dy: 0, scale: 1 };
  const cKey = canonicalKey(src);
  // L'OVERRIDE DEL HUD NOME'S EN DESENVOLUPAMENT (26/09/2026).
  //
  // El HUD desa les recalibracions al `localStorage` i aqui tenien prioritat
  // sobre el que diu el projecte: en producció, un valor vell del navegador
  // d'algú podia moure la composicio. El que es veu ha de ser sempre el que
  // diu el modul de geometria; el HUD es una eina de taller i, per tant,
  // nome's mana en desenvolupament.
  let lsMap = null;
  if (import.meta.env.DEV) {
    try {
      const raw = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
      lsMap = raw ? JSON.parse(String(raw)) : null;
    } catch {
      lsMap = null;
    }
  }
  if (overrides && typeof overrides === 'object') {
    const fromOv = (cKey && overrides[cKey]) || overrides[src];
    if (fromOv && typeof fromOv === 'object') return fromOv;
  }
  if (lsMap && typeof lsMap === 'object') {
    const fromLs = (cKey && lsMap[cKey]) || lsMap[src];
    if (fromLs && typeof fromLs === 'object') return fromLs;
  }
  const fromDefaults = (cKey && STRIPE_DRAWING_CALIBRATIONS[cKey]) || STRIPE_DRAWING_CALIBRATIONS[src];
  if (fromDefaults && typeof fromDefaults === 'object') return fromDefaults;
  // LA REGLA DECLARADA (26/09/2026): les entrades que no son al mapa son
  // dibuixos de la franja i van a l'amplada base (80 unitats, el 41 % del cos),
  // centrats al cos de la seva samarreta. Vegeu `geometriaMegaslide.js`.
  if (typeof src === 'string' && src.includes('images_stripe')) {
    return {
      dx: DIBUIXOS_FRANJA_DX,
      dy: DIBUIXOS_FRANJA_DY,
      scale: escalaDibuixFranja(DIBUIXOS_FRANJA_AMPLADA_NATURAL),
    };
  }
  return { dx: 0, dy: 0, scale: 1 };
}

/**
 * L'ESCALA d'un dibuix.
 *
 * A la resta de vistes es el calibratge directe. A la VISTA VERTICAL, pero, el
 * dibuix no canvia de mida quan s'estreta el gap (`PASSOS_...` es congelat) i
 * el gap s'estreta MOVENT: l'escala es `escalaGap` (que surt del calibratge),
 * un 20 % menys (`ESCALA_DIBUIX_VERTICAL`) i el factor propi del dibuix.
 *
 * @param {string} picked la imatge del dibuix
 * @param {{isPortraitTablet: boolean, cal: {scale: number}}} opts
 * @returns {number}
 */
export function escalaDibuixDelTile(picked, { isPortraitTablet, cal }) {
  if (!isPortraitTablet) return cal.scale;
  const factorGap = 0.9 ** PASSOS_ESCALA_GAP_DIBUIX_VERTICAL;
  const escalaGap = 1 - factorGap * (1 - cal.scale);
  const factorEscalaDibuix = STRIPE_DRAWING_ESCALA_VERTICAL[canonicalKey(picked)]
    ?? STRIPE_DRAWING_ESCALA_VERTICAL[picked]
    ?? 1;
  return escalaGap * ESCALA_DIBUIX_VERTICAL * factorEscalaDibuix;
}

/**
 * ELS DESPLACAMENTS DEL GAP DE LA VISTA VERTICAL, COM A LLISTA.
 *
 * El gap s'estreta MOVENT: el dibuix de l'esquerra de la filera no es mou i la
 * resta es desplacen el 10 % de l'espai buit que tenen a l'esquerra. Abans aixo
 * era una variable que es mutava mentre es pintaven les caselles, o sigui que
 * el lloc d'un dibuix depenia de l'ordre de pintat. Aqui es calcula tot de cop,
 * i cada dibuix rep el seu numero.
 *
 * @param {Array<string|null|false>} picks les imatges de les 14 caselles, en ordre
 *   (`false` = casella que no es pinta: no compta per al gap, com quan el bucle
 *   original retornava abans de pintar-la)
 * @param {{isPortraitTablet: boolean, calibrationOverrides: object}} opts
 * @returns {Array<number>} el desplacament de cada casella
 */
export function desplacamentsGapFranja(picks, { isPortraitTablet, calibrationOverrides }) {
  const out = [];
  let acumulat = 0;
  let escalaAnterior = null;
  (picks || []).forEach((picked, idx) => {
    if (picked === false) { out.push(0); return; }
    if (idx % 7 === 0) { acumulat = 0; escalaAnterior = null; }
    if (isPortraitTablet) {
      const escalaAra = escalaDibuixDelTile(picked, { isPortraitTablet, cal: getTileCalibration(picked, calibrationOverrides) });
      if (escalaAnterior != null) {
        const gapAmbAnterior = 1 - (escalaAnterior + escalaAra) / 2;
        acumulat += (1 - GAP_MOVIMENT_DIBUIX_VERTICAL) * gapAmbAnterior;
      }
      escalaAnterior = escalaAra;
    }
    out.push(isPortraitTablet ? -100 * acumulat : 0);
  });
  return out;
}

/**
 * El dibuix d'una casella de la franja.
 *
 * @param {object} props
 * @param {string} props.picked       la imatge del dibuix (ja resolta)
 * @param {number} props.idx          la casella (0..13)
 * @param {number} [props.desplacamentGap]  el desplaçament del gap, en %
 * @param {object} [props.calibrationOverrides]
 * @param {Array} [props.stripeMaskTileRectsRawPct]
 * @param {Array} [props.rectsMascara]
 * @param {boolean} [props.isPortraitTablet]
 * @param {string} [props.active]
 * @param {boolean} [props.drawingOverlayDebug]
 * @param {boolean} [props.desactivat]  el dibuix d'una samarreta atenuada: es
 *   pinta pla amb el gris de desactivat de la casa (vegeu
 *   `FILTRE_DIBUIX_DESACTIVAT`).
 */
export function DibuixFranja({
  picked,
  idx,
  desplacamentGap = 0,
  calibrationOverrides,
  stripeMaskTileRectsRawPct,
  rectsMascara,
  isPortraitTablet = false,
  active,
  drawingOverlayDebug,
  desactivat = false,
  // Nome's la pagina 2 el porta (vegeu `FACTOR_ESCALA_CALIBRATGES_VERTICAL_P2`).
  factorCalibratgeVertical = 1,
}) {
  const imgUrl = picked ? encodeURI(picked) : '';
  const cal = getTileCalibration(picked, calibrationOverrides);
  // El calibratge es d'una filera: a la vista vertical la casella es 1/7
  // d'amplada (en comptes de la de la filera), i els desplacaments en px s'han
  // d'escalar amb la casella perque el dibuix caigui al mateix lloc.
  const fA = (() => {
    const original = Array.isArray(stripeMaskTileRectsRawPct) ? stripeMaskTileRectsRawPct[idx] : null;
    const w1 = Number(original?.width) || 0;
    const w2 = Number(rectsMascara?.[idx]?.width) || 0;
    return (w1 > 0 && w2 > 0) ? w1 / w2 : 1;
  })();
  const escalaDibuix = escalaDibuixDelTile(picked, { isPortraitTablet, cal });
  // A la vista vertical el dy es el propi de la vertical (la base de la
  // impressio, alineada amb THE HUMAN INSIDE); a la resta de vistes, el de sempre.
  const dyDibuix = isPortraitTablet
    ? (STRIPE_DRAWING_DY_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DY_VERTICAL[picked] ?? cal.dy) * factorCalibratgeVertical
    : cal.dy;
  const dxDibuix = isPortraitTablet
    ? (cal.dx + (STRIPE_DRAWING_DX_VERTICAL[canonicalKey(picked)] ?? STRIPE_DRAWING_DX_VERTICAL[picked] ?? 0)) * factorCalibratgeVertical
    : cal.dx;
  const transform = `translate(calc(${dxDibuix}px * ${fA} + ${desplacamentGap}% + var(--hgStripeDrawingExtraDx, 0px)${idx < 7 ? ' + var(--hgStripeDrawingExtraDxFilaDalt, 0px)' : ''}), calc(${dyDibuix}px + var(--hgStripeDrawingExtraDy, -5px)${idx < 7 ? ' + var(--hgStripeDrawingExtraDyFilaDalt, 0px)' : ''})) scale(calc(${escalaDibuix} * var(--hgStripeDrawingExtraScale, 1)))`;
  // Els dibuixos que nome's existeixen en color (els solids i els marcs de
  // LOOKING FOR MY DARCY) no porten la variant negra: a aquests se'ls ha de
  // treure el color a part.
  const esDibuixAmbVariantNegra = typeof picked === 'string' && /-b-stripe\.webp$/i.test(picked);
  const filter = drawingOverlayDebug
    ? 'drop-shadow(0 0 2px rgba(0,0,0,0.65))'
    : active === 'austen'
        && typeof picked === 'string'
        && picked.toLowerCase().includes('/austen/keep_calm/')
        && picked.toLowerCase().endsWith('keep-calm-w-stripe.webp')
      ? 'drop-shadow(0 0 2px rgba(0,0,0,0.75))'
      // EL DIBUIX D'UNA SAMARRETA ATENUADA, EN GRIS DE DESACTIVAT (28/09/2026,
      // ho ha demanat l'amo: «els facis tots d'un color gris desactivat»).
      // Els dibuixos de casa son imatges en escala de grisos: nome's se'ls
      // rebaixa l'opacitat (vegeu `FILTRE_DIBUIX_DESACTIVAT`), que els deixa el
      // detall intacte.
      : desactivat
        ? (esDibuixAmbVariantNegra ? FILTRE_DIBUIX_DESACTIVAT : FILTRE_DIBUIX_DESACTIVAT_COLOR)
        : 'none';

  return (
    <img
      src={imgUrl ? imgUrl : undefined}
      alt=""
      className="block absolute inset-0"
      onError={(e) => {
        try {
          e.currentTarget.style.display = 'none';
        } catch {
          // ignore
        }
      }}
      style={{
        pointerEvents: 'none',
        height: '100%',
        width: '100%',
        objectFit: 'contain',
        opacity: 0.98,
        transformOrigin: 'top center',
        transform,
        filter,
      }}
      loading={idx === 0 ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={idx === 0 ? 'high' : undefined}
    />
  );
}
