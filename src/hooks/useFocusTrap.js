import { useEffect } from 'react';

/**
 * Hook per implementar focus trap en modals/sidebars
 * Millora l'accessibilitat mantenint el focus dins del component
 */
export const useFocusTrap = (isOpen, containerRef) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && containerRef.current) {
        // Pot cridar a una funció onClose si es passa com a paràmetre
        const closeButton = container.querySelector('[aria-label*="Tanca"], [aria-label*="tancar"]');
        if (closeButton) {
          closeButton.click();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus primer element al obrir
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, containerRef]);
};

export default useFocusTrap;
