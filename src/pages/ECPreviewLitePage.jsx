import React, { useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function ECPreviewLitePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mountedAtRef = useRef(Date.now());

  const params = useMemo(() => new URLSearchParams(location.search || ''), [location.search]);
  const debug = (params.get('debug') || '').trim() === '1' || (params.get('noRedirect') || '').trim() === '1';

  const defaultVideoUrl = '/video/ec-preview-video.mp4';

  const redirectUrl = (params.get('redirect') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_REDIRECT_URL || '').trim();
  const backgroundType = (params.get('bg') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_BG || 'video');
  const videoUrl =
    (params.get('video') || '').trim() ||
    String(import.meta.env.VITE_EC_PREVIEW_LITE_VIDEO_URL || '').trim() ||
    (backgroundType === 'video' ? defaultVideoUrl : '');
  const imageUrl = (params.get('image') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_IMAGE_URL || '').trim();
  const backgroundColor = (params.get('bgColor') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_BG_COLOR || '#000000');
  const posterUrl = (params.get('poster') || '').trim() || imageUrl || '';

  const title = (params.get('title') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_TITLE || '');
  const subtitle = (params.get('subtitle') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_SUBTITLE || '');
  const description = (params.get('description') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_DESCRIPTION || '');

  const showButtonRaw = (params.get('showButton') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_SHOW_BUTTON || 'false');
  const showButton = showButtonRaw === '1' || showButtonRaw.toLowerCase() === 'true';

  const buttonText = (params.get('buttonText') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_BUTTON_TEXT || '');
  const buttonLink = (params.get('buttonLink') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_BUTTON_LINK || redirectUrl || '/');

  const redirectMode = (params.get('redirectMode') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_REDIRECT_MODE || 'onEnd');
  const textColor = (params.get('textColor') || '').trim() || String(import.meta.env.VITE_EC_PREVIEW_LITE_TEXT_COLOR || '#ffffff');

  const effectiveBackgroundType = useMemo(() => {
    if (backgroundType === 'video' && !videoUrl) return 'color';
    if (backgroundType === 'image' && !imageUrl) return 'color';
    return backgroundType;
  }, [backgroundType, videoUrl, imageUrl]);

  const shouldAutoRedirect = redirectMode === 'immediate' || redirectMode === 'onEnd';

  useEffect(() => {
    const shouldMatch = (value) => /\bbolt\b|bolt\.com|bolt\.new|made in bolt/i.test(String(value || ''));

    const getAttr = (el, name) => {
      try {
        return el && typeof el.getAttribute === 'function' ? el.getAttribute(name) : null;
      } catch {
        return null;
      }
    };

    const cleanupBoltNodes = (root) => {
      const scope = root && root.querySelectorAll ? root : document;
      if (!scope || !scope.querySelectorAll) return;

      const nodes = Array.from(scope.querySelectorAll('*'));
      for (const el of nodes) {
        if (!(el instanceof HTMLElement)) continue;
        const href = getAttr(el, 'href');
        const src = getAttr(el, 'src');
        const alt = getAttr(el, 'alt');
        const titleAttr = getAttr(el, 'title');
        const ariaLabel = getAttr(el, 'aria-label');
        const dataTestId = getAttr(el, 'data-testid');
        const id = el.id;
        const className = el.className;
        const text = (el.innerText || el.textContent || '').trim();
        const html = el.outerHTML || '';

        if (
          shouldMatch(href) ||
          shouldMatch(src) ||
          shouldMatch(alt) ||
          shouldMatch(titleAttr) ||
          shouldMatch(ariaLabel) ||
          shouldMatch(dataTestId) ||
          shouldMatch(id) ||
          shouldMatch(className) ||
          shouldMatch(text) ||
          shouldMatch(html)
        ) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          if (el.parentNode) el.parentNode.removeChild(el);
          continue;
        }

        if (el.shadowRoot) {
          cleanupBoltNodes(el.shadowRoot);
        }
      }
    };

    cleanupBoltNodes(document);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== 'childList' && m.type !== 'attributes' && m.type !== 'characterData') continue;
        if (m.type === 'childList') {
          for (const node of Array.from(m.addedNodes || [])) {
            if (!(node instanceof HTMLElement)) continue;
            cleanupBoltNodes(node);
            if (node.shadowRoot) cleanupBoltNodes(node.shadowRoot);
          }
        } else {
          const t = m.target;
          if (t instanceof HTMLElement) cleanupBoltNodes(t);
          if (t && t.parentNode instanceof HTMLElement) cleanupBoltNodes(t.parentNode);
        }
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    }

    const startedAt = Date.now();
    const aggressiveIntervalId = window.setInterval(() => {
      cleanupBoltNodes(document);
      if (Date.now() - startedAt > 10_000) {
        window.clearInterval(aggressiveIntervalId);
      }
    }, 100);

    return () => {
      observer.disconnect();
      window.clearInterval(aggressiveIntervalId);
    };
  }, []);

  useEffect(() => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.log('[ec-preview-lite debug]', {
      backgroundType,
      effectiveBackgroundType,
      videoUrl,
      imageUrl,
      redirectMode,
      redirectUrl,
      showButton,
      buttonLink,
    });
  }, [debug, backgroundType, effectiveBackgroundType, videoUrl, imageUrl, redirectMode, redirectUrl, showButton, buttonLink]);

  const doRedirect = () => {
    if (debug) return;
    const target = String(redirectUrl || '').trim();
    if (!target) return;
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.location.replace(target);
      return;
    }
    navigate(target);
  };

  useEffect(() => {
    if (debug) return;
    if (!shouldAutoRedirect) return;
    if (!redirectUrl) return;
    if (redirectMode !== 'immediate') return;
    if (backgroundType === 'video' && videoUrl) return;

    const timeoutId = window.setTimeout(() => {
      doRedirect();
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [debug, shouldAutoRedirect, redirectUrl, redirectMode, backgroundType, videoUrl]);

  const handleVideoEnd = () => {
    if (debug) return;
    if (!shouldAutoRedirect) return;
    if (!redirectUrl) return;
    if (redirectMode !== 'onEnd') return;

    doRedirect();
  };

  const handleScreenClick = () => {
    if (debug) return;
    if (showButton) return;

    const target = String(redirectUrl || buttonLink || '').trim();
    if (!target) return;

    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.location.href = target;
      return;
    }
    navigate(target);
  };

  const contentVisible = Boolean(title || subtitle || description || (showButton && buttonText));

  return (
    <>
      <Helmet>
        <title>En Construcció - GRÀFIC</title>
        <meta name="description" content="Pàgina en construcció" />
        <style>{`
          a[href*="bolt"],
          iframe[src*="bolt"],
          img[src*="bolt"],
          script[src*="bolt"],
          [data-bolt],
          [data-provider*="bolt" i],
          [aria-label*="bolt" i],
          [title*="bolt" i] {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        `}</style>
      </Helmet>

      <div className="relative w-full h-screen overflow-hidden cursor-pointer" onClick={handleScreenClick} style={{ backgroundColor }}>
        {debug && (
          <div className="absolute top-2 left-2 z-20 max-w-[90vw] rounded bg-black/60 px-2 py-1 text-[11px] text-white">
            <div>bg: {String(backgroundType)} / effective: {String(effectiveBackgroundType)}</div>
            <div>redirectMode: {String(redirectMode)}</div>
            <div>videoUrl: {String(videoUrl)}</div>
          </div>
        )}
        {effectiveBackgroundType === 'video' && videoUrl && (
          <video
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ filter: 'contrast(1.5)', zIndex: 0 }}
            autoPlay
            muted
            playsInline
            preload="metadata"
            loop={!(redirectUrl && shouldAutoRedirect && redirectMode === 'onEnd')}
            crossOrigin="anonymous"
            poster={posterUrl || undefined}
            onEnded={handleVideoEnd}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}

        {effectiveBackgroundType === 'image' && imageUrl && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}

        {(effectiveBackgroundType === 'color' || !effectiveBackgroundType) && (
          <div className="absolute inset-0 w-full h-full" style={{ backgroundColor }} />
        )}

        {contentVisible && (
          <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 md:px-12 lg:px-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl text-center"
            >
              {title && (
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6" style={{ color: textColor }}>
                  {title}
                </h1>
              )}

              {subtitle && (
                <p className="text-xl md:text-2xl lg:text-3xl mb-8" style={{ color: textColor, opacity: 0.9 }}>
                  {subtitle}
                </p>
              )}

              {description && (
                <p className="text-lg md:text-xl mb-8" style={{ color: textColor, opacity: 0.8 }}>
                  {description}
                </p>
              )}

              {showButton && buttonText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <Link
                    to={buttonLink}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm rounded-lg font-medium transition-all hover:bg-white/30 hover:scale-105"
                    style={{ color: textColor }}
                  >
                    {buttonText}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
