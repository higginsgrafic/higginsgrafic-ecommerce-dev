import { useNavigate, useLocation } from 'react-router-dom';
import { getRandomProductHref } from '@/lib/productRoutes';

// =============================================================================
//  StoryPosterLink
// -----------------------------------------------------------------------------
//  Poster gran "CADA PERSONA TÉ UNA HISTÒRIA, CADA HISTÒRIA TÉ UN DIBUIX".
//  En clicar-hi, navega a una pàgina de producte aleatòria (diferent cada cop).
// =============================================================================

const POSTER_LINES = [
  { text: 'ROBA' },
  { text: 'QUE PARLA' },
  { text: 'PER TU' },
];

function StoryPosterLink({ style }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = () => {
    navigate(getRandomProductHref(location.pathname));
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label="ROBA QUE PARLA PER TU — Vés a una història aleatòria"
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      }}
      style={{
        textAlign: 'left',
        fontFamily: 'Oswald, sans-serif',
        fontSize: '60pt',
        fontWeight: 300,
        lineHeight: 1.1,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: '#111827',
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',
        ...style,
      }}
    >
      {POSTER_LINES.map((line, idx) => (
        <div key={idx} style={line.marginTop ? { marginTop: line.marginTop } : undefined}>
          {line.text}
        </div>
      ))}
    </div>
  );
}

export default StoryPosterLink;
