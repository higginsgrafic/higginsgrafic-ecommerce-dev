import { Helmet } from 'react-helmet';
import { SECCIONS_INICI } from '@/config/iniciNou';
import HeroInici from '@/components/home/HeroInici';

/**
 * L'INICI NOU — esquelet en flux.
 *
 * Aquesta pàgina es construeix AL COSTAT de l'actual (`/`), darrere la ruta
 * `/nova/inici`, tal com mana `docs/informes/PLA-arquitectura-nova.md` §6: la
 * pàgina vella no es toca mentre es construeix la nova, i el canvi de ruta es
 * fa en un sol commit quan la nova compleix la seva porta de sortida.
 *
 * ARA MATEIX HI HA LA HERO I L'ESQUELET DE LA RESTA. Les seccions que encara no
 * tenen contingut es veuen com una caixa amb el seu nom; les caixes són NOMÉS
 * per poder mesurar l'esquelet mentre és buit, i quan cada secció tingui el seu
 * contingut marxen i l'alçada la mana el contingut (§3.2 del pla).
 *
 * ELS AIRES surten de l'escala de la fonamenta (`--esp-1` a `--esp-4`,
 * `src/foundation.css`). La pàgina vella fa servir números de píxels calibrats
 * a 1920; aquesta no n'escriu cap.
 *
 * EL QUE ENCARA NO HI ÉS, i per què:
 *   - El contingut de les cinc galeries i del pòster: ve d'una en una, i cada
 *     una es verifica contra la peça equivalent de la pàgina vella.
 *   - El contingut de la hero (les diapositives): la caixa ja hi és i ja fa la
 *     mida que ha de fer.
 *   - La capçalera i el peu: depenen de la fase 7 (el header) i del marc de
 *     pàgina, i no es munten aquí per no arrossegar el sistema de coordenades
 *     del megaslide dins d'una pàgina que ha de ser en flux.
 */
function IniciNou() {
  return (
    <>
      <Helmet>
        <title>HIGGINS GRÀFIC — Inici (nou)</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="hg-marc" data-inici-nou="1">
        {/* LA HERO VA AL CARRIL SENCER, no dins del contingut amb marge: la seva
            amplada es el 70,5 % del carril de 1350, i aixo nomes es cert si el
            pare es el carril. Es l'errada que es va mesurar (895 en comptes de
            952) i per aixo hi ha `.hg-carril`. */}
        <div className="hg-carril">
          <section className="hg-seccio" data-seccio="hero" aria-label="Hero">
            <HeroInici />
          </section>
        </div>

        <div className="hg-marc__contingut">
          {SECCIONS_INICI.filter((seccio) => seccio.id !== 'hero').map((seccio) => (
            <section
              key={seccio.id}
              className="hg-seccio"
              data-seccio={seccio.id}
              aria-label={seccio.label}
              style={seccio.esp ? { marginBlockStart: `var(${seccio.esp})` } : undefined}
            >
              {/* La caixa de l'esquelet: NOMÉS mentre la seccio es buida. */}
              <div
                data-esquelet="1"
                style={{
                  minHeight: `var(${seccio.alcada})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed hsl(var(--border))',
                  color: 'hsl(var(--muted-foreground))',
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontSize: '0.875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {seccio.label}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

export default IniciNou;
