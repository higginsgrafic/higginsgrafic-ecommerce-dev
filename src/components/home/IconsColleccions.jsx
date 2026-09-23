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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: u(20),
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
