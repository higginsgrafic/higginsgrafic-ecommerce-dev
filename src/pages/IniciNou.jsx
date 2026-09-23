import { Helmet } from 'react-helmet';
import { SECCIONS_INICI } from '@/config/iniciNou';

/**
 * L'INICI NOU — esquelet en flux.
 *
 * Aquesta pàgina es construeix AL COSTAT de l'actual (`/`), darrere la ruta
 * `/nova/inici`, tal com mana `docs/informes/PLA-arquitectura-nova.md` §6: la
 * pàgina vella no es toca mentre es construeix la nova, i el canvi de ruta es
 * fa en un sol commit quan la nova compleix la seva porta de sortida.
 *
 * ARA MATEIX NO HI HA CONTINGUT. És l'esquelet: les set seccions de l'inici,
 * en flux, amb el seu aire declarat i amb el nom de cadascuna a la vista. Les
 * caixes que es veuen són NOMÉS per poder mesurar l'esquelet mentre és buit;
 * quan cada secció tingui el seu contingut, la caixa marxa i l'alçada la mana
 * el contingut (§3.2 del pla).
 *
 * ELS AIRES surten de l'escala de la fonamenta (`--esp-1` a `--esp-4`,
 * `src/foundation.css`), que ja existia i no tenia cap consumidor. La pàgina
 * vella fa servir números de píxels calibrats a 1920; aquesta no n'escriu cap.
 *
 * EL QUE ENCARA NO HI ÉS, i per què:
 *   - El contingut de cada secció: ve d'una en una, i cada una es verifica
 *     contra la peça equivalent de la pàgina vella abans de passar a la
 *     següent.
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
        <div className="hg-marc__contingut">
          {SECCIONS_INICI.map((seccio) => (
            <section
              key={seccio.id}
              className="hg-seccio"
              data-seccio={seccio.id}
              aria-label={seccio.label}
              style={seccio.esp ? { marginBlockStart: `var(${seccio.esp})` } : undefined}
            >
              {/* La caixa de l'esquelet: NOMÉS mentre la secció és buida. */}
              <div
                data-esquelet="1"
                style={{
                  minHeight: `var(${seccio.alcada})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed var(--hg-esquelet-vora, hsl(var(--border)))',
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
