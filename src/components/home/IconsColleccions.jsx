import { Link } from 'react-router-dom';
import { ICONES_COLLECCIONS, ICONA_ALCADA_U, ICONA_ALCADA_FC_U } from '@/config/iniciNou';

/**
 * LA FRANJA D'ICONES DE COLLECCIO.
 *
 * Les cinc icones de les colleccions, en negre, al principi de la pagina. Son
 * les mateixes que la pagina vella dibuixa mes avall: el dibuix es pinta amb un
 * `filter: brightness(0)`, i per aixo es veuen com una silueta i no com el seu
 * color original.
 *
 * LES MIDES son les de la referencia de volum de la pagina vella: 70,4 unitats
 * d'alcada, i First Contact 99 perque el seu dibuix es mes ample que alt.
 *
 * TOT EN UNITATS DE DISSENY (`--esp-4` equival a 120 unitats), i per tant
 * escala amb la resta de la pagina i no te cap numero per dispositiu.
 */
function IconsColleccions() {
  const u = (unitats) => `calc(var(--esp-4) * ${(unitats / 120).toFixed(4)})`;
  return (
    <div
      data-icones-colleccions="1"
      style={{
        // L'ALCADA DE LA FRANJA ES LA D'AUSTEN, no la de la icona mes alta.
        // Austen es la referencia de volum del grup, i First Contact (98,9) es
        // mes gran que la resta (70,4). Es `height` i no `minHeight` perque la
        // icona mes alta, si no, tornaria a manar sobre l'alcada.
        height: u(ICONA_ALCADA_U),
        // EL CENTRE QUE MANA ES EL DE LA FRANJA. Amb el cap alineat, Austen
        // (70,4) omple la franja exactament, i el fenix (98,9) hi comença a dalt
        // i sobresurt per baix. Es el que fa una cella de taula: el fill
        // centrat es la franja, i el que desborda desborda.
        //
        // S'havia provat de centrar el CONJUNT dels cinc dibuixos amb un coixi a
        // sota, i el resultat era que la franja pujava 14,3 unitats i a ull es
        // veia el grup massa amunt. El coixi, fora.
        display: 'flex',
        // L'ALINEACIO. La franja te l'alcada d'Austen (70,4) i les icones
        // s'alineen pel CAP: aixi Austen, Cube, The Human Inside i Miscellania
        // (que fan just 70,4) omplen la franja, i First Contact (98,9) hi
        // comença a dalt i sobresurt per baix.
        alignItems: 'flex-start',
        justifyContent: 'center',
        flexWrap: 'wrap',
        // El buit entre icones es UN COS: la mida de referencia de la propia
        // icona (`ICONA_ALCADA_U`). Abans eren 20 unitats, o sigui molt menys
        // d'un cos, i per aixo es veien enganxades.
        gap: u(ICONA_ALCADA_U),
      }}
    >
      {ICONES_COLLECCIONS.map((c) => {
        const esFirstContact = c.id === 'first-contact';
        return (
          <Link
            key={c.id}
            to={c.href}
            title={c.name}
            aria-label={c.name}
            className="hover:scale-110 active:scale-95"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s ease' }}
          >
            <img
              src={c.icon}
              alt={c.name}
              style={{
                width: esFirstContact ? u(67.36) : 'auto',
                height: esFirstContact ? 'auto' : u(ICONA_ALCADA_U),
                maxHeight: u(ICONA_ALCADA_FC_U),
                objectFit: 'contain',
                display: 'block',
                filter: 'brightness(0)',
              }}
            />
          </Link>
        );
      })}
    </div>
  );
}

export default IconsColleccions;
