import React from 'react';

function CartIcon({
  count = 0,
  onClick,
  className = '',
  iconSize = 'clamp(1.75rem, 3.5vw, 1.640625rem)',
  badgeSize = 'clamp(1.40625rem, 3.125vw, 1.23046875rem)',
  badgeFontSize = 'clamp(0.875rem, 1.875vw, 0.8203125rem)'
}) {
  return (
    <button
      onClick={onClick}
      className={`relative hover:bg-muted rounded-md transition-colors text-foreground ${className}`}
      aria-label="Afegir al cistell"
      style={{ padding: 'clamp(0.1rem, 0.35vw, 0.2rem)' }}
    >
      <span
        aria-hidden="true"
        className="transition-all duration-200"
        style={{
          display: 'block',
          width: iconSize,
          height: iconSize,
          backgroundColor: 'currentColor',
          WebkitMaskImage: `url(${count > 0 ? '/custom_logos/icons/basket-full-1.svg' : '/custom_logos/icons/basket-empty.svg'})`,
          maskImage: `url(${count > 0 ? '/custom_logos/icons/basket-full-1.svg' : '/custom_logos/icons/basket-empty.svg'})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain'
        }}
      />
      {count > 0 && (
        <>
          {/* Comptador intern (dins el cistell) */}
          <span
            className="absolute pointer-events-none font-bold font-oswald text-whiteStrong"
            style={{
              top: 'calc(60% - 0.25px)',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(0.6875rem, 1.75vw, 0.67rem)',
              lineHeight: '1'
            }}
          >
            {count}
          </span>

          {/* Badge comptador circular a 45 graus (cantonada superior dreta) */}
          <span
            className="absolute pointer-events-none flex items-center justify-center rounded-full bg-foreground text-whiteStrong font-bold font-oswald shadow-md"
            style={{
              top: '-11px',
              right: '-12px',
              width: 'clamp(1rem, 2.5vw, 1.25rem)',
              height: 'clamp(1rem, 2.5vw, 1.25rem)',
              fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
              lineHeight: '1',
              minWidth: '16px',
              minHeight: '16px'
            }}
          >
            {count}
          </span>
        </>
      )}
    </button>
  );
}

export default CartIcon;
