import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SELLING_PRICE_LABEL } from '@/config/pricing';
import {
  TDP_PRODUCT_NAME_SETTINGS,
  TDP_PRICE_SETTINGS,
  TDP_SIZE_BUTTON_TEXT_SETTINGS,
  TDP_CART_SIZE_SETTINGS,
} from '@/components/tdp/TdpConstructorProduct';

// Contenidor de fitxa de producte en format TAULA.
//
// Aixo NOME S es un contenidor: reparteix els elements en quatre files
// (nom / imatge / preu+cistella / talles), perque cada cosa quedi al seu lloc i
// no es mogui. Els elements son EXACTAMENT els mateixos que a la fitxa de
// sempre: es fan servir les mateixes mides, tipus de lletra i colors (les
// constants TDP_* de TdpConstructorProduct).
//
// Hi ha dues variants, que s'intercalen en escacs (A B A / B A B):
//   - A: nom, imatge, preu, talles
//   - B: imatge, nom, preu, talles (les dues primeres files intercanviades)
//
// Es nova i independent: no toca CollectionProductCard ni la V5, que segueixen
// igual per a la resta de la web.

const LINE = 'none';

const cartIconSrc = (count) => {
  if (count >= 2) return '/custom_logos/icons/v3-ple-2.svg';
  if (count === 1) return '/custom_logos/icons/v3-ple-1.svg';
  return '/custom_logos/icons/v3-buit.svg';
};

