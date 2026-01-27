import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostra el botó quan l'usuari baixa 300px i només en pantalles >= 768px (tablet i desktop)
      const isMobile = window.innerWidth < 768;
      if (window.scrollY > 300 && !isMobile) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    window.addEventListener('resize', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('resize', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={scrollToTop}
          className="fixed bottom-12 lg:bottom-16 right-8 z-50 p-3 rounded-full shadow-lg hover:shadow-xl transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
          style={{ backgroundColor: '#141414' }}
          aria-label="Tornar a dalt"
          title="Tornar a dalt"
        >
          <ArrowUp className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
