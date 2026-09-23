import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { buildHeroStripePlan, DARK_COLORS } from '@/components/home/homeDrawings';

/**
 * LA HERO DE L'INICI NOU.
 *
 * CINC FRANGES, una per colleccio, en una caixa que omple el carril i te la
 * proporcio 952 / 401 (la de la pagina vella, mesurada a les cinc mides).
 *
 * COM ES FA UNA FRANJA. Les cinc franges son el MATEIX mockup apilat: la imatge
 * fa el 500 % de l'alcada de la franja i cada franja ensenya la seva porcio
 * desplaçant-la un 20 % mes. Es com ho fa la pagina vella, i per aixo les
 * samarretes de les cinc franges son la mateixa peça en cinc colors.
 *
 * A SOBRE DE LA SAMARRETA hi ha el dibuix de la colleccio, i a sobre el text:
 * el nom de la colleccio i, quan en te, la subcolleccio.
 *
 * EL TEXT ES POSA EN BLANC O EN NEGRE segons el color de la samarreta: els
 * colors foscos (`DARK_COLORS`) porten el dibuix en blanc i el text clar.
 *
 * EL QUE ENCARA NO HI ES: el botó de barrejar (el `Shuffle` de la pagina vella)
 * i les transicions entre plans. El pla es calcula un cop per muntatge.
 */
function HeroInici() {
  const franges = useMemo(() => buildHeroStripePlan(), []);
  return (
    <div
      data-hero-inici="1"
      className="hg-carril"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        data-hero-caixa="1"
        className="hg-hero-caixa"
        data-franges={franges.length}
        style={{
          display: 'flex',
          // Les cinc franges, al costat, i cadascuna te la mateixa amplada.
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        {franges.map((band, i) => {
          const esFosc = DARK_COLORS.has(band.color);
          const text = esFosc ? '#FFFFFF' : '#111827';
          const href = band.productHref || band.collectionHref;
          return (
            <Link
              key={`${band.drawingId}-${i}`}
              to={href}
              data-franja={i + 1}
              data-colleccio={band.collectionSlug}
              title={band.collectionName}
              style={{
                flex: '1 1 0',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: '#FFFFFF',
                textDecoration: 'none',
              }}
            >
              {/* LA SAMARRETA: la porcio que li toca del mockup apilat. */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: '500%',
                  backgroundImage: `url(${band.mockupSrc})`,
                  backgroundSize: 'auto 100%',
                  backgroundPosition: 'center top',
                  backgroundRepeat: 'no-repeat',
                  transform: `translateY(-${i * 20}%)`,
                  pointerEvents: 'none',
                }}
              />
              {/* EL DIBUIX de la colleccio, a sobre de la samarreta. */}
              {band.overlaySrc ? (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: '500%',
                    backgroundImage: `url(${band.overlaySrc})`,
                    backgroundSize: `auto ${(band.overlayScale ? band.overlayScale * 100 : 30)}%`,
                    backgroundPosition: 'center 35%',
                    backgroundRepeat: 'no-repeat',
                    transform: `translateY(-${i * 20}%)`,
                    pointerEvents: 'none',
                    opacity: 0.95,
                  }}
                />
              ) : null}
              {/* EL TEXT: la colleccio i, si en te, la subcolleccio. */}
              <span
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '0 8px',
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 'clamp(9px, 1.05vw, 15px)',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: text,
                  textAlign: 'center',
                  textShadow: esFosc ? '0 1px 2px rgba(0,0,0,0.35)' : '0 1px 2px rgba(255,255,255,0.35)',
                }}
              >
                {band.subName ? `${band.collectionName} / ${band.subName}` : band.collectionName}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default HeroInici;
