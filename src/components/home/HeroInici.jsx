import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { buildHeroStripePlan, DARK_COLORS } from '@/components/home/homeDrawings';
import { CERCADOR_COLORS } from '@/data/collections';
import useIsMobile from '@/hooks/useIsMobile';
import { deviceLayoutFromViewport, esIPadPro13Estricte } from '@/utils/layoutModel';
import { HERO_DIBUIX_MIDA, HERO_DIBUIX_MIDA_DEFECTE } from '@/config/iniciNou';
import { MIDA_TAULETA_APAISADA_MAX, MIDA_TAULETA_VERTICAL_MAX } from '@/utils/layoutMetrics';

/**
 * EL MARGE INVISIBLE DE LA IMATGE DE LA SAMARRETA (04/10/2026).
 *
 * En Marc: «la samarreta no esta posada com a mi m'agradaria. A la primera
 * franja hi ha aire per sobre de la imatge i a la cinquena n'hi ha per sota. La
 * samarreta hauria d'omplir les franges completament, si no, tinc una mesura que
 * he de tenir en compte, pero que no veig». La mesura que no es veu es el MARGE
 * TRANSPARENT del mockup: el dibuix de la samarreta no arriba a les vores de la
 * imatge (800x800). Mesurat amb l'alfa de les imatges que fa servir el pla
 * (`mockup-gildan-t-shirt-*.webp`, que comparteixen plantilla): 18 px per dalt
 * (2,25 %) i 33 per baix (4,13 %). L'ice-grey en fa 20 i 36, o sigui que entre
 * colors hi ha ±0,25 %, menys d'1 px quan la franja en fa 90.
 *
 * LA CAPA, DONCS, S'HA DE CORREGIR: la samarreta s'ha de fer mes gran perque el
 * DIBUIX ompli la capa (1 / (1 - 0,0225 - 0,0413) = 1,0682) i s'ha de pujar el
 * seu marge de dalt, ja escalat (0,0225 x 1,0682 = 2,40 %). Va a les DUES capes
 * (la samarreta i el dibuix) perque el dibuix no es mogui del pit.
 */
/**
 * ON CAU LA CINTURA DE LA SAMARRETA, DINS DE LA IMATGE (04/10/2026).
 *
 * En Marc: «Centra la icona shuffle entre la cintura de la imatge de la
 * samarreta i el cadenat. En X». La cintura es la vora DRETA DEL COS de la
 * samarreta, i dins del mockup (800x800, la mateixa plantilla que els marges) es
 * a 0,775 de l'amplada. Mesurat amb l'alfa, per franges: la 1 (espatlles) 0,911,
 * la 2 (manigues) 0,959, la 3 0,834, la 4 0,774 i la 5 (baix) 0,779.
 */
const HERO_MOCKUP_CINTURA_DRETA = 0.775;

const HERO_MOCKUP_MARGE_DALT = 0.0225;
const HERO_MOCKUP_MARGE_BAIX = 0.0413;
const HERO_MOCKUP_ESCALA = 1 / (1 - HERO_MOCKUP_MARGE_DALT - HERO_MOCKUP_MARGE_BAIX);
const HERO_MOCKUP_PUJADA_PCT = HERO_MOCKUP_MARGE_DALT * HERO_MOCKUP_ESCALA * 100;

/**
 * EL MATEIX MAPA, PER NOM DE FITXER (04/10/2026).
 *
 * `HERO_DIBUIX_MIDA` te les claus amb les rutes velles (vegeu la capa del
 * dibuix); amb el nom sol, la mida afinada torna a arribar al dibuix encara que
 * la carpeta hagi canviat. El nom es unic perque porta la tinta (`-b-` / `-w-`).
 */
