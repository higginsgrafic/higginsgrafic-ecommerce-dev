import { useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { buildHeroStripePlan, DARK_COLORS } from '@/components/home/homeDrawings';
import { CERCADOR_COLORS } from '@/data/collections';
import useIsMobile from '@/hooks/useIsMobile';
import { deviceLayoutFromViewport, esIPadPro13Estricte } from '@/utils/layoutModel';
import { HERO_DIBUIX_MIDA, HERO_DIBUIX_MIDA_DEFECTE } from '@/config/iniciNou';
import { MIDA_TAULETA_APAISADA_MAX, MIDA_TAULETA_VERTICAL_MAX } from '@/utils/layoutMetrics';

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
  // La finestra es de tauleta? Es el que tria entre els dos valors del mapa de
  // mides del dibuix. La classe la diu el model (02/10/2026): amb la banda a
  // ma, l'iPad Pro 13 (1032 vertical i 1376 apaïssat) no hi entrava i es veia
  // com un escriptori petit (en Marc: «Em pregunto si no es podrien veure els
  // formats tablet que tenim seleccionats com a tablet»).
  const esTauleta = typeof window !== 'undefined'
    && (deviceLayoutFromViewport(window.innerWidth, window.innerHeight).isPortraitTablet
      || deviceLayoutFromViewport(window.innerWidth, window.innerHeight).isLandscapeTablet);
  // A la tauleta VERTICAL la hero va a tot el carril: alla la pantalla es mes
  // curta i el bloc de sota te mes espai que la propia hero (mesurat: el bloc
  // en fa 403 i la hero 249 al 80 %). Amb el carril sencer en fa 311, que es
  // gairebe la mida que te a 1440 (321).
  const esVertical = esTauleta
    && deviceLayoutFromViewport(window.innerWidth, window.innerHeight).isPortraitTablet;
  // LA HERO, FINS AL CARRIL A TOTES LES VISTES (02/10/2026).
  //
  // El cami fins aqui, tot del mateix dia: primer es va escalar la hero un 25 %
  // a quatre vistes apaissades («Escalat de la hero: 1440 com 1920, 1180x820
  // +25 %, 1200x800 +25 %, 1024x768 +25 %»), despres es va reduir un 25 % a tot
  // arreu («Redueix la hero un 25 %») i, finalment, el que mana es aixo: «Eixampla
  // totes les hero fins al carril. Excepte la 1024» (que ja hi era des del canvi
  // anterior: «Eixampla la hero fins l'amplada del segon carril»).
  //
  // O sigui que el coixi de costat (`paddingInline`) es ZERO a totes les vistes
  // apaissades i a la vertical, i la caixa fa el 100 % del carril. Nome's els
  // mobils de costat estret (vertical i per sota de 768) es queden amb el seu
  // aire del 20 % per banda.
  const ampleFinestra = typeof window !== 'undefined' ? window.innerWidth : 0;
  const esApaissada = typeof window !== 'undefined' && window.innerWidth >= window.innerHeight;
  // A 1280 I 1366, NOMES LA SECCIO (02/10/2026). En Marc: «A les 1366 i 1280,
  // tambe, pero nome's l'amplada de la seccio, no escalis les franges». La caixa
  // va de vora a vora del carril, pero la seva alcada es queda la del 80 % de
  // disseny, o sigui que les franges no creixen: la samarreta de fons es pinta
  // amb `auto 100 %` de l'alcada de la franja, i si l'alcada no canvia, la
  // samarreta tampoc.
  const esHeroSeccioAmpla = esApaissada && ampleFinestra > 1200 && ampleFinestra <= MIDA_TAULETA_APAISADA_MAX;
  // A LA VISTA 1024, EL TRACKING DELS NOMS A LA MEITAT (02/10/2026). En Marc: «A
  // la vista 1024 redueix el traking de les colleccions de la hero a la meitat»:
  // allo on els noms hi van justos, el `letterSpacing` passa de 0,18em a 0,09em.
  const esHeroTrackingMig = ampleFinestra > 0 && ampleFinestra <= MIDA_TAULETA_VERTICAL_MAX;
  // LA MIDA DE LA HERO (04/10/2026). En Marc: «Ara, redueix la hero un 25 % a
  // totes excepte a l'iPad Pro 13 que l'augmentaràs un 50 %».
  //
  // EL QUE ES MOU ES L'ALCADA, NO L'AMPLADA. L'amplada fa el carril des del
  // canvi del 02/10 («Eixampla totes les hero fins al carril. Excepte la 1024»)
  // i allo no es toca; el que l'amo troba gran o petit es l'alcada. El factor
  // va a l'alcada de la caixa (a la formula curta de 1280/1366/1376) i a
  // l'`aspect-ratio` de la resta, que es qui la fa; com que les franges i les
  // samarretes es pinten amb `auto 100 %` de l'alcada de la franja, s'hi escalen
  // soles.
  //
  // L'iPAD PRO 13 ES EL DISPOSITIU, no les quatre amplades del model: les de
  // 1180 i 1200 porten el megaslide del model pero no son l'iPad Pro 13, i van
  // amb el 25 % de menys com tothom.
  const esIPadPro13Hero = esIPadPro13Estricte();
  const factorHero = esIPadPro13Hero ? 1.5 : 0.75;
  const [plan, setPlan] = useState(() => buildHeroStripePlan());
  const franges = useMemo(() => plan, [plan]);

  return (
    <div
      data-hero-inici="1"
      className="hg-carril"
      style={{
        display: 'flex',
        flexDirection: 'column',
        // LA HERO, FINS AL CARRIL (02/10/2026). En Marc: «Eixampla totes les hero
        // fins al carril. Excepte la 1024» (a 1024 ja hi era des d'abans). El
        // percentatge va al BLOC i no a la caixa perque el padding d'un
        // percentatge es mesura sobre l'amplada del PARE, que es el carril: amb
        // zero, la caixa fa exactament el carril i queda centrada.
        //
        // Aixo desfà la reduccio del 25 % de mes tard del mateix dia («Redueix la
        // hero un 25 %»): el que hi havia era el 60 %, el 75 % o el 82,5 % del
        // carril i ara totes les vistes apaissades fan el carril. Nome's els
        // mobils de costat estret (vertical i < 768) es queden amb el seu aire.
        paddingInline: (esVertical || esApaissada || ampleFinestra >= 768) ? 0 : '20%',
      }}
    >
      <div
        data-hero-caixa="1"
        className="hg-hero-caixa"
        data-franges={franges.length}
        style={{
          // A 1280 I 1366 LA SECCIO FA EL 75 % DEL CARRIL I L'ALCADA NO CANVIA
          // DE PROPORCIO. Sense l'`aspect-ratio`, l'alcada surt del 60 % del
          // carril (el 80 % de disseny ja reduit un 25 %) amb la proporcio
          // 952/401, que es la de sempre. El factor de la mida de la hero del
          // 04/10/2026 multiplica aquest 0,6.
          ...(esHeroSeccioAmpla
            ? {
              width: '100%',
              aspectRatio: 'auto',
              height: `calc(var(--contingut-max, 1350px) * ${0.6 * factorHero} * 401 / 952)`,
            }
            : {
              // LA PROPORCIO DE LA CAIXA, AMB EL FACTOR DE LA HERO (04/10/2026):
              // 401 es l'alcada de disseny (430 a la vertical) i el factor la
              // deixa al 75 % (o al 150 % a l'iPad Pro 13).
              aspectRatio: `952 / ${(esVertical ? 430 : 401) * factorHero}`,
            }),
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflow: 'hidden',
          // EL BOTO DE BARREJAR S'HI ANÇORA. Sense aixo la caixa es `static`, i
          // un `absolute` de dins agafa el primer ancestre posicionat, que es el
          // `main`: el boto anava a mig PAGINA en comptes de a mig HERO.
          position: 'relative',
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
                background: 'hsl(var(--grey-paper))',
                textDecoration: 'none',
              }}
            >
              {/* LA SAMARRETA, com a fons: l'ALCADA DEL RECTANGLE sencer,
                  desplaçada el 20 % que li toca. Es aixo el que fa que cada
                  franja ensenyi una porcio diferent i que sumades es vegi la
                  forma.

                  L'alcada es `500% + els gaps` i no `500%`: les franges tenen
                  2 px de separacio entre elles, i sense comptar-los la capa
                  quedava mes curta que el rectangle (mesurat a 1920: 418 en
                  comptes de 428). Amb els gaps, la capa i el rectangle fan
                  exactament el mateix. */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 'calc(500% + 10px)',
                  backgroundImage: `url(${band.mockupSrc})`,
                  backgroundSize: 'auto 100%',
                  backgroundPosition: 'center top',
                  backgroundRepeat: 'no-repeat',
                  transform: `translateY(-${i * 20}%)`,
                  pointerEvents: 'none',
                }}
              />
              {/* EL DIBUIX de la colleccio, a sobre. La seva mida surt del mapa
                  de la hero (`HERO_DIBUIX_MIDA`), i NO de l'`overlayScale` de
                  la fitxa: son dos sistemes diferents. */}
              {band.overlaySrc ? (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    // El mateix que la capa de la samarreta: l'alcada del
                    // rectangle, gaps inclosos.
                    height: 'calc(500% + 10px)',
                    backgroundImage: `url(${band.overlaySrc})`,
                    backgroundSize: `auto ${(() => {
                      // La clau es el final de la ruta de la imatge.
                      const fitxer = (band.overlaySrc || '').split('/images_stripe/')[1] || '';
                      const mida = HERO_DIBUIX_MIDA[fitxer];
                      if (!mida) return HERO_DIBUIX_MIDA_DEFECTE;
                      return esTauleta ? mida.tauleta : mida.escriptori;
                    })()}%`,
                    backgroundPosition: 'center 35%',
                    backgroundRepeat: 'no-repeat',
                    transform: `translateY(-${i * 20}%)`,
                    pointerEvents: 'none',
                    opacity: 0.95,
                  }}
                />
              ) : null}
              {/* EL NOM de la colleccio, a l'esquerra. */}
              <div style={{ position: 'relative', zIndex: 2, paddingLeft: '24px', color: 'hsl(var(--grey-ink-2))' }}>
                <p
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: isMobile ? '13px' : '18px',
                    fontWeight: 600,
                    // A 1024, la meitat (vegeu `esHeroTrackingMig`).
                    letterSpacing: esHeroTrackingMig ? '0.09em' : '0.18em',
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

        {/* EL BOTO DE BARREJAR, DINS de la caixa: si va a l'envolcall, que
            no esta posicionat, cau a la pagina i queda fora de la hero. */}
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
        className="hover:bg-paper transition-colors"
        >
        <Shuffle size={50} color="hsl(var(--grey-ink-2))" />
        </button>
      </div>

    </div>
  );
}

export default HeroInici;
