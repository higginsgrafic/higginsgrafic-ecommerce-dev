import React, { useEffect, useRef, useState } from 'react';

/**
 * OptimizedImg
 * -----------------------------------------------------------------------------
 * `<img>` amb fallback automàtic a WebP i, si no es pot carregar, l'original.
 * Pensat per als tiles del mega-slide on els assets s'han generat en `.webp`
 * al costat dels originals.
 *
 * Comportament:
 *  - Normalitza la ruta (afegeix `/` inicial si cal, respecta http(s)/data/blob).
 *  - Intenta primer la versió `.webp`. Si falla, cau a l'original.
 *  - Aplica `loading="lazy"` i `decoding="async"` per defecte.
 *  - En mode DEV, registra errors de tiles concrets per facilitar el debug
 *    (només per a rutes de dibuixos custom).
 */
const OptimizedImg = React.forwardRef(function OptimizedImg(
  { src, alt, className, style, ...rest },
  ref
) {
  const normalizeSrc = (value) => {
    const s = (value || '').toString();
    if (!s) return '';
    if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
    return s.startsWith('/') ? s : `/${s}`;
  };

  const originalSrc = normalizeSrc(src);
  const webpSrc = originalSrc.replace(/\.(png|jpe?g)(?=([?#]|$))/i, '.webp');
  const [currentSrc, setCurrentSrc] = useState(webpSrc);
  const triedFallbackRef = useRef(false);

  useEffect(() => {
    triedFallbackRef.current = false;
    setCurrentSrc(webpSrc);
  }, [webpSrc]);

  return (
    <img
      ref={ref}
      src={currentSrc ? encodeURI(currentSrc) : undefined}
      alt={alt}
      className={className}
      style={style}
      loading={rest?.loading || 'lazy'}
      decoding="async"
      onError={() => {
        if (import.meta.env.DEV) {
          const s = (currentSrc || originalSrc || src || '').toString();
          const shouldLog =
            s.includes('/custom_logos/drawings/images_grid/cube/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/cube/')
            || s.includes('/custom_logos/drawings/images_grid/the_human_inside/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/the_human_inside/')
            || s.includes('/custom_logos/drawings/images_grid/first_contact/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/first_contact/')
            || s.includes('/custom_logos/drawings/images_grid/miscel');
          if (shouldLog) {
            // eslint-disable-next-line no-console
            console.error('[OptimizedImg] tile error loading', { src, currentSrc, originalSrc });
          }
        }
        if (triedFallbackRef.current) return;
        triedFallbackRef.current = true;
        if (currentSrc !== originalSrc) setCurrentSrc(originalSrc);
      }}
      {...rest}
    />
  );
});

export default OptimizedImg;
