import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTexts } from '@/hooks/useTexts';
import { useGridDebug } from '@/contexts/GridDebugContext';
import CCLogo from '@/components/CCLogo';

const Footer = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const menuGroupRef = useRef(null);
  const mobileContainerRef = useRef(null);
  const [gap, setGap] = useState(0);
  const texts = useTexts();
  const { getDebugStyle, isSectionEnabled } = useGridDebug();

  // Copyright editable des de l'editor
  const [copyrightData, setCopyrightData] = useState(null);

  // Carregar dades del copyright des del localStorage (HomeEditor)
  useEffect(() => {
    const savedCopyright = localStorage.getItem('homeEditorCopyright');
    if (savedCopyright) {
      setCopyrightData(JSON.parse(savedCopyright));
    }
  }, []);

  // Creative Commons dinàmic amb any actual
  const currentYear = new Date().getFullYear();

  // Ordre per mòbil (5 col·leccions)
  const collectionsMobile = [
    { id: 'first-contact', name: texts.footer.collections.firstContact, path: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.svg' },
    { id: 'the-human-inside', name: texts.footer.collections.theHumanInside, path: '/the-human-inside', icon: '/custom_logos/collections/collection-thin-logo.svg' },
    { id: 'austen', name: texts.footer.collections.austen, path: '/austen', icon: '/custom_logos/collections/collection-jean-austen-logo.svg' },
    { id: 'cube', name: texts.footer.collections.cube, path: '/cube', icon: '/custom_logos/collections/collection-cube-logo.svg' },
    { id: 'miscellania', name: texts.footer.collections.miscellania, path: '/miscellania', icon: '/custom_logos/collections/collection-miscellania-logo.svg' }
  ];

  // Ordre per desktop (5 col·leccions)
  const collectionsDesktop = [
    { id: 'first-contact', name: texts.footer.collections.firstContact, path: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.svg' },
    { id: 'the-human-inside', name: texts.footer.collections.theHumanInside, path: '/the-human-inside', icon: '/custom_logos/collections/collection-thin-logo.svg' },
    { id: 'austen', name: texts.footer.collections.austen, path: '/austen', icon: '/custom_logos/collections/collection-jean-austen-logo.svg' },
    { id: 'cube', name: texts.footer.collections.cube, path: '/cube', icon: '/custom_logos/collections/collection-cube-logo.svg' },
    { id: 'miscellania', name: texts.footer.collections.miscellania, path: '/miscellania', icon: '/custom_logos/collections/collection-miscellania-logo.svg' }
  ];

  useEffect(() => {
    const calculateGap = () => {
      // Desktop gaps calculation
      if (!containerRef.current || !menuGroupRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;

      // Pas 1: Trobar posició del logo de la marca al header (esquerra)
      const headerLogo = document.querySelector('[data-brand-logo="1"]');
      if (!headerLogo) return;
      let leftPosition = 0;

      if (headerLogo) {
        const logoRect = headerLogo.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        leftPosition = logoRect.right - containerRect.left; // Final del logo
      }

      // Pas 2: Trobar posició de la icona del cistell al header (dreta)
      const cartButton = document.querySelector('header button[aria-label*="cistell"], header button img[src*="cart"]')?.closest('button');
      let rightPosition = containerWidth;

      if (cartButton) {
        const cartRect = cartButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        rightPosition = cartRect.left - containerRect.left; // Inici del cistell
      }

      // Pas 3: Calcular amplada disponible entre logo i cistell
      const availableWidth = rightPosition - leftPosition;

      // Pas 4: Distribuir uniformement: 5 imatges + 4 gaps
      // Fem que tots els gaps tinguin la mateixa amplada
      const imageWidth = availableWidth / 9; // 5 imatges + 4 gaps = 9 parts iguals

      setGap(imageWidth);
    };

    // Calcular al carregar i quan canviï la mida
    calculateGap();

    const handleResize = () => {
      calculateGap();
    };

    window.addEventListener('resize', handleResize);

    // Delays per assegurar que les fonts i imatges s'han carregat
    setTimeout(() => {
      calculateGap();
    }, 100);
    setTimeout(() => {
      calculateGap();
    }, 500);
    setTimeout(() => {
      calculateGap();
    }, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const goToUserTab = useCallback((tab) => {
    const now = Date.now();
    const ttl = 30 * 60 * 1000;
    sessionStorage.setItem('HG_MEGA_PAGE', JSON.stringify({ value: 4, expiresAt: now + ttl }));
    sessionStorage.setItem('HG_ACORDIO_EXPANDED_PAGE4', JSON.stringify({ value: true, expiresAt: now + ttl }));
    sessionStorage.setItem('HG_USER_ACTIVE_TAB', JSON.stringify({ value: tab, expiresAt: now + ttl }));
    window.dispatchEvent(new CustomEvent('hg:open-user-tab', { detail: { tab } }));
    navigate('/?active=first_contact');
  }, [navigate]);

  return (
    <footer
      className="bg-white transition-colors duration-200"
      style={{
        ...(isSectionEnabled('footer') ? getDebugStyle('footer', 'main') : {}),
      }}
    >
      {/* PEU DE COL·LECCIONS DESKTOP + TABLET - Centrat simètricament - Fons gris clar - VISIBLE PRIMER */}
      <div className="hidden md:block bg-muted transition-colors duration-200">
        <div ref={containerRef} className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          {/* Grup menú amb gaps calculats - centrat simètricament */}
          <div ref={menuGroupRef} className="flex items-center justify-center min-h-[110px]">
            {/* Col·leccions distribuïdes uniformement amb reducció simètrica */}
            {collectionsDesktop.map((collection, index) => {
              return (
                <React.Fragment key={index}>
                  <Link
                    to={collection.path}
                    className="group relative inline-flex items-center justify-center min-h-[110px] flex-shrink-0"
                    title={collection.name}
                    style={{
                      width: gap > 0 ? `${gap}px` : '110px',
                      alignSelf: collection.id === 'first-contact' ? 'flex-start' : 'center',
                      marginTop: collection.id === 'first-contact' ? '30px' : '0'
                    }}
                  >
                    <img
                        src={collection.icon}
                        alt={collection.name}
                        data-collection-id={collection.id}
                        className="transition-transform duration-300 w-full h-auto object-contain group-hover:scale-110"
                        style={{
                          display: 'block',
                          opacity: 1,
                          filter: 'brightness(0)',
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                    <span className="sr-only">{collection.name}</span>
                  </Link>
                {/* Gap després de cada col·lecció */}
                {index < collectionsDesktop.length - 1 && (
                  <div className="flex-shrink-0" style={{ width: gap > 0 ? `${gap}px` : '0px' }} />
                )}
              </React.Fragment>
            );
            })}
          </div>
        </div>
      </div>

      {/* PEU DE COL·LECCIONS MÒBIL - VISIBLE PRIMER EN MÒBIL */}
      <div className="md:hidden bg-muted transition-colors duration-200">
        <div ref={mobileContainerRef} className="max-w-7xl mx-auto px-4 py-12 min-h-[100px]">
          {/* Imatges de col·leccions en grid de 3 columnes */}
          <motion.div
            className="grid grid-cols-5 gap-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* 5 col·leccions en grid de 3 columnes */}
            {collectionsMobile.map((collection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                className="flex items-center justify-center h-20"
              >
                <Link
                  to={collection.path}
                  className="flex items-center justify-center transition-transform group w-20 hover:scale-110 active:scale-95"
                  title={collection.name}
                  style={{
                    alignSelf: 'center',
                    marginTop: '0'
                  }}
                >
                  <img
                      src={collection.icon}
                      alt={collection.name}
                      data-collection-id={collection.id}
                      className="w-full max-h-20 h-auto object-contain block transition-transform duration-300 group-hover:scale-110"
                      style={{
                        opacity: 1,
                        filter: 'brightness(0)',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  <span className="sr-only">{collection.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* PEU DELS SERVEIS - Grid simple i responsive - Fons blanc - SEGON */}
      <div className="bg-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-[60px] md:py-[82px] lg:py-[98px] px-4 lg:px-8">
          <div
            className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12 lg:gap-x-12 mx-auto"
            style={{ ...(isSectionEnabled('footer') ? getDebugStyle('footer', 'row1') : {}), maxWidth: '600px' }}
          >
            {/* Client */}
            <div className="text-left">
              <p className="font-oswald font-semibold mb-2 md:mb-3 lg:mb-4 text-[10pt] md:text-[13pt] lg:text-[14pt] text-foreground">Client</p>
              <ul className="space-y-1.5 md:space-y-2.5 lg:space-y-3 text-left">
                <li><button onClick={() => goToUserTab('COMANDES')} className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Comandes</button></li>
                <li><button onClick={() => goToUserTab('MISSATGES')} className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Missatges</button></li>
                <li><button onClick={() => goToUserTab('COMPTE')} className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Compte</button></li>
                <li><Link to="/shipping" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Transport</Link></li>
              </ul>
            </div>

            {/* Informació */}
            <div className="text-left">
              <p className="font-oswald font-semibold mb-2 md:mb-3 lg:mb-4 text-[10pt] md:text-[13pt] lg:text-[14pt] text-foreground">Informació</p>
              <ul className="space-y-1.5 md:space-y-2.5 lg:space-y-3 text-left">
                <li><Link to="/sizing" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Talles i Cura</Link></li>
                <li><Link to="/contact" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Contacte</Link></li>
                <li><Link to="/about" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Qui som</Link></li>
                <li><Link to="/faq" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>FAQ</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-left">
              <p className="font-oswald font-semibold mb-2 md:mb-3 lg:mb-4 text-[10pt] md:text-[13pt] lg:text-[14pt] text-foreground">Legal</p>
              <ul className="space-y-1.5 md:space-y-2.5 lg:space-y-3 text-left">
                <li><Link to="/shipping" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Enviaments i Devolucions</Link></li>
                <li><Link to="/terms" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Termes i Condicions</Link></li>
                <li><Link to="/privacy" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Política de Privacitat</Link></li>
                <li><Link to="/legal" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Avís Legal</Link></li>
                <li><Link to="/cookies" className="font-roboto text-[10px] md:text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Cookies</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Peu del Logo Mòbil - Només el logo - Fons gris clar - VISIBLE NOMÉS EN MÒBIL */}
      <div className="md:hidden bg-muted transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            className="flex items-center justify-center min-h-[70px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
          >
            <Link to="/" aria-label="GRÀFIC - Pàgina d'inici" className="flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
              <img
                src="/custom_logos/brand/higgins-grafic-negre.png"
                alt="Higgins Gràfic"
                className="h-[37.5px] w-[160px] block object-contain"
              />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Peu del Logo Desktop - Només el logo - Fons gris clar - OCULT EN MÒBIL */}
      <div className="hidden md:block bg-muted transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          <div className="flex items-center justify-center min-h-[80px]">
            <Link to="/" className="transition-transform hover:scale-105">
              <img
                src="/custom_logos/brand/higgins-grafic-negre.png"
                alt="Higgins Gràfic"
                className="h-[49.5px] w-[200px] block object-contain"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Peu del Copyright - Fons blanc */}
      <div className="bg-white px-4 lg:px-8 py-12 lg:py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          {copyrightData ? (
            <p
              className="inline-flex items-center justify-center gap-2 text-muted-foreground"
              style={{
                fontFamily: copyrightData.font || 'Roboto',
                fontSize: copyrightData.fontSize || '14px',
                opacity: 0.7
              }}
            >
              {copyrightData.text}
            </p>
          ) : (
            <p className="font-roboto text-[12pt] lg:text-[14pt] font-normal inline-flex items-center justify-center gap-2 text-muted-foreground" style={{ opacity: 0.7 }}>
              <span className="inline-flex items-center">GRÀFIC</span>
              <span className="inline-flex items-center gap-2">
                <CCLogo className="h-[1em] w-auto" />
                <span className="inline-flex items-center">2023-{currentYear}</span>
              </span>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};
export default memo(Footer);
