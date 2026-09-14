import { Link } from 'react-router-dom';

const COLLECTIONS_MENU = [
  { id: 'first-contact', name: 'First Contact', href: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.webp' },
  { id: 'the-human-inside', name: 'The Human Inside', href: '/the-human-inside', icon: '/custom_logos/collections/collection-thin-logo.svg' },
  { id: 'austen', name: 'Austen', href: '/austen', icon: '/custom_logos/collections/collection-jean-austen-logo.svg' },
  { id: 'cube', name: 'Cube', href: '/cube', icon: '/custom_logos/collections/collection-cube-logo.svg' },
  { id: 'miscellania', name: 'Miscel·lània', href: '/miscellania', icon: '/custom_logos/collections/collection-miscellania-logo.svg' },
];

const BAR_HEIGHT = 88; // una mica per sobre de la BottomTabBar (h-16 = 64px)

export default function CollectionIconsBar() {
  return (
    <div
      style={{
        position: 'fixed',
        // Una pill flotant amb els cinc botons a dins, centrada.
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'fit-content',
        // 9 px mes amunt (4 + 5).
        bottom: `${BAR_HEIGHT + 9}px`,
        zIndex: 50,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '9999px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        justifyContent: 'center',
        // Dins d'una pill, les icones queden centrades.
        alignItems: 'center',
        // Pill mes ampla, pero que tambe capiga en pantalles estretes.
        gap: 'clamp(12px, 6.2vw, 24px)',
        // Alcada 5 px menys.
        padding: '7.5px clamp(12px, 6.4vw, 25px)',
        boxSizing: 'border-box',
      }}
    >
      {COLLECTIONS_MENU.map((c) => {
        const isFirstContact = c.id === 'first-contact';
        return (
          <Link
            key={c.id}
            to={c.href}
            title={c.name}
            aria-label={c.name}
            className="hover:opacity-100 active:scale-95"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
          >
            <img
              src={c.icon}
              alt={c.name}
              style={{
                width: isFirstContact ? '40px' : 'auto',
                height: isFirstContact ? 'auto' : '44px',
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
