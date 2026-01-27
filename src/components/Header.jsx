import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserRound } from 'lucide-react';
import { useTexts } from '@/hooks/useTexts';
import { useGridDebug } from '@/contexts/GridDebugContext';
import SearchDialog from '@/components/SearchDialog';

function Header({
  cartItemCount,
  onCartClick,
  onUserClick,
  offersHeaderVisible = false,
  adminBannerVisible = false,
  rulerInset = 0
}) {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const texts = useTexts();
  const { getDebugStyle, isSectionEnabled } = useGridDebug();
  const cartClickTimeoutRef = React.useRef(null);

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: texts.header.navigation.firstContact, href: '/first-contact' },
    { name: texts.header.navigation.theHumanInside, href: '/the-human-inside' },
    { name: texts.header.navigation.austen, href: '/austen' },
    { name: texts.header.navigation.cube, href: '/cube' },
    { name: texts.header.navigation.outcasted, href: '/outcasted' }
  ];

  const topOffsetPx = (adminBannerVisible ? 40 : 0) + (offersHeaderVisible ? 40 : 0) + (Number(rulerInset) || 0);

  return (
    <motion.header
      data-main-header="true"
      className="fixed left-0 right-0 z-[10000] bg-background"
      initial={false}
      animate={{
        top: `${topOffsetPx}px`
      }}
      transition={{
        duration: 0.35,
        ease: [0.32, 0.72, 0, 1]
      }}
      style={isSectionEnabled('header') ? getDebugStyle('header', 'main') : {}}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div
          className="relative flex items-center h-16 lg:h-20"
          style={isSectionEnabled('header') ? getDebugStyle('header', 'row1') : {}}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link
              to="/"
              className="relative z-10 pointer-events-auto block transition-transform hover:scale-105 active:scale-95 lg:active:scale-100"
              title="GRÀFIC - Inici"
            >
              <span
                aria-hidden="true"
                data-brand-logo="1"
                className="h-8 w-[140px] block text-foreground"
                style={{
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  maskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'left center',
                  maskPosition: 'left center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}
              />
            </Link>
          </motion.div>

          {/* Center: Search Button (mobile) / Navigation (desktop) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center flex-1"
          >
            {/* Mobile: Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchDialogOpen(true)}
              className="h-9 w-9 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
              aria-label="Obrir cerca"
            >
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="sr-only">Cerca</span>
            </Button>

            {/* Desktop: Navigation */}
            <nav className="hidden lg:flex items-center gap-6 flex-nowrap">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="font-roboto text-sm font-normal text-foreground transition-all inline-block whitespace-nowrap"
                  onMouseEnter={(e) => {
                    const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))';
                    e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`;
                  }}
                  onMouseLeave={(e) => e.target.style.textShadow = 'none'}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Right: Cart and User (+ Search on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-end gap-2"
          >
            {/* Search Button (desktop only) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchDialogOpen(true)}
              className="hidden lg:flex h-10 w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Obrir cerca"
            >
              <svg className="h-6 w-6 translate-y-[3px] text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="sr-only">Cerca</span>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = window.setTimeout(() => {
                  cartClickTimeoutRef.current = null;
                  onCartClick?.();
                }, 320);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = null;
                navigate('/cart');
              }}
              className="relative h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
            >
              <span
                aria-hidden="true"
                className="h-[27px] w-[27px] lg:h-[31px] lg:w-[31px] transition-all duration-200"
                style={{
                  display: 'block',
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/basket-full-2.svg' : '/custom_logos/icons/basket-empty.svg'})`,
                  maskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/basket-full-2.svg' : '/custom_logos/icons/basket-empty.svg'})`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}
              />
              {cartItemCount > 0 && (
                <span className="absolute left-1/2 -translate-x-1/2 text-whiteStrong text-[13.75px] lg:text-[16.25px] font-bold" style={{ top: 'calc(60% - 1.5px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}>
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">{texts.header.cart.srOnly}</span>
            </Button>

            {/* User Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onUserClick}
              className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <UserRound className="h-5 w-5 lg:h-6 lg:w-6 translate-y-[5px] text-foreground" />
              <span className="sr-only">Obrir menú d'usuari</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
      />
    </motion.header>
  );
}

export default Header;
