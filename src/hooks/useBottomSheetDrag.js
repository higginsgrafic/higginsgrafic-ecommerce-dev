import { useCallback, useRef, useState } from 'react';

export function useBottomSheetDrag({ closedTranslate, openTranslate, threshold = 0.08, velocityThreshold = 0.5 } = {}) {
  const [state, setState] = useState('closed');
  const [translateY, setTranslateY] = useState(null);
  const dragRef = useRef({ active: false, startY: 0, moved: false, startState: 'closed', startTime: 0, lastY: 0, lastTime: 0, velocity: 0 });

  const closed = closedTranslate ?? 0;
  const open = openTranslate ?? 0;

  const onPointerDown = useCallback((e) => {
    dragRef.current = {
      active: true,
      startY: e.clientY,
      moved: false,
      startState: state,
      startTime: Date.now(),
      lastY: e.clientY,
      lastTime: Date.now(),
      velocity: 0,
    };
    e.preventDefault();
  }, [state]);

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d.active) return;
    const now = Date.now();
    const dt = now - d.lastTime;
    if (dt > 0) {
      const dy = e.clientY - d.lastY;
      d.velocity = dy / dt; // px per ms
      d.lastY = e.clientY;
      d.lastTime = now;
    }
    const delta = e.clientY - d.startY;
    if (Math.abs(delta) > 8) d.moved = true;
    const startT = d.startState === 'open' ? open : closed;
    const newT = Math.max(Math.min(open, closed), Math.min(Math.max(open, closed), startT + delta));
    setTranslateY(newT);
  }, [closed, open]);

  const onPointerUp = useCallback((e) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    setTranslateY(null);
    if (!d.moved) return;
    const delta = e.clientY - d.startY;
    const vh = window.innerHeight;
    const distThreshold = threshold * vh;
    const vel = Math.abs(d.velocity);
    // Flick ràpid: tanca/obre amb poca distància
    const isFlick = vel > velocityThreshold;
    if (isFlick) {
      // Velocitat negativa = amunt = obrir; positiva = avall = tancar
      if (d.velocity < -velocityThreshold) setState('open');
      else if (d.velocity > velocityThreshold) setState('closed');
      return;
    }
    // Sense flick: llindar de distància (més baix)
    if (delta < -distThreshold) setState('open');
    else if (delta > distThreshold) setState('closed');
  }, [threshold, velocityThreshold]);

  const onPointerCancel = useCallback(() => {
    dragRef.current.active = false;
    setTranslateY(null);
  }, []);

  const close = useCallback(() => setState('closed'), []);
  const open_ = useCallback(() => setState('open'), []);

  return {
    state,
    translateY,
    isDragging: translateY !== null,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    close,
    open: open_,
  };
}
