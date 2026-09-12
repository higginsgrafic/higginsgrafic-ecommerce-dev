import { Link } from 'react-router-dom';

const COLLECTIONS_MENU = [
  { id: 'first-contact', name: 'First Contact', href: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.svg' },
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
        left: 0,
        right: 0,
        bottom: `${BAR_HEIGHT}px`,
        zIndex: 50,
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '15.75px',
        padding: '8px 16px',
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
              alignItems: 'flex-start',
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
