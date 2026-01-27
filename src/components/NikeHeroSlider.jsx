import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './NikeHeroSlider.module.css';

function clampIndex(nextIndex, length) {
  if (length <= 0) return 0;
  return ((nextIndex % length) + length) % length;
}

export default function NikeHeroSlider({
  slides,
  autoplay = true,
  autoplayIntervalMs = 6500,
  flush = false,
  className = '',
}) {
  const getDefaultSlides = () => {
    const fallback = [
      {
        id: 'slide-1',
        imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.png',
        imageAlt: "Per marcar la diferència",
        kicker: 'Per marcar la diferència',
        headline: 'Mou-te i marca la diferència',
        primaryCta: { label: 'Compra', href: '#' },
        secondaryCta: { label: 'Descobreix', href: '#' },
      },
      {
        id: 'slide-2',
        imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
        imageAlt: 'Essencials',
        kicker: 'Essencials',
        headline: 'Minimalisme que combina amb tot',
        primaryCta: { label: 'Compra', href: '#' },
        secondaryCta: { label: 'Veure novetats', href: '#' },
      },
      {
        id: 'slide-3',
        imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png',
        imageAlt: 'Studio',
        kicker: 'Studio',
        headline: 'Confort i presència, sense soroll',
        primaryCta: { label: 'Compra', href: '#' },
        secondaryCta: { label: 'Explora col·lecció', href: '#' },
      },
    ];

    if (!Array.isArray(slides) || slides.length === 0) return fallback;

    return slides.map((s, idx) => ({
      id: s.id || `slide-${idx}`,
      imageSrc: s.imageSrc,
      imageAlt: s.imageAlt || s.headline || `Slide ${idx + 1}`,
      kicker: s.kicker,
      headline: s.headline,
      primaryCta: s.primaryCta,
      secondaryCta: s.secondaryCta,
    }));
  };

  const resolvedSlides = useMemo(() => getDefaultSlides(), [slides]);

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const timerRef = useRef(null);

  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startTranslateRef = useRef(0);
  const currentTranslateRef = useRef(0);

  const [index, setIndex] = useState(0);

  const slideCount = resolvedSlides.length;

  function setTranslate(px, withTransition = true) {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = withTransition ? 'transform 0.3s ease' : 'none';
    track.style.transform = `translate3d(${px}px, 0, 0)`;
  }

  function goTo(nextIndex, opts = {}) {
    const { animate = true } = opts;
    const root = rootRef.current;
    if (!root) return;

    const clamped = clampIndex(nextIndex, slideCount);
    setIndex(clamped);

    const x = -clamped * root.clientWidth;
    currentTranslateRef.current = x;
    setTranslate(x, animate);
  }

  function stopAuto() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startAuto() {
    stopAuto();
    if (!autoplay) return;
    if (slideCount <= 1) return;

    timerRef.current = window.setInterval(() => {
      goTo(index + 1);
    }, autoplayIntervalMs);
  }

  useEffect(() => {
    goTo(0, { animate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideCount]);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, autoplayIntervalMs, index, slideCount]);

  useEffect(() => {
    const onResize = () => {
      goTo(index, { animate: false });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slideCount]);

  function onPointerDown(e) {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    draggingRef.current = true;
    track.classList.add(styles.isDragging);
    stopAuto();

    startXRef.current = e.clientX;
    startTranslateRef.current = currentTranslateRef.current;

    track.setPointerCapture(e.pointerId);
    setTranslate(currentTranslateRef.current, false);
  }

  function onPointerMove(e) {
    if (!draggingRef.current) return;

    const delta = e.clientX - startXRef.current;
    const next = startTranslateRef.current + delta;
    currentTranslateRef.current = next;
    setTranslate(next, false);
  }

  function onPointerUp() {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    if (!draggingRef.current) return;
    draggingRef.current = false;
    track.classList.remove(styles.isDragging);

    const movedBy = currentTranslateRef.current - startTranslateRef.current;
    const threshold = root.clientWidth * 0.12;

    if (movedBy < -threshold) goTo(index + 1);
    else if (movedBy > threshold) goTo(index - 1);
    else goTo(index);

    startAuto();
  }

  return (
    <section className={`${styles.hero} ${className}`} aria-label="Hero">
      <div className={flush ? styles.innerFlush : styles.inner}>
        <div className={styles.slider} ref={rootRef}>
          <div
            className={styles.track}
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="group"
            aria-roledescription="carousel"
            aria-label="Slider"
          >
            {resolvedSlides.map((s, i) => (
              <article key={s.id} className={styles.slide} aria-label={`Slide ${i + 1}`}>
                <img className={styles.image} src={s.imageSrc} alt={s.imageAlt} />
                <div className={styles.overlay}>
                  <div className="mx-auto w-full max-w-[1400px] px-4 pb-9 sm:px-6 lg:px-10 lg:pb-10">
                    {s.kicker ? <p className={styles.kicker}>{s.kicker}</p> : null}
                    {s.headline ? <h2 className={styles.headline}>{s.headline}</h2> : null}

                    <div className={styles.actions}>
                      {s.primaryCta ? (
                        <a className={`${styles.pill} ${styles.primary}`} href={s.primaryCta.href || '#'}>
                          {s.primaryCta.label}
                        </a>
                      ) : null}
                      {s.secondaryCta ? (
                        <a className={styles.pill} href={s.secondaryCta.href || '#'}>
                          {s.secondaryCta.label}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.nav}>
            <button
              className={`${styles.arrow} ${styles.left}`}
              type="button"
              aria-label="Anterior"
              onClick={() => {
                goTo(index - 1);
                startAuto();
              }}
            >
              ‹
            </button>
            <button
              className={`${styles.arrow} ${styles.right}`}
              type="button"
              aria-label="Següent"
              onClick={() => {
                goTo(index + 1);
                startAuto();
              }}
            >
              ›
            </button>

            <div className={styles.dots} aria-label="Paginació slider">
              {resolvedSlides.map((s, i) => (
                <button
                  key={s.id}
                  className={styles.dot}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === index ? 'true' : 'false'}
                  onClick={() => {
                    goTo(i);
                    startAuto();
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
