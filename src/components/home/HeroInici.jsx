import { useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { buildHeroStripePlan, DARK_COLORS } from '@/components/home/homeDrawings';
import { CERCADOR_COLORS } from '@/data/collections';
import useIsMobile from '@/hooks/useIsMobile';

/** El color de cada samarreta, de la taula canonica del lloc. */
const HEX_SAMARRETA = Object.fromEntries(CERCADOR_COLORS.map((c) => [c.slug, c.hex]));

/**
 * LA HERO DE L'INICI NOU: LES FRANGES.
 *
 * ES COPIAT DE LA PAGINA VELLA (`Home.jsx`), que es el que calia fer des del
 * principi. Com funciona, doncs, es exactament com alla:
 *
 *   1. La hero es CINC FRANGES iguals, una sobre l'altra (`flex: 1 1 0`).
 *   2. A cada franja hi ha UNA SAMARRETA DIFERENT, amb el seu color.
 *   3. La samarreta es pinta com una IMATGE DE FONS que fa el 500 % de l'alcada
 *      de la franja, i cada franja la desplaça un 20 % mes que l'anterior. O
 *      sigui que cada franja ensenya la SEVA porcio de la samarreta.
 *   4. Sumant les cinc franges es veu la FORMA d'una samarreta sencera, perque
 *      les porcions son consecutives.
 *
 * NO hi ha cap mascara: la forma surt de la unio de les cinc porcions, que es
 * com ho fa la pagina vella.
 *
 * El text va a l'esquerra de cada franja, i el boto de barrejar a la dreta.
 * Les transicions entre plans i el `Shuffle` tambe son de la vella.
 */
function HeroInici() {
  const isMobile = useIsMobile();
  const [plan, setPlan] = useState(() => buildHeroStripePlan());
  const franges = useMemo(() => plan, [plan]);

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
          flexDirection: 'column',
          gap: '2px',
          overflow: 'hidden',
        }}
      >
        {franges.map((band, i) => {
          const esFosc = DARK_COLORS.has(band.color);
          return (
            <a
              key={`${band.drawingId}-${i}`}
              href={band.productHref || band.collectionHref}
              data-franja={i + 1}
              data-colleccio={band.collectionSlug}
              title={band.collectionName}
              className="group hover:opacity-90 transition-opacity"
              style={{
                flex: '1 1 0',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                background: '#FFFFFF',
                textDecoration: 'none',
              }}
            >
              {/* LA SAMARRETA, com a fons: el 500 % de l'alcada de la franja,
                  desplaçada el 20 % que li toca. Es aixo el que fa que cada
                  franja ensenyi una porcio diferent i que sumades es vegi la
                  forma. */}
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
              {/* EL DIBUIX de la colleccio, a sobre. */}
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
                    backgroundSize: `auto ${(band.overlayScale || 0.345) * 100}%`,
                    backgroundPosition: 'center 35%',
                    backgroundRepeat: 'no-repeat',
                    transform: `translateY(-${i * 20}%)`,
                    pointerEvents: 'none',
                    opacity: 0.95,
                  }}
                />
              ) : null}
              {/* EL NOM de la colleccio, a l'esquerra. */}
              <div style={{ position: 'relative', zIndex: 2, paddingLeft: '24px', color: '#475059' }}>
                <p
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: isMobile ? '13px' : '18px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    margin: 0,
                    opacity: 0.95,
                  }}
                >
                  {(i === 1 || i === 2) && band.subName
                    ? `${band.collectionName} / ${band.subName}`
                    : band.collectionName}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* EL BOTO DE BARREJAR. */}
      <button
        type="button"
        onClick={() => setPlan(buildHeroStripePlan())}
        aria-label="Barreja samarretes i dibuixos"
        style={{
          position: 'absolute',
          top: '50%',
          right: '32px',
          transform: 'translateY(-50%)',
          zIndex: 10,
          background: 'transparent',
          border: 'none',
          borderRadius: '12px',
          width: '72px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
        }}
        className="hover:bg-white transition-colors"
      >
        <Shuffle size={50} color="#475059" />
      </button>
    </div>
  );
}

export default HeroInici;
