import { useState, useEffect } from 'react';

/**
 * useIsMobile — retorna true quan el viewport és mòbil (< 768px).
 * Es manté sincronitzat amb resize i orientationchange.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return isMobile;
}
