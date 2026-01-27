import React, { useRef, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useGridDebug } from '@/contexts/GridDebugContext';
import { useTexts } from '@/hooks/useTexts';

const UserSidebar = ({ isOpen, onClose }) => {
  const sidebarRef = useRef(null);
  const { getDebugStyle, isSectionEnabled } = useGridDebug();
  const texts = useTexts();

  useFocusTrap(isOpen, sidebarRef);

  useEffect(() => {
    if (isOpen) {
      let needsComp = false;
      try {
        needsComp = !(window.CSS && typeof window.CSS.supports === 'function' && window.CSS.supports('scrollbar-gutter: stable'));
      } catch {
        needsComp = true;
      }

      if (needsComp) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        document.documentElement.classList.add('scrollbar-compensate');
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      document.body.classList.add('cart-open');

      const header = document.querySelector('[data-main-header="true"]');
      if (header) {
        header.classList.add('cart-open');
      }

      const offersHeaders = document.querySelectorAll('[data-offers-header="true"]');
      offersHeaders.forEach((el) => el.classList.add('offers-header-cart-open'));
    } else {
      document.documentElement.style.removeProperty('--scrollbar-width');
      document.documentElement.classList.remove('scrollbar-compensate');
      document.body.style.paddingRight = '';
      document.body.classList.remove('cart-open');

      const header = document.querySelector('[data-main-header="true"]');
      if (header) {
        header.classList.remove('cart-open');
      }

      const offersHeaders = document.querySelectorAll('[data-offers-header="true"]');
      offersHeaders.forEach((el) => el.classList.remove('offers-header-cart-open'));
    }

    return () => {
      document.documentElement.style.removeProperty('--scrollbar-width');
      document.documentElement.classList.remove('scrollbar-compensate');
      document.body.style.paddingRight = '';
      document.body.classList.remove('cart-open');

      const header = document.querySelector('[data-main-header="true"]');
      if (header) {
        header.classList.remove('cart-open');
      }

      const offersHeaders = document.querySelectorAll('[data-offers-header="true"]');
      offersHeaders.forEach((el) => el.classList.remove('offers-header-cart-open'));
    };
  }, [isOpen]);

  const navLinks = [{
    name: texts.header.navigation.firstContact,
    href: '/first-contact'
  }, {
    name: texts.header.navigation.theHumanInside,
    href: '/the-human-inside'
  }, {
    name: texts.header.navigation.austen,
    href: '/austen'
  }, {
    name: texts.header.navigation.cube,
    href: '/cube'
  }, {
    name: texts.header.navigation.outcasted,
    href: '/outcasted'
  }];

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        style={{
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 500ms cubic-bezier(0.95, 0.05, 0.795, 0.035)'
        }}
      />

      <div
        ref={sidebarRef}
        className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white z-50 shadow-2xl flex flex-col h-full"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 500ms cubic-bezier(0.95, 0.05, 0.795, 0.035)',
          ...( isSectionEnabled('user-sidebar') ? getDebugStyle('user-sidebar', 'main') : {})
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-sidebar-title"
      >
        <div className="p-4 sm:p-6 border-b bg-white">
          <div className="flex items-center justify-between">
            <h2 id="user-sidebar-title" className="text-xl sm:text-2xl font-oswald font-bold uppercase" style={{ color: '#141414' }}>Menú</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tanca el menú">
              <X className="h-6 w-6" style={{ color: '#141414' }} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/profile"
              className="font-roboto text-[14pt] font-normal transition-all py-3 px-4 w-full text-left hover:bg-gray-50 rounded-md flex items-center gap-3 text-gray-900 group"
              onClick={onClose}
            >
              <User className="h-5 w-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
              <span className="group-hover:translate-x-1 transition-transform">Perfil d'usuari</span>
            </Link>

            <div className="h-px bg-gray-200 my-4" />

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="font-roboto text-[14pt] font-normal transition-all py-3 px-4 block hover:bg-gray-50 rounded-md text-gray-900 group"
                onClick={onClose}
              >
                <span className="group-hover:translate-x-1 inline-block transition-transform">{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
