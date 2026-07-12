import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_TILE_STYLE = {
  width: '450px',
  height: '450px',
  backgroundColor: '#f5f5f5',
  position: 'relative',
  transform: 'scale(0.8822222222)',
  transformOrigin: 'bottom left',
  boxShadow: 'none',
};

const DEFAULT_TEXT_BLOCK_STYLE = {
  width: '397px',
};

const normalizeOverlaySrc = (value) => {
  const s = (value || '').toString().trim();
  if (!s) return null;
  if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
  return s.startsWith('/') ? s : `/${s}`;
};

export default function ProductCard({
  href,
  imageSrc,
  imageAlt = 'Producte',
  topPx = 161,
  leftPx = 0,
  tileStyle = DEFAULT_TILE_STYLE,
  textBlockStyle = DEFAULT_TEXT_BLOCK_STYLE,
  overlaySrc = null,
  overlayEnabled = false,
  brand = 'THE HUMAN INSIDE',
  title = 'IRON KONG',
  price = '19,99 €',
  onNavigateBlocked,
  cardIndex,
  positionKey,
}) {
  const overlayHref = overlayEnabled && overlaySrc ? normalizeOverlaySrc(overlaySrc) : null;

  return (
    <Link
      key={positionKey}
      to={href}
      className="block"
      data-component="product-card"
      data-card-index={cardIndex}
      draggable={false}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onDragStartCapture={(e) => {
        e.preventDefault();
      }}
      onClick={(e) => {
        if (onNavigateBlocked && onNavigateBlocked()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      style={{
        position: 'absolute',
        top: `${topPx}px`,
        left: `${leftPx}px`,
        userSelect: 'none',
        WebkitUserDrag: 'none',
      }}
    >
      <div style={{ ...textBlockStyle, position: 'relative' }}>
        <div
          className="overflow-hidden flex items-center justify-center"
          style={{ ...tileStyle, position: 'relative' }}
          data-component="product-tile"
        >
          {imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt={imageAlt}
                draggable={false}
                onDragStart={(e) => {
                  e.preventDefault();
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '48px',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                }}
                loading="eager"
                decoding="async"
              />

              {overlayHref ? (
                <img
                  src={encodeURI(overlayHref)}
                  alt=""
                  draggable={false}
                  onDragStart={(e) => {
                    e.preventDefault();
                  }}
                  onError={() => {
                    try {
                      // eslint-disable-next-line no-console
                      console.error('[ProductCard] drawing overlay failed to load', { overlaySrc });
                    } catch {
                      // ignore
                    }
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    WebkitUserDrag: 'none',
                    opacity: 0.98,
                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.65))',
                    transformOrigin: 'top center',
                    transform:
                      'translate(var(--hgShirtOverlayDx, 0px), var(--hgShirtOverlayDy, 0px)) scale(var(--hgShirtOverlayScale, 1))',
                  }}
                  loading="eager"
                  decoding="async"
                />
              ) : null}
            </>
          ) : null}
        </div>

        <div style={{ marginTop: '8px', fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif' }}>
          <div>
            <div
              style={{
                position: 'relative',
                top: '3px',
                marginTop: '2px',
                fontSize: '10px',
                fontWeight: 500,
                lineHeight: 1.2,
                color: 'hsl(var(--muted-foreground))',
                fontKerning: 'normal',
                letterSpacing: '0.14em',
              }}
            >
              {brand}
            </div>
            <div
              style={{
                position: 'relative',
                top: '6px',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.1,
                color: 'hsl(var(--foreground))',
              }}
            >
              {title}
            </div>
            <div
              style={{
                position: 'relative',
                top: '7px',
                left: '-1px',
                marginTop: '6px',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: 1.1,
                color: 'hsl(var(--foreground))',
              }}
            >
              {price}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
