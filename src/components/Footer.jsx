import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTexts } from '@/hooks/useTexts';
import { useGridDebug } from '@/contexts/GridDebugContext';
import CCLogo from '@/components/CCLogo';

const Footer = ({ copyrightOnly = false }) => {
  const containerRef = useRef(null);
  const menuGroupRef = useRef(null);
  const measureRef = useRef(null);
  const mobileContainerRef = useRef(null);
  const copyrightFooterRef = useRef(null);
  const [gap, setGap] = useState(0);
  const [gapToLogo, setGapToLogo] = useState(0);
  const [mobileGap, setMobileGap] = useState(0);
  const [mobileGapToLogo, setMobileGapToLogo] = useState(0);
  const [cartPosition, setCartPosition] = useState(0);
  const [tabletLeftColumn, setTabletLeftColumn] = useState(0);
  const [tabletRightColumn, setTabletRightColumn] = useState(0);
  const [isTablet, setIsTablet] = useState(false);
  const [higginsAlignYDesktop, setHigginsAlignYDesktop] = useState(0);
  const [higginsAlignYMobile, setHigginsAlignYMobile] = useState(0);
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

  useEffect(() => {
    if (!copyrightOnly) return undefined;

    const update = () => {
      try {
        const h = copyrightFooterRef.current?.offsetHeight;
        if (!Number.isFinite(h) || h <= 0) return;
        document.documentElement.style.setProperty('--copyrightFooterHeight', `${Math.round(h)}px`);
      } catch {
        // ignore
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      try {
        document.documentElement.style.removeProperty('--copyrightFooterHeight');
      } catch {
        // ignore
      }
    };
  }, [copyrightOnly]);



  // Creative Commons dinàmic amb any actual
  const currentYear = new Date().getFullYear();

  const copyrightOnlyMarkup = (
    <footer
      ref={copyrightFooterRef}
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-border transition-colors duration-200"
      style={isSectionEnabled('footer') ? getDebugStyle('footer', 'main') : {}}
    >
      <div className="bg-white px-4 lg:px-8 py-12 lg:py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          {copyrightData ? (
            <p
              className="inline-flex items-center justify-center gap-2 text-muted-foreground"
              style={{
                fontFamily: copyrightData.font || 'Roboto',
                fontSize: copyrightData.fontSize || '14px',
                opacity: 0.7,
              }}
            >
              {copyrightData.text}
            </p>
          ) : (
            <p
              className="font-roboto text-[12pt] lg:text-[14pt] font-normal inline-flex items-center justify-center gap-2 text-muted-foreground"
              style={{ opacity: 0.7 }}
            >
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

  // Ordre per mòbil (Higgins al mig - posició 5)
  const collectionsMobile = [
    { id: 'first-contact', name: texts.footer.collections.firstContact, path: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.svg' },
    { id: 'the-human-inside', name: texts.footer.collections.theHumanInside, path: '/the-human-inside', icon: '/custom_logos/collections/collection-thin-logo.svg' },
    { id: 'austen', name: texts.footer.collections.austen, path: '/austen', icon: '/custom_logos/collections/collection-jean-austen-logo.svg' },
    { id: 'outcasted', name: texts.footer.collections.outcasted, path: '/outcasted', icon: '/custom_logos/collections/collection-outcasted-logo.svg' },
    { id: 'higgins-grafic', name: 'HIGGINS GRÀFIC', path: '/higginsgrafic', icon: '/custom_logos/brand/grup-higgins-logo.svg' },
    { id: 'cube', name: texts.footer.collections.cube, path: '/cube', icon: '/custom_logos/collections/collection-cube-logo.svg' }
  ];

  // Ordre per desktop (Higgins l'últim)
  const collectionsDesktop = [
    { id: 'first-contact', name: texts.footer.collections.firstContact, path: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.svg' },
    { id: 'the-human-inside', name: texts.footer.collections.theHumanInside, path: '/the-human-inside', icon: '/custom_logos/collections/collection-thin-logo.svg' },
    { id: 'austen', name: texts.footer.collections.austen, path: '/austen', icon: '/custom_logos/collections/collection-jean-austen-logo.svg' },
    { id: 'outcasted', name: texts.footer.collections.outcasted, path: '/outcasted', icon: '/custom_logos/collections/collection-outcasted-logo.svg' },
    { id: 'cube', name: texts.footer.collections.cube, path: '/cube', icon: '/custom_logos/collections/collection-cube-logo.svg' },
    { id: 'higgins-grafic', name: 'HIGGINS GRÀFIC', path: '/higginsgrafic', icon: '/custom_logos/brand/grup-higgins-logo.svg' }
  ];

  useEffect(() => {
    const calculateGap = () => {
      // Desktop gaps calculation
      if (!containerRef.current || !menuGroupRef.current || !measureRef.current) return;

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
        setCartPosition(rightPosition); // Guardar posició del cistell
      }

      // Pas 3: Calcular amplada disponible entre logo i cistell
      const availableWidth = rightPosition - leftPosition;

      // Pas 4: Distribuir uniformement: 6 imatges + 5 gaps
      // Fem que tots els gaps tinguin la mateixa amplada
      const imageWidth = availableWidth / 11; // 6 imatges + 5 gaps = 11 parts iguals

      setGap(imageWidth);
      setGapToLogo(leftPosition); // Alinear amb el final del logo del header
    };

    const calculateHigginsAlignment = () => {
      try {
        // Desktop: align Higgins top with Cube top
        if (menuGroupRef.current) {
          const cubeImg = menuGroupRef.current.querySelector('[data-collection-id="cube"]');
          const higginsImg = menuGroupRef.current.querySelector('[data-collection-id="higgins-grafic"]');
          if (cubeImg && higginsImg) {
            const cubeRect = cubeImg.getBoundingClientRect();
            const higginsRect = higginsImg.getBoundingClientRect();
            const delta = cubeRect.top - higginsRect.top;
            setHigginsAlignYDesktop(Number.isFinite(delta) ? Math.round(delta) : 0);
          }
        }

        // Mobile: align Higgins top with Cube top
        if (mobileContainerRef.current) {
          const cubeImg = mobileContainerRef.current.querySelector('[data-collection-id="cube"]');
          const higginsImg = mobileContainerRef.current.querySelector('[data-collection-id="higgins-grafic"]');
          if (cubeImg && higginsImg) {
            const cubeRect = cubeImg.getBoundingClientRect();
            const higginsRect = higginsImg.getBoundingClientRect();
            const delta = cubeRect.top - higginsRect.top;
            setHigginsAlignYMobile(Number.isFinite(delta) ? Math.round(delta) : 0);
          }
        }
      } catch {
        // no-op
      }
    };

    const calculateMobileGap = () => {
      // Mobile gaps calculation
      if (!mobileContainerRef.current) return;

      const mobileContainer = mobileContainerRef.current;
      const mobileContainerWidth = mobileContainer.offsetWidth;

      // Trobar posició del logo del header (esquerra)
      const headerLogo = document.querySelector('header img[alt="GRAFC"]');
      let leftPosition = 0;

      if (headerLogo) {
        const logoRect = headerLogo.getBoundingClientRect();
        const containerRect = mobileContainer.getBoundingClientRect();
        leftPosition = logoRect.right - containerRect.left; // Fi del logo
      }

      // Trobar posició de la icona d'hamburguesa del header (dreta)
      const hamburgerButton = document.querySelector('header button svg');
      let rightPosition = mobileContainerWidth;

      if (hamburgerButton) {
        const hamburgerRect = hamburgerButton.getBoundingClientRect();
        const containerRect = mobileContainer.getBoundingClientRect();
        rightPosition = hamburgerRect.left - containerRect.left; // Inici de la hamburguesa
      }

      // Amplada disponible entre logo i hamburguesa
      const availableWidth = rightPosition - leftPosition;

      // Distribuir uniformement: 6 imatges + 5 gaps = 11 parts iguals
      const imageWidth = availableWidth / 11;

      setMobileGap(imageWidth);
      setMobileGapToLogo(leftPosition); // Posició on comença el primer logo en mòbil
    };

    const calculateTabletColumns = () => {
      // Tablet columns calculation - Alinear amb logos First Contact i Austen
      if (!containerRef.current || !menuGroupRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      // Trobar TOTS els logos de les col·leccions
      const allLogos = menuGroupRef.current.querySelectorAll('img');

      if (allLogos.length >= 6) {
        // Logo First Contact = primer logo (índex 0)
        const firstContactRect = allLogos[0].getBoundingClientRect();
        const leftColumnPosition = firstContactRect.left - containerRect.left;
        setTabletLeftColumn(leftColumnPosition);

        // Logo Austen = tercer logo (índex 2)
        const austenRect = allLogos[2].getBoundingClientRect();
        const rightColumnPosition = austenRect.left - containerRect.left;
        setTabletRightColumn(rightColumnPosition);
      }
    };

    // Detectar si estem en tablet
    const checkIfTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };

    // Calcular al carregar i quan canviï la mida
    checkIfTablet();
    calculateGap();
    calculateMobileGap();
    calculateTabletColumns();
    // Align after initial layout
    requestAnimationFrame(calculateHigginsAlignment);

    const handleResize = () => {
      checkIfTablet();
      calculateGap();
      calculateMobileGap();
      calculateTabletColumns();
      requestAnimationFrame(calculateHigginsAlignment);
    };

    window.addEventListener('resize', handleResize);

    // Delays per assegurar que les fonts i imatges s'han carregat
    setTimeout(() => {
      calculateGap();
      calculateMobileGap();
      calculateTabletColumns();
      calculateHigginsAlignment();
    }, 100);
    setTimeout(() => {
      calculateGap();
      calculateMobileGap();
      calculateTabletColumns();
      calculateHigginsAlignment();
    }, 500);
    setTimeout(() => {
      calculateGap();
      calculateMobileGap();
      calculateTabletColumns();
      calculateHigginsAlignment();
    }, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (copyrightOnly) return copyrightOnlyMarkup;

  return (
    <footer
      className="bg-white transition-colors duration-200"
      style={isSectionEnabled('footer') ? getDebugStyle('footer', 'main') : {}}
    >
      {/* Element invisible per mesurar textos */}
      <span
        ref={measureRef}
        className="font-oswald text-[18.4pt] font-normal uppercase whitespace-nowrap"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
      />

      {/* PEU DE COL·LECCIONS DESKTOP - Centrat simètricament - Fons gris clar - VISIBLE PRIMER */}
      <div className="hidden lg:block bg-muted transition-colors duration-200">
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
                    {collection.id === 'the-human-inside' ? (
                      <span
                        aria-hidden="true"
                        data-collection-id={collection.id}
                        className={`transition-transform duration-300 w-full ${
                          collection.id === 'higgins-grafic' ? '' : 'group-hover:scale-110'
                        }`}
                        style={{
                          display: 'block',
                          opacity: 1,
                          height: '70px',
                          backgroundColor: 'currentColor',
                          WebkitMaskImage: `url(${collection.icon})`,
                          maskImage: `url(${collection.icon})`,
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          transform: 'scale(1.18)',
                          transformOrigin: 'center',
                        }}
                      />
                    ) : (
                      <img
                        src={collection.icon}
                        alt={collection.name}
                        data-collection-id={collection.id}
                        className={`transition-transform duration-300 w-full h-auto object-contain ${
                          collection.id === 'higgins-grafic' ? '' : 'group-hover:scale-110'
                        }`}
                        style={{
                          display: 'block',
                          opacity: 1,
                          transform: collection.id === 'higgins-grafic'
                            ? `translateY(${higginsAlignYDesktop}px) scale(1.10)`
                            : undefined,
                          transformOrigin: collection.id === 'higgins-grafic' ? 'center' : undefined
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
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
      <div className="lg:hidden bg-muted transition-colors duration-200">
        <div ref={mobileContainerRef} className="max-w-7xl mx-auto px-4 py-12 min-h-[100px]">
          {/* Imatges de col·leccions en grid de 3 columnes */}
          <motion.div
            className="grid grid-cols-3 gap-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Primera fila: First Contact, The Human Inside, Austen */}
            {collectionsMobile.slice(0, 3).map((collection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                className="flex items-center justify-center"
              >
                <Link
                  to={collection.path}
                  className={`flex items-center justify-center transition-transform group w-20 ${
                    collection.id === 'higgins-grafic' ? '' : 'hover:scale-110 active:scale-95'
                  }`}
                  title={collection.name}
                  style={{
                    alignSelf: collection.id === 'first-contact' ? 'flex-start' : 'center',
                    marginTop: collection.id === 'first-contact' ? '20px' : '0'
                  }}
                >
                  {collection.id === 'the-human-inside' ? (
                    <span
                      aria-hidden="true"
                      data-collection-id={collection.id}
                      className={`w-full block transition-transform duration-300 ${
                        collection.id === 'higgins-grafic' ? '' : 'group-hover:scale-110'
                      }`}
                      style={{
                        opacity: 1,
                        height: '52px',
                        backgroundColor: 'currentColor',
                        WebkitMaskImage: `url(${collection.icon})`,
                        maskImage: `url(${collection.icon})`,
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        transform: 'scale(1.18)',
                        transformOrigin: 'center',
                      }}
                    />
                  ) : (
                    <img
                      src={collection.icon}
                      alt={collection.name}
                      data-collection-id={collection.id}
                      className={`w-full h-auto object-contain block transition-transform duration-300 ${
                        collection.id === 'higgins-grafic' ? '' : 'group-hover:scale-110'
                      }`}
                      style={{
                        opacity: 1,
                        transform: collection.id === 'higgins-grafic'
                          ? `translateY(${higginsAlignYMobile}px) scale(1.10)`
                          : undefined,
                        transformOrigin: collection.id === 'higgins-grafic' ? 'center' : undefined
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="sr-only">{collection.name}</span>
                </Link>
              </motion.div>
            ))}

            {/* Segona fila: Outcasted, Higgins Gràfic, Cube */}
            {collectionsMobile.slice(3, 6).map((collection, index) => (
              <motion.div
                key={index + 3}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: (index + 3) * 0.05, ease: "easeOut" }}
                className="flex items-center justify-center"
              >
                <Link
                  to={collection.path}
                  className={`flex items-center justify-center transition-transform group w-20 ${
                    collection.id === 'higgins-grafic' ? '' : 'hover:scale-110 active:scale-95'
                  }`}
                  title={collection.name}
                >
                  {collection.id === 'the-human-inside' ? (
                    <span
                      aria-hidden="true"
                      data-collection-id={collection.id}
                      className={`w-full block transition-transform duration-300 ${
                        collection.id === 'higgins-grafic' ? '' : 'group-hover:scale-110'
                      }`}
                      style={{
                        opacity: 1,
                        height: '52px',
                        backgroundColor: 'currentColor',
                        WebkitMaskImage: `url(${collection.icon})`,
                        maskImage: `url(${collection.icon})`,
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        transform: 'scale(1.18)',
                        transformOrigin: 'center',
                      }}
                    />
                  ) : (
                    <img
                      src={collection.icon}
                      alt={collection.name}
                      data-collection-id={collection.id}
                      className={`w-full h-auto object-contain block transition-transform duration-300 ${
                        collection.id === 'higgins-grafic' ? '' : 'group-hover:scale-110'
                      }`}
                      style={{
                        opacity: 1
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="sr-only">{collection.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* PEU DELS SERVEIS - Grid simple i responsive - Fons blanc - SEGON */}
      <div className="bg-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-[82px] lg:py-[98px] px-4 lg:px-8">
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12 lg:gap-x-12"
            style={isSectionEnabled('footer') ? getDebugStyle('footer', 'row1') : {}}
          >
            {/* Botiga */}
            <div className="text-left">
              <p className="font-oswald font-semibold mb-3 lg:mb-4 text-[13pt] lg:text-[14pt] text-foreground">{texts.footer.services.shop.title}</p>
              <ul className="space-y-2.5 lg:space-y-3 text-left">
                <li><Link to="/new" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.shop.new}</Link></li>
                <li><Link to="/offers" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.shop.offers}</Link></li>
              </ul>
            </div>

            {/* Client */}
            <div className="text-left">
              <p className="font-oswald font-semibold mb-3 lg:mb-4 text-[13pt] lg:text-[14pt] text-foreground">{texts.footer.services.customer.title}</p>
              <ul className="space-y-2.5 lg:space-y-3 text-left">
                <li><Link to="/shipping" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.customer.shipping}</Link></li>
                <li><Link to="/status" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.customer.orderStatus}</Link></li>
                <li><Link to="/track" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>Seguiment comanda</Link></li>
                <li><Link to="/sizing" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.customer.sizing}</Link></li>
              </ul>
            </div>

            {/* Informació */}
            <div className="text-left">
              <p className="font-oswald font-semibold mb-3 lg:mb-4 text-[13pt] lg:text-[14pt] text-foreground">{texts.footer.services.info.title}</p>
              <ul className="space-y-2.5 lg:space-y-3 text-left">
                <li><Link to="/contact" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.info.contact}</Link></li>
                <li><Link to="/about" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.info.about}</Link></li>
                <li><Link to="/faq" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.info.faq}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-left">
              <p className="font-oswald font-semibold mb-3 lg:mb-4 text-[13pt] lg:text-[14pt] text-foreground">{texts.footer.services.legal.title}</p>
              <ul className="space-y-2.5 lg:space-y-3 text-left">
                <li><Link to="/privacy" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.legal.privacy}</Link></li>
                <li><Link to="/terms" className="font-roboto text-sm font-normal transition-all inline-block text-foreground" style={{ opacity: 0.75 }} onMouseEnter={(e) => { const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))'; e.target.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`; }} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>{texts.footer.services.legal.terms}</Link></li>
              </ul>
            </div>

            {/* Idioma */}
            <div className="text-left">
              <p className="font-oswald font-semibold mb-3 lg:mb-4 text-[13pt] lg:text-[14pt] text-foreground">{texts.footer.services.language.title}</p>
              <ul className="space-y-2.5 lg:space-y-3 text-left">
                <li>
                  <span className="font-roboto text-sm font-bold text-foreground">
                    Català
                  </span>
                </li>
                <li>
                  <span className="font-roboto text-sm font-normal cursor-not-allowed text-foreground" style={{ opacity: 0.3 }}>
                    English
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Peu del Logo Mòbil - Només el logo - Fons gris clar - VISIBLE NOMÉS EN MÒBIL */}
      <div className="lg:hidden bg-muted transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            className="flex items-center justify-center min-h-[70px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
          >
            <Link to="/" className="flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
              <span
                aria-hidden="true"
                className="h-[37.5px] w-[160px] block text-foreground"
                style={{
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  maskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}
              />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Peu del Logo Desktop - Només el logo - Fons gris clar - OCULT EN MÒBIL */}
      <div className="hidden lg:block bg-muted transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          <div className="flex items-center justify-center min-h-[80px]">
            <Link to="/" className="transition-transform hover:scale-105">
              <span
                aria-hidden="true"
                className="h-[49.5px] w-[200px] block text-foreground"
                style={{
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  maskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}
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
export default Footer;