function CollectionTableCard({
  gridColumn,
  gridRow,
  // Posicionament explicit (opcional). Si hi es, mana sobre gridColumn/gridRow.
  cardGeometry,
  // Gira el fons degradat (es feia servir per a la variant B).
  gradientGirat = false,
  productName,
  // Noms que s'han de partir en linies concretes (no on caigui el salt
  // automatic). Si hi es, mana sobre `productName`.
  productNameLines,
  imageSrc,
  imageAlt = '',
  hoverImages = [],
  href,
  productHref,
  collectionHref,
  // Capa del dibuix a sobre la samarreta (la fa servir la pagina d'inici).
  overlaySrc,
  overlayAlt = '',
  overlayScale = 0.345,
  overlayTranslateX,
  overlayTranslateY,
  overlayOpacity = 1,
  price = SELLING_PRICE_LABEL,
  sizes = ['S', 'M', 'L', 'XL', 'XXL'],
  style,
  selectedSize,
  onSizeChange,
  onAddToCart,
  cartCount = 0,
  variantB = false,
  backgroundSrc,
  // Mides del selector de talles (al mobil es mes ample i amb el text mes gros).
  sizeSelectorWidth = '62%',
  sizeSelectorHeight = '34px',
  sizeFontPx,
  // Mida del text del nom i del preu (al mobil).
  textFontPx,
  // Mida de la icona del cistell (per defecte, la de sempre).
  cartSizePx,
  // Separacio entre el preu i el cistell (per defecte, la de sempre).
  priceGap = '34px',
}) {
  const enllac = href || productHref || collectionHref;
  const [hover, setHover] = useState(false);
  const src = hover && hoverImages[1] ? hoverImages[1] : imageSrc;

  const N = TDP_PRODUCT_NAME_SETTINGS;
  const P = TDP_PRICE_SETTINGS;
  const T = TDP_SIZE_BUTTON_TEXT_SETTINGS;

  // Alcada FIXA de dues linies. Si la fila del nom creix amb el text, la
  // imatge de sota es queda amb menys espai i les samarretes surten de mides
  // diferents segons si el nom te una linia o dues (136 px contra 120 a 768).
  // Amb l'alcada fixa, totes les samarretes tenen el mateix espai.
  const alcadaFilaNom = Math.round((textFontPx || 16) * 2 + 4);

  const filaNom = (
    <div
      key="nom"
      style={{
        flex: '0 0 auto',
        height: `${alcadaFilaNom}px`,
        boxSizing: 'border-box',
        borderBottom: LINE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 8px',
      }}
    >
      <Link
        to={enllac || '#'}
        style={{
          // Amb les linies explicites, l'enllac ha de ser una COLUMNA: si es
          // una fila, les linies surten una al costat de l'altra en comptes
          // d'una sota l'altra.
          display: 'flex',
          flexDirection: productNameLines?.length ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          textDecoration: 'none',
          color: N.color,
          fontFamily: `${N.fontFamily}, sans-serif`,
          fontSize: textFontPx ? `${textFontPx}px` : N.fontSize,
          fontWeight: N.fontWeight,
          letterSpacing: `${N.letterSpacing}em`,
          lineHeight: N.lineHeight,
          // El nom va a l'ESQUERRA de la fitxa.
          textAlign: 'left',
          textTransform: N.textTransform,
          // Amb les linies explicites no volem que tambe parti sol.
          whiteSpace: productNameLines?.length ? 'nowrap' : (textFontPx ? 'normal' : 'nowrap'),
        }}
      >
        {productNameLines?.length
          ? productNameLines.map((linia, i) => (
            <span key={linia}>
              {i > 0 ? <br /> : null}
              {linia}
            </span>
          ))
          : productName}
      </Link>
    </div>
  );

  const filaImatge = (
    <div
      key="imatge"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 auto',
        minHeight: 0,
        // La fila de la imatge es QUADRADA, perque els mockups son quadrats
        // (800x800). Sense aixo la fila es mes baixa que ampla i la imatge,
        // que te `maxHeight: 100%`, queda limitada per l'alcada: no arriba mai
        // a l'amplada i la samarreta es veu petita (mesurat: ocupava el 62 %
        // de l'amplada de la fila a 1920). Amb la fila quadrada n'ocupa el 94 %,
        // que es exactament el que la samarreta ocupa dins del mockup.
        aspectRatio: '1 / 1',
        borderBottom: LINE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // L'aire de dalt i de baix de la imatge. Es el que separa la samarreta
        // del nom i del preu: les files van enganxades (buit 0) i tota la
        // separacio la fa aquest padding. Amb 6 px l'aire era de 27 px a 1920,
        // dels quals 17 son marge propi del mockup (la samarreta ocupa el 93 %
        // del seu quadre). Puja'l si cal mes aire; a canvi la imatge encongeix,
        // perque la fila es quadrada i l'amplada menys el padding mana.
        padding: '8px 12px',
        position: 'relative',
      }}
    >
      {overlaySrc ? (
        <img
          src={encodeURI(overlaySrc)}
          alt={overlayAlt}
          aria-hidden={overlayAlt ? undefined : 'true'}
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: overlayOpacity,
            transform: `translateX(0.5px) translateY(3px) translate(${overlayTranslateX || '0px'}, ${overlayTranslateY || '0px'}) scale(${overlayScale})`,
            transformOrigin: 'center center',
            zIndex: 1,
          }}
        />
      ) : null}
      <img
        src={src}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
          height: 'auto',
          objectFit: 'contain',
          margin: '0 auto',
          flexShrink: 0,
        }}
      />
    </div>
  );

  // Posicionament explicit (opcional): quan es passa `cardGeometry`, la fitxa
  // deixa de ser una fila de la graella i es col·loca amb `top`/`left` en px.
  // Es el que permet separar les files una distancia EXACTA, perque la fila de
  // la graella no es proporcional a l'alcada de la fitxa (240 px de fitxa en
  // una fila de 19,09 px a 768) i cap multiple enter dona la separacio volguda.
  const posicionament = cardGeometry
    ? { position: 'absolute', top: `${cardGeometry.top}px`, left: `${cardGeometry.left}px`, width: `${cardGeometry.amplada}px`, height: `${cardGeometry.alcada}px` }
    : {
        gridColumn,
        gridRow,
        // El fons de la graella es absolute: cal anar-hi per sobre.
        position: 'relative',
      };

  return (
    <div
      aria-label="TDP taula"
      style={{
        ...posicionament,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        border: LINE,
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        minWidth: 0,
        pointerEvents: 'auto',
        ...style,
      }}
    >
      {/* Fons degradat: sobresurt 30px a dalt i a baix de la fitxa. */}
      {backgroundSrc ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '-30px',
            bottom: '-30px',
            backgroundImage: `url("${backgroundSrc}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // El degradat pot anar invertit (girat verticalment) per fer
            // contrast entre columnes; es independent de la variant de fitxa.
            transform: gradientGirat ? 'scaleY(-1)' : undefined,
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {variantB ? (
        <>
          {filaImatge}
          {filaNom}
        </>
      ) : (
        <>
          {filaNom}
          {filaImatge}
        </>
      )}

      {/* Preu + cistella (mateixes mides) */}
      <div
        style={{
          flex: '0 0 auto',
          borderBottom: LINE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: priceGap,
          padding: '2px 8px',
        }}
      >
        <span
          style={{
            fontFamily: `${P.fontFamily}, sans-serif`,
            fontSize: textFontPx ? `${textFontPx}px` : P.fontSize,
            fontWeight: P.fontWeight,
            letterSpacing: `${P.letterSpacing}em`,
            // Amb la caixa de linia igual que la icona del cistell, el preu
            // queda opticament centrat amb ella.
            lineHeight: cartSizePx
              ? `${cartSizePx}px`
              : (textFontPx ? `${TDP_CART_SIZE_SETTINGS.fontSize}px` : P.lineHeight),
            display: 'flex',
            alignItems: 'center',
            color: P.color,
          }}
        >
          {price}
        </span>
        <button
          type="button"
          aria-label="Afegir al cistell"
          onClick={() => onAddToCart?.()}
          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', lineHeight: 0 }}
        >
          <img
            src={cartIconSrc(cartCount)}
            alt=""
            aria-hidden="true"
            draggable="false"
            style={{
              width: `${cartSizePx ?? TDP_CART_SIZE_SETTINGS.fontSize}px`,
              height: `${cartSizePx ?? TDP_CART_SIZE_SETTINGS.fontSize}px`,
              objectFit: 'contain',
              // 3 px mes amunt, a ma (decisio de l'amo): 5 i despres 2 mes avall.
              transform: 'translateY(-3px)',
            }}
          />
        </button>
      </div>

      {/* Talles: mateix selector que la PDP (contenidor gris + pastilla blanca) */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          justifyContent: 'center',
          padding: '5px 8px',
          // Les files de la fitxa van enganxades (buit 0). L'aire VISIBLE entre
          // el preu i el selector es de 25 px (decisio de l'amo), i per aixo el
          // marge es 18: els 7 px de padding que ja hi ha (2 del preu i 5 del
          // selector) s'hi sumen.
          marginTop: '18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            padding: '2px',
            borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
            border: '1px solid #e5e7eb',
            width: sizeSelectorWidth,
            height: sizeSelectorHeight,
            boxSizing: 'border-box',
          }}
        >
          {sizes.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onSizeChange?.(size)}
                style={{
                  flex: 1,
                  fontFamily: `${T.fontFamily}, sans-serif`,
                  fontSize: sizeFontPx ? `${sizeFontPx}px` : `${T.fontSize}pt`,
                  fontWeight: isSelected ? T.selectedFontWeight : T.fontWeight,
                  letterSpacing: `${T.letterSpacing}em`,
                  lineHeight: T.lineHeight,
                  textTransform: T.textTransform,
                  color: isSelected ? '#111827' : '#9ca3af',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CollectionTableCard;