const HERO_DIBUIX_MIDA_PER_NOM = Object.fromEntries(
  Object.entries(HERO_DIBUIX_MIDA).map(([clau, mida]) => [clau.split('/').pop(), mida]),
);

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
  const botoBarrejaRef = useRef(null);
  // LA ICONA DE BARREJAR, CENTRADA ENTRE LA CINTURA I EL CADENAT (04/10/2026).
  //
  // En Marc: «Centra la icona shuffle entre la cintura de la imatge de la
  // samarreta i el cadenat. En X». Es calcula i no s'escriu: l'amplada de la
  // imatge depen de l'alcada de la hero (el mockup es quadrat i es pinta amb
  // `auto 100 %` de la capa, que fa l'alcada del rectangle mes els 2 px del
  // darrer gap) i la posicio del cadenat, de la disposicio.
  useLayoutEffect(() => {
    const boto = botoBarrejaRef.current;
    const caixa = boto && boto.closest('[data-hero-caixa="1"]');
    if (!boto || !caixa) return undefined;
    const calcula = () => {
      const c = caixa.getBoundingClientRect();
      const ampleImatge = (c.height + 2) * HERO_MOCKUP_ESCALA;
      const cintura = (c.width - ampleImatge) / 2 + HERO_MOCKUP_CINTURA_DRETA * ampleImatge;
      const cad = document.querySelector('img[src*="cadenat"]');
      const cadEsq = cad ? cad.getBoundingClientRect().left - c.left : c.width - 48;
      boto.style.left = `${Math.round((cintura + cadEsq) / 2 - boto.offsetWidth / 2)}px`;
      boto.style.right = 'auto';
    };
    calcula();
    const obs = new ResizeObserver(calcula);
    obs.observe(caixa);
    window.addEventListener('resize', calcula);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', calcula);
    };
  }, []);
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
              height: `var(--inici-hero-alcada, calc(var(--contingut-max, 1350px) * ${0.6 * factorHero} * 401 / 952))`,
            }
            : {
              // LA PROPORCIO DE LA CAIXA, AMB EL FACTOR DE LA HERO (04/10/2026):
              // 401 es l'alcada de disseny (430 a la vertical) i el factor la
              // deixa al 75 % (o al 150 % a l'iPad Pro 13).
              aspectRatio: `952 / ${(esVertical ? 430 : 401) * factorHero}`,
              // AL 1200x720 L'ALCADA LA PUBLICA EL MARC (04/10/2026): els 8/10
              // de l'espai de sota el panell. A la resta de formats la variable
              // no hi es i mana la proporcio de sobre.
              height: 'var(--inici-hero-alcada, auto)',
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
                  // EL MARGE INVISIBLE, CORREGIT (04/10/2026): vegeu les
                  // constants de dalt. Sense aixo el dibuix no arriba a les
                  // vores i queda aire a la primera franja i a la cinquena.
                  transform: `translateY(calc(${-i * 20}% - ${HERO_MOCKUP_PUJADA_PCT}%)) scale(${HERO_MOCKUP_ESCALA})`,
                  transformOrigin: '50% 0',
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
                      // LA CLAU ES LA RUTA, PERO AMB XARXA (04/10/2026).
                      //
                      // En Marc: «Quotes i First Contact han tornat a petar».
                      // El mapa `HERO_DIBUIX_MIDA` te les claus amb les rutes
                      // VELLES: diu `austen/it-is-a-truth-b-stripe.webp` quan el
                      // fitxer es a `austen/quotes/black/it-is-a-truth-b-stripe
                      // .webp` (els dibuixos es van reorganitzar en carpetes de
                      // colleccio i de tinta i el mapa no s'hi va actualitzar).
                      // Amb la cerca exacta, els dibuixos de Quotes NO agafaven
                      // la mida afinada i queien al 30 % de defecte.
                      //
                      // Ara es prova la ruta sencera i, si no hi es, el NOM DEL
                      // FITXER, que es unic (porta la tinta: `-b-` o `-w-`).
                      const fitxer = (band.overlaySrc || '').split('/images_stripe/')[1] || '';
                      const nom = fitxer.split('/').pop();
                      // NOME S LA RUTA I EL NOM. NO es passa a l'altra tinta
                      // (04/10/2026): en Marc va veure «un NX-01 blanc que s'ha
                      // desescalat», i era aixo — el blanc, que queia al 30 % de
                      // defecte, passava a agafar el 7 % del negre. Encara que
                      // els dos fitxers son geometricament identics (256x94,
                      // sense marge), la mida es una decisio de disseny de cada
                      // tinta i nome s la pot manar el mapa.
                      const mida = HERO_DIBUIX_MIDA[fitxer]
                        || HERO_DIBUIX_MIDA_PER_NOM[nom];
                      if (!mida) return HERO_DIBUIX_MIDA_DEFECTE;
                      return esTauleta ? mida.tauleta : mida.escriptori;
                    })()}%`,
                    backgroundPosition: 'center 35%',
                    backgroundRepeat: 'no-repeat',
                    // EL MATEIX MARGE INVISIBLE, CORREGIT (04/10/2026): la capa
                    // del dibuix porta la MATEIXA correccio que la de la
                    // samarreta, i aixi el dibuix no es mou del pit.
                    transform: `translateY(calc(${-i * 20}% - ${HERO_MOCKUP_PUJADA_PCT}%)) scale(${HERO_MOCKUP_ESCALA})`,
                    transformOrigin: '50% 0',
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
        ref={botoBarrejaRef}
        type="button"
        onClick={() => setPlan(buildHeroStripePlan())}
        aria-label="Barreja samarretes i dibuixos"
        style={{
          position: 'absolute',
          top: '50%',
          // La X la calcula l'efecte de dalt; aixo es nome s el punt de partida.
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
