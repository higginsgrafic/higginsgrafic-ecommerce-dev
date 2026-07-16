import { useState, useEffect } from 'react';

export default function useContentLayout({ isFullWideSlideDemoRoute, isHomeRoute, locationPathname }) {
  const [fullWideSlideManualEnabled, setFullWideSlideManualEnabled] = useState(false);
  const [contentContainerLeft, setContentContainerLeft] = useState(null);
  const [contentContainerRight, setContentContainerRight] = useState(null);

  useEffect(() => {
    if (!(isFullWideSlideDemoRoute || isHomeRoute)) {
      setFullWideSlideManualEnabled(false);
      return undefined;
    }

    const readControls = () => {
      try {
        const enabled = window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
        setFullWideSlideManualEnabled(enabled);
      } catch {
        setFullWideSlideManualEnabled(false);
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'FULL_WIDE_SLIDE_DEMO_MANUAL' || e.key === 'FULL_WIDE_SLIDE_DEMO_PHASE') {
        readControls();
      }
    };

    const onLocalChange = () => readControls();

    readControls();
    window.addEventListener('storage', onStorage);
    window.addEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    };
  }, [isFullWideSlideDemoRoute, isHomeRoute]);

  const writeFullWideSlideDemoControls = ({ enabled }) => {
    try {
      window.localStorage.setItem('FULL_WIDE_SLIDE_DEMO_MANUAL', enabled ? '1' : '0');
    } catch {
      // ignore
    }

    try {
      window.dispatchEvent(new Event('full-wide-slide-demo-controls-changed'));
    } catch {
      // ignore
    }

    setFullWideSlideManualEnabled(enabled);
  };

  useEffect(() => {
    const update = () => {
      const candidates = Array.from(document.querySelectorAll('.mx-auto[class*="max-w-[1400px]"]'));
      const best = candidates
        .map((el) => ({ el, rect: el?.getBoundingClientRect?.() }))
        .filter((x) => x.rect && Number.isFinite(x.rect.left) && Number.isFinite(x.rect.width) && x.rect.width > 0)
        .sort((a, b) => b.rect.width - a.rect.width)[0];

      const rect = best?.rect;
      if (!rect || !Number.isFinite(rect.left) || rect.left <= 0) {
        setContentContainerLeft(null);
        setContentContainerRight(null);
        return;
      }
      setContentContainerLeft(rect.left);
      setContentContainerRight(rect.left + rect.width);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [locationPathname]);

  return {
    fullWideSlideManualEnabled,
    writeFullWideSlideDemoControls,
    contentContainerLeft,
    contentContainerRight,
  };
}
