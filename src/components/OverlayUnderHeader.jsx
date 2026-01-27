import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

export default function OverlayUnderHeader({ open, onClose, children }) {
  const portalRoot = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return document.body;
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !portalRoot) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 bottom-0 z-[20000]"
      style={{ top: 'var(--appHeaderOffset, 0px)' }}
    >
      <div className="absolute inset-0 bg-black/30" onClick={() => onClose?.()} />
      <div className="relative h-full overflow-y-auto bg-white">
        {children}
      </div>
    </div>,
    portalRoot
  );
}
