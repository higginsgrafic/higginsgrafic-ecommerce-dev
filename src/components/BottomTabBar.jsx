import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const HOME_LOGO = '/custom_logos/brand/grup-higgins-logo.svg';

const tabs = [
  { to: '/', icon: null, label: 'Inici', isLogo: true },
  { to: 'cerca', icon: Search, label: 'Cerca' },
  { to: '/cart', icon: null, label: 'Cistell', isCart: true },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

export default function BottomTabBar() {
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCerca = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('hg:open-cercador'));
    } else {
      navigate('/');
      setTimeout(() => window.dispatchEvent(new CustomEvent('hg:open-cercador')), 100);
    }
  };

  // El cistell viu dins del mega-slide, no en una ruta. Abans aquesta pestanya
  // navegava a '/cart', que NO existeix, i el client del mobil acabava en una
  // pagina de "no trobat": podia afegir productes pero no arribava mai al
  // pagament. Ara fa el mateix que la icona del cistell de l'escriptori.
  const handleCart = (e) => {
    e.preventDefault();
    try {
      window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
        detail: { source: 'mobile-tab-cart' },
      }));
    } catch {
      // ignore
    }
  };

  const cartIcon = (
    <span className="relative block" style={{ height: 28, width: 28 }}>
      <span
        className="absolute inset-0"
        style={{
          display: 'block',
          backgroundColor: 'currentColor',
          WebkitMaskImage: `url(${cartCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
          maskImage: `url(${cartCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
      {cartCount > 0 && (
        <span
          className="absolute left-1/2 -translate-x-1/2 text-whiteStrong font-bold"
          style={{ top: 'calc(60% - 0.5px)', transform: 'translate(-50%, -50%)', lineHeight: '1', fontSize: 13 }}
        >
          {cartCount}
        </span>
      )}
    </span>
  );

  return (
    <nav
      className="fixed left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom"
      style={{ bottom: '0px' }}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map(({ to, icon: Icon, label, isLogo, isCart }) => {
          const isCerca = to === 'cerca';
          const navTo = isCerca ? '/' : to;
          const isActive = !isCerca && (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

          if (isCerca) {
            return (
              <button
                key="cerca"
                type="button"
                onClick={handleCerca}
                className="flex items-center justify-center flex-1 h-full text-gray-500 active:text-red-600 transition-colors"
              >
                <div className="relative">
                  <Icon size={28} strokeWidth={2} />
                </div>
              </button>
            );
          }

          if (isCart) {
            return (
              <button
                key="cistell"
                type="button"
                aria-label="Cistell"
                onClick={handleCart}
                className="flex items-center justify-center flex-1 h-full text-gray-500 active:text-red-600 transition-colors"
              >
                {cartIcon}
              </button>
            );
          }

          return (
            <NavLink
              key={to}
              to={navTo}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-red-600' : 'text-gray-500'
                }`
              }
            >
              {isLogo ? (
                <img src={HOME_LOGO} alt="Inici" style={{ height: 28, width: 'auto', objectFit: 'contain', display: 'block' }} />
              ) : isCart ? (
                cartIcon
              ) : (
                <Icon size={28} strokeWidth={2} />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
