import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserRound } from 'lucide-react';
import SearchDialog from '@/components/SearchDialog';

export default function DevHeader({
  adminBannerHeight = 0,
  rulerInset = 0,
  cartItemCount = 0,
  onCartClick,
  onUserClick,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const suppressThemeOverrides = location.pathname === '/admin/controls';
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const cartClickTimeoutRef = useRef(null);

  const [strongHex, setStrongHex] = useState(() => {
    try {
      return window.localStorage.getItem('DEV_THEME_STRONG_HEX') || '#171717';
    } catch {
      return '#171717';
    }
  });

  const [softHex, setSoftHex] = useState(() => {
    try {
      return window.localStorage.getItem('DEV_THEME_SOFT_HEX') || '#b2b2b2';
    } catch {
      return '#b2b2b2';
    }
  });

  const strongInputRef = useRef(null);
  const softInputRef = useRef(null);

  const hexToHslTriplet = (hex) => {
    const raw = (hex || '').toString().trim();
    const m = raw.match(/^#?([0-9a-f]{6})$/i);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    const r = ((n >> 16) & 255) / 255;
    const g = ((n >> 8) & 255) / 255;
    const b = (n & 255) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
      if (h < 0) h += 360;
    }

    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    const toFixedTrim = (value, digits) => {
      const s = Number(value).toFixed(digits);
      return s.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '');
    };

    const hDeg = delta === 0 ? 0 : h;
    const sPct = s * 100;
    const lPct = l * 100;

    return `${toFixedTrim(hDeg, 6)} ${toFixedTrim(sPct, 6)}% ${toFixedTrim(lPct, 6)}%`;
  };

  const applyThemeVars = ({ strong, soft }) => {
    const strongTriplet = hexToHslTriplet(strong);
    const softTriplet = hexToHslTriplet(soft);
    if (strongTriplet) document.documentElement.style.setProperty('--foreground', strongTriplet);
    if (softTriplet) document.documentElement.style.setProperty('--muted-foreground', softTriplet);
  };

  useEffect(() => {
    if (suppressThemeOverrides) return;
    applyThemeVars({ strong: strongHex, soft: softHex });
  }, []);

  useEffect(() => {
    if (suppressThemeOverrides) return;
    applyThemeVars({ strong: strongHex, soft: softHex });
    try {
      window.localStorage.setItem('DEV_THEME_STRONG_HEX', strongHex);
      window.localStorage.setItem('DEV_THEME_SOFT_HEX', softHex);
    } catch {
      // ignore
    }
  }, [strongHex, softHex, suppressThemeOverrides]);

  const demoLinks = [
    { label: 'Nike També', href: '/nike-tambe' },
    { label: 'Adidas', href: '/adidas-demo' },
    { label: 'Nike Hero', href: '/nike-hero-demo' },
  ];

  return (
    <div
      className="fixed left-0 right-0 z-[20000] bg-background border-b border-border"
      style={{ top: `${adminBannerHeight + rulerInset}px`, left: `${rulerInset}px`, right: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="relative flex items-center h-16 lg:h-20">
          <div className="flex-shrink-0" id="dev-header-left">
            <Link
              to="/dev-links"
              className="block transition-transform hover:scale-105 active:scale-95 lg:active:scale-100"
              title="DEV"
            >
              <div className="h-8 lg:h-10 flex items-center font-roboto text-sm font-semibold tracking-[0.22em] text-foreground">
                DEV
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3 ml-4">
            <div aria-hidden="true" className="h-7 w-px bg-border" />

            <div className="relative">
              <button
                type="button"
                className="font-roboto text-[11px] font-semibold tracking-[0.12em] border-b border-transparent hover:border-border"
                style={{ color: strongHex }}
                onClick={() => strongInputRef.current?.click()}
                aria-label="Seleccioneu color STRONG"
              >
                STRONG
              </button>
              <input
                ref={strongInputRef}
                type="color"
                value={strongHex}
                onChange={(e) => setStrongHex(e.target.value)}
                aria-label="Color STRONG"
                className="absolute left-0 top-full mt-1 h-6 w-10 opacity-0"
                tabIndex={-1}
              />
            </div>

            <div className="relative">
              <button
                type="button"
                className="font-roboto text-[11px] font-semibold tracking-[0.12em] border-b border-transparent hover:border-border"
                style={{ color: softHex }}
                onClick={() => softInputRef.current?.click()}
                aria-label="Seleccioneu color SOFT"
              >
                SOFT
              </button>
              <input
                ref={softInputRef}
                type="color"
                value={softHex}
                onChange={(e) => setSoftHex(e.target.value)}
                aria-label="Color SOFT"
                className="absolute left-0 top-full mt-1 h-6 w-10 opacity-0"
                tabIndex={-1}
              />
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-6 flex-nowrap">
            {demoLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="font-roboto text-sm font-normal text-foreground transition-all inline-block whitespace-nowrap"
                onMouseEnter={(e) => {
                  const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))';
                  e.currentTarget.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchDialogOpen(true)}
              className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Obrir cerca"
            >
              <svg className="h-6 w-6 translate-y-[5px] text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="sr-only">Cerca</span>
            </Button>

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
              aria-label="Obrir cistell"
            >
              <span
                aria-hidden="true"
                className="h-[27px] w-[27px] lg:h-[31px] lg:w-[31px] transition-all duration-200"
                style={{
                  display: 'block',
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                  maskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}
              />
              {cartItemCount > 0 && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 text-whiteStrong text-[13.75px] lg:text-[16.25px] font-bold"
                  style={{ top: 'calc(60% - 1.5px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}
                >
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cistell</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onUserClick}
              className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Obrir menú d'usuari"
              id="dev-header-user"
            >
              <UserRound className="h-5 w-5 lg:h-6 lg:w-6 translate-y-[5px] text-foreground" />
              <span className="sr-only">Usuari</span>
            </Button>
          </div>
        </div>
      </div>

      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
      />
    </div>
  );
}
