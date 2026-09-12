import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const COLLECTIONS_MENU = [
  { id: 'first-contact', name: 'First Contact', href: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.svg' },
  { id: 'the-human-inside', name: 'The Human Inside', href: '/the-human-inside', icon: '/custom_logos/collections/collection-thin-logo.svg' },
  { id: 'austen', name: 'Austen', href: '/austen', icon: '/custom_logos/collections/collection-jean-austen-logo.svg' },
  { id: 'cube', name: 'Cube', href: '/cube', icon: '/custom_logos/collections/collection-cube-logo.svg' },
  { id: 'miscellania', name: 'Miscel·lània', href: '/miscellania', icon: '/custom_logos/collections/collection-miscellania-logo.svg' },
];

export default function MobileFooter() {
  const navigate = useNavigate();

  const goToUserTab = useCallback((tab) => {
    const now = Date.now();
    const ttl = 30 * 60 * 1000;
    sessionStorage.setItem('HG_MEGA_PAGE', JSON.stringify({ value: 4, expiresAt: now + ttl }));
    sessionStorage.setItem('HG_ACORDIO_EXPANDED_PAGE4', JSON.stringify({ value: true, expiresAt: now + ttl }));
    sessionStorage.setItem('HG_USER_ACTIVE_TAB', JSON.stringify({ value: tab, expiresAt: now + ttl }));
    window.dispatchEvent(new CustomEvent('hg:open-user-tab', { detail: { tab } }));
    navigate('/?active=first_contact');
  }, [navigate]);

  const linkStyle = {
    color: '#475059',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '11px',
    lineHeight: 1.4,
    opacity: 0.75,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  };

  const clientLinks = [
    { label: 'Comandes', action: () => goToUserTab('COMANDES') },
    { label: 'Missatges', action: () => goToUserTab('MISSATGES') },
    { label: 'Compte', action: () => goToUserTab('COMPTE') },
    { label: 'Transport', href: '/shipping' },
  ];

  const infoLinks = [
    ['Talles i Cura', '/sizing'],
    ['Contacte', '/contact'],
    ['Qui som', '/about'],
    ['FAQ', '/faq'],
  ];

  const legalLinks = [
    ['Enviaments i Devolucions', '/shipping'],
    ['Termes i Condicions', '/terms'],
    ['Política de Privacitat', '/privacy'],
    ['Avís Legal', '/legal'],
    ['Cookies', '/cookies'],
  ];

  const renderLink = (label, hrefOrAction) => {
    if (typeof hrefOrAction === 'string') {
      return <Link key={label} to={hrefOrAction} style={linkStyle}>{label}</Link>;
    }
    return <button key={label} onClick={hrefOrAction} style={linkStyle}>{label}</button>;
  };

  return (
    <footer>
      <div style={{ background: '#e5e5e5', padding: '44px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', alignItems: 'start', gap: '12px', maxWidth: '430px', margin: '0 auto' }}>
          {COLLECTIONS_MENU.map((collection) => (
            <Link key={collection.id} to={collection.href} aria-label={collection.name} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '58px' }}>
              <img src={collection.icon} alt={collection.name} style={{ display: 'block', width: '100%', maxWidth: collection.id === 'first-contact' ? '38px' : '44px', maxHeight: '52px', objectFit: 'contain', filter: 'brightness(0)' }} />
            </Link>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', padding: '60px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', maxWidth: '260px', margin: '0 auto', transform: 'translateX(-18px)' }}>
          <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <p style={{ margin: '0 0 12px', color: '#0b0d10', fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 600 }}>Client</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              {clientLinks.map(({ label, action, href }) => href ? renderLink(label, href) : renderLink(label, action))}
            </div>
          </div>
          <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <p style={{ margin: '0 0 12px', color: '#0b0d10', fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 600 }}>Informació</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              {infoLinks.map(([label, href]) => renderLink(label, href))}
            </div>
          </div>
          <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <p style={{ margin: '0 0 12px', color: '#0b0d10', fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 600 }}>Legal</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              {legalLinks.map(([label, href]) => renderLink(label, href))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#e5e5e5', padding: '40px 16px' }}>
        <Link to="/" aria-label="Higgins Gràfic - Inici" style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/custom_logos/brand/higgins-grafic-negre.webp" alt="Higgins Gràfic" style={{ display: 'block', width: '160px', height: '37.5px', objectFit: 'contain' }} />
        </Link>
      </div>

      <div style={{ background: '#fff', padding: '44px 16px 96px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#475059', fontFamily: 'Roboto, sans-serif', fontSize: '14px', opacity: 0.7 }}>
          GRÀFIC · CC 2023–{new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
