import React from 'react';

const BAND_HEIGHT = {
  title: 'var(--page-band-title-height)',
  hero: 'var(--page-band-hero-height)',
  transition: 'var(--page-band-transition-height)',
  related: 'var(--page-band-related-height)',
  footer: 'var(--page-band-footer-height)',
};

export default function PageBand({
  as: Element = 'section',
  type,
  fluid = false,
  className,
  style,
  children,
  ...props
}) {
  const height = BAND_HEIGHT[type];

  return (
    <Element
      className={className}
      data-page-band={type}
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        ...(height && !fluid ? { height, minHeight: height } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </Element>
  );
}
