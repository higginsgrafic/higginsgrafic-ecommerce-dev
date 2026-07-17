import React, { memo } from 'react';
import { Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTexts } from '@/hooks/useTexts';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGridDebug } from '@/contexts/GridDebugContext';

const OffersHeader = ({ adminBannerVisible = false }) => {
  const texts = useTexts();
  const navigate = useNavigate();
  const { enabled, text, loading, bgColor, textColor, fontSize, font, link, clickable } = useOffersConfig();
  const { getDebugStyle, isSectionEnabled } = useGridDebug();

  // Determinar si s'ha de mostrar (mentre carrega o quan està enabled)
  const shouldShow = enabled && !loading;

  // Determinar si és clicable
  const isClickable = clickable && link;

  const handleClick = () => {
    if (isClickable) {
      // Si l'enllaç comença amb http:// o https://, navegar externament
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank');
      } else {
        // Si és una ruta interna, usar navigate
        navigate(link);
      }
    }
  };

  const marqueeContent = (
    <div
      className="flex items-start justify-center flex-shrink-0 px-12"
      style={{
        fontFamily: font || 'Roboto',
        fontSize: fontSize || '14px',
        color: 'hsl(var(--primary-foreground))',
        cursor: isClickable ? 'pointer' : 'default'
      }}
      onClick={handleClick}
    >
      <Truck className="h-5 w-5 mr-1 scale-x-[-1] flex-shrink-0 mt-[0.1em]" style={{ color: 'hsl(var(--primary-foreground))' }} />
      <span>
        {text || texts.offersHeader.freeShipping}
      </span>
    </div>
  );

  // Chaotic, unpredictable variants
  // Combined X scrolling with random Y bouncing
  const chaoticVariants = {
    animate: {
      x: [0, -100, -50, -500, -200, -800, -1200],
      y: [0, -4, 0, 0, -8, 0, -2, 0, 0, -5, 0], // Bouncing effect
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          times: [0, 0.1, 0.2, 0.4, 0.5, 0.8, 1],
          ease: ["easeInOut", "circIn", "linear", "backOut", "easeInOut", "linear"]
        },
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 3, // Faster duration for bouncing
          ease: "easeInOut"
        }
      }
    }
  };

  return (
    <>
      {/* Banner animat d'ofertes */}
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 text-white text-sm flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden ${isClickable ? 'pointer-events-auto' : 'pointer-events-none'}`}
        data-offers-header="true"
        initial={false}
        animate={{
          height: shouldShow ? '40px' : '0px',
          opacity: shouldShow ? 1 : 0
        }}
        transition={{
          duration: 0.35,
          ease: [0.32, 0.72, 0, 1]
        }}
        style={{
          top: adminBannerVisible ? '40px' : '0px',
          backgroundColor: 'hsl(var(--foreground))',
          ...(isSectionEnabled('header') ? getDebugStyle('header', 'row2') : {})
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center whitespace-nowrap relative w-full">
          <motion.div
            className="flex"
            variants={chaoticVariants}
            animate="animate"
          >
            {[...Array(20)].map((_, i) => (
              <React.Fragment key={i}>
                {marqueeContent}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default memo(OffersHeader);
