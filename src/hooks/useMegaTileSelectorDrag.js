import { useCallback, useEffect, useRef } from 'react';
import {
  setMegaPublicSelectorFor,
  touchMegaPublicActivity,
} from '@/components/fullwide/megaPublicSelectorState.js';

/**
 * Manages pointer-driven drag of the mega-tile selector ring across the
 * mega-slide row. Returns a handler to start a drag from a `pointerdown`
 * listener; the hook itself wires the matching `pointermove`/`pointerup`/
 * `pointercancel` listeners on `window`.
 */
export default function useMegaTileSelectorDrag() {
  const dragRef = useRef({
    active: false,
    collectionId: '',
    keyset: 'v1',
    bounds: { minStepX: -99, maxStepX: 99, lockStepY: false },
    startX: 0,
    startY: 0,
    startStepX: 0,
    startStepY: 0,
  });

  const onStartSelectorDrag = useCallback((e, selectorParams, bounds) => {
    try {
      if (!e) return;
      if (!bounds) return;
      const minStepX = Number.isFinite(Number(bounds?.minStepX)) ? Number(bounds.minStepX) : -99;
      const maxStepX = Number.isFinite(Number(bounds?.maxStepX)) ? Number(bounds.maxStepX) : 99;
      const lockStepY = Boolean(bounds?.lockStepY);
      dragRef.current.active = true;
      dragRef.current.collectionId = String(selectorParams?.collectionId || '');
      dragRef.current.keyset = String(selectorParams?.keyset || 'v1');
      dragRef.current.bounds = { minStepX, maxStepX, lockStepY };
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      const rawStepX = Number.isFinite(Number(selectorParams?.stepX)) ? Number(selectorParams?.stepX) : 0;
      const rawStepY = Number.isFinite(Number(selectorParams?.stepY)) ? Number(selectorParams?.stepY) : 0;
      dragRef.current.startStepX = Math.min(maxStepX, Math.max(minStepX, rawStepX));
      dragRef.current.startStepY = lockStepY ? 0 : rawStepY;
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const getPitchPx = () => {
      try {
        const gapPx = 12;
        const el = document.querySelector('[data-mega-tile="1"]');
        const w = el?.getBoundingClientRect?.().width;
        const baseTilePx = Number.isFinite(Number(w)) && Number(w) > 0 ? Number(w) : 120;
        return baseTilePx + gapPx;
      } catch {
        return 132;
      }
    };

    const onMove = (e) => {
      try {
        if (!dragRef.current?.active) return;
        const pitchPx = getPitchPx();
        if (!pitchPx) return;

        const collectionId = String(dragRef.current?.collectionId || '');
        const keyset = String(dragRef.current?.keyset || 'v1');
        if (!collectionId) return;

        const minStepX = Number.isFinite(Number(dragRef.current?.bounds?.minStepX))
          ? Number(dragRef.current.bounds.minStepX)
          : -99;
        const maxStepX = Number.isFinite(Number(dragRef.current?.bounds?.maxStepX))
          ? Number(dragRef.current.bounds.maxStepX)
          : 99;
        const lockStepY = Boolean(dragRef.current?.bounds?.lockStepY);

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const nextStepX = Math.round(dragRef.current.startStepX + dx / pitchPx);
        const nextStepY = Math.round(dragRef.current.startStepY + dy / pitchPx);
        const sx = Math.min(maxStepX, Math.max(minStepX, nextStepX));
        const sy = lockStepY ? 0 : Math.min(99, Math.max(-99, nextStepY));
        setMegaPublicSelectorFor(collectionId, keyset, { stepX: sx, stepY: sy });
        touchMegaPublicActivity();
        window.dispatchEvent(new Event('mega-tile-selector-changed'));
      } catch {
        // ignore
      }
    };

    const onUp = () => {
      try {
        if (!dragRef.current) return;
        dragRef.current.active = false;
      } catch {
        // ignore
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return onStartSelectorDrag;
}
