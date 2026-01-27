import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase-products';
import { useAdmin } from '@/contexts/AdminContext';

function ECPreviewPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAdmin();
  const params = new URLSearchParams(location.search || '');
  const debug = (params.get('debug') || '').trim() === '1' || (params.get('noRedirect') || '').trim() === '1';

  const defaultVideoUrl = '/video/ec-preview-video.mp4';

  useEffect(() => {
    const shouldMatch = (value) => /\bbolt\b|bolt\.com|bolt\.new|made in bolt/i.test(String(value || ''));

    const looksLikeBottomRightBadge = (el) => {
      try {
        const cs = window.getComputedStyle(el);
        const pos = cs.position;
        if (pos !== 'fixed' && pos !== 'sticky' && pos !== 'absolute') return false;

        const rect = el.getBoundingClientRect();
        if (!rect || !Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return false;
        if (rect.width < 20 || rect.height < 12) return false;
        if (rect.width > 240 || rect.height > 120) return false;

        const vw = window.innerWidth || 0;
        const vh = window.innerHeight || 0;
        if (!vw || !vh) return false;

        const distRight = vw - rect.right;
        const distBottom = vh - rect.bottom;
        if (distRight < -2 || distBottom < -2) return false;
        if (distRight > 40 || distBottom > 40) return false;

        const z = Number.parseInt(cs.zIndex || '0', 10);
        if (Number.isFinite(z) && z > 0 && z < 10) {
          // low z-index overlays are unlikely to be watermarks
          return false;
        }

        // The Bolt badge is typically a small clickable element.
        if (el.tagName === 'A' || el.tagName === 'BUTTON') return true;

        const role = el.getAttribute('role');
        if (role === 'button' || role === 'link') return true;

        // If it contains an SVG and is in bottom-right, it's very likely a watermark.
        if (el.querySelector && el.querySelector('svg')) return true;

        return false;
      } catch {
        return false;
      }
    };

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
        const title = getAttr(el, 'title');
        const ariaLabel = getAttr(el, 'aria-label');
        const dataTestId = getAttr(el, 'data-testid');
        const id = el.id;
        const className = el.className;
        const text = (el.innerText || el.textContent || '').trim();

        // Some badges are injected as compact HTML with no visible text at the element level.
        // outerHTML is more expensive but /ec-preview is a simple page.
        const html = el.outerHTML || '';

        if (
          shouldMatch(href) ||
          shouldMatch(src) ||
          shouldMatch(alt) ||
          shouldMatch(title) ||
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

        // Fallback: some badges render the text via SVG paths / shadow DOM and won't match text/html.
        // On /ec-preview we can safely remove bottom-right watermark-like overlays.
        if (looksLikeBottomRightBadge(el)) {
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
          // attribute/text mutation: rescan around the target
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
      // Stop after 10s to avoid wasting CPU forever.
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
    loadECPage();
  }, []);

  useEffect(() => {
    if (!config) return;
    if (isAdmin) return;
    if (debug) return;

    const target = String(config.redirectUrl || '').trim();
    if (!target) return;

    const effectiveAutoRedirect = !!(config.autoRedirect || config.globalRedirect);
    if (!effectiveAutoRedirect) return;

    const effectiveBackgroundTypeRaw = (config?.backgroundType ?? '').toString().trim();
    const effectiveBackgroundType =
      (effectiveAutoRedirect && target)
        ? 'video'
        : (effectiveBackgroundTypeRaw || (config?.videoUrl ? 'video' : 'color'));
    const effectiveVideoUrl =
      effectiveBackgroundType === 'video'
        ? (String(config?.videoUrl || '').trim() || defaultVideoUrl)
        : '';

    // If we have a video background, let it play and redirect onEnded.
    // This avoids an instant redirect that makes the video appear to play "at full speed".
    if (effectiveBackgroundType === 'video' && effectiveVideoUrl) return;

    // Otherwise redirect immediately.
    // This page acts as an under-construction bridge (e.g. to Etsy).
    const timeoutId = window.setTimeout(() => {
      if (target.startsWith('http://') || target.startsWith('https://')) {
        window.location.replace(target);
        return;
      }
      navigate(target);
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [config, navigate, isAdmin, debug]);

  const loadECPage = async () => {
    try {
      const { data, error } = await supabase
        .from('media_pages')
        .select('*')
        .eq('slug', 'default')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          backgroundType: data.background_type,
          videoUrl: data.video_url,
          imageUrl: data.image_url,
          backgroundColor: data.background_color || '#000000',
          gradientStops: data.gradient_stops || null,
          gradientAngle: data.gradient_angle ?? 180,
          title: data.title ?? '',
          subtitle: data.subtitle ?? '',
          description: data.description ?? '',
          buttonText: data.button_text ?? '',
          buttonLink: data.button_link ?? '/',
          showButton: data.show_button ?? false,
          textColor: data.text_color || '#ffffff',
          redirectUrl: data.redirect_url ?? '',
          autoRedirect: data.auto_redirect ?? false,
          globalRedirect: data.global_redirect ?? false
        });
      }
    } catch (error) {
      console.error('Error loading EC page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = () => {
    if (debug) return;
    const shouldRedirect = !!(config?.autoRedirect || config?.globalRedirect);
    if (shouldRedirect && config?.redirectUrl) {
      if (config.redirectUrl.startsWith('http://') || config.redirectUrl.startsWith('https://')) {
        window.location.href = config.redirectUrl;
      } else {
        navigate(config.redirectUrl);
      }
    }
  };

  const handleScreenClick = () => {
    if (debug) return;

    const hasRedirectTarget = !!String(config?.redirectUrl || '').trim();
    const effectiveAutoRedirect = !!(config?.autoRedirect || config?.globalRedirect);
    const isVideoAutoRedirect = effectiveAutoRedirect && hasRedirectTarget && effectiveBackgroundType === 'video' && !!effectiveVideoUrl;
    if (isVideoAutoRedirect) return;

    // Only redirect if there's a button link and button is NOT shown (otherwise button handles it)
    if (config?.buttonLink && !config?.showButton) {
      if (config.buttonLink.startsWith('http://') || config.buttonLink.startsWith('https://')) {
        window.location.href = config.buttonLink;
      } else {
        navigate(config.buttonLink);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Carregant...</div>
      </div>
    );
  }

  // Values from config (no defaults to allow empty strings)
  const title = config?.title ?? '';
  const subtitle = config?.subtitle ?? '';
  const description = config?.description ?? '';
  const textColor = config?.textColor || '#ffffff';
  const showButton = config?.showButton ?? false;
  const buttonText = config?.buttonText ?? '';
  const buttonLink = config?.buttonLink ?? '/';

  const effectiveBackgroundTypeRaw = (config?.backgroundType ?? '').toString().trim();
  const effectiveBackgroundType =
    (((config?.autoRedirect || config?.globalRedirect) && String(config?.redirectUrl || '').trim())
      ? 'video'
      : (effectiveBackgroundTypeRaw || (config?.videoUrl ? 'video' : 'color')));
  const effectiveVideoUrl =
    effectiveBackgroundType === 'video'
      ? (String(config?.videoUrl || '').trim() || defaultVideoUrl)
      : '';

  const isDev = import.meta.env.DEV;
  const showDevNote = isDev && !isAdmin;

  const getBackgroundStyle = () => {
    if (!config) return { backgroundColor: '#000000' };

    if (config.gradientStops && config.gradientStops.length > 0) {
      const sortedStops = [...config.gradientStops].sort((a, b) => a.position - b.position);
      const gradient = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
      return { background: `linear-gradient(${config.gradientAngle}deg, ${gradient})` };
    }

    return { backgroundColor: config.backgroundColor || '#000000' };
  };

  return (
    <>
      <Helmet>
        <title>En Construcció - GRÀFIC</title>
        <meta name="description" content="Pàgina en construcció" />
        <style>{`
          /* Defensive: hide Bolt watermark/ads if injected (Bolt.new / Bolt.com). */
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
        <meta
          httpEquiv="Content-Security-Policy"
          content={
            [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-src 'none'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "media-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https: ws:",
              "report-to csp",
            ].join('; ')
          }
        />
      </Helmet>

      <div
        className="relative w-full h-screen overflow-hidden cursor-pointer"
        onClick={handleScreenClick}
      >
        {showDevNote && (
          <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div
              className="pointer-events-auto w-[34rem] max-w-[90vw] min-h-[18rem] rounded-2xl border border-white/20 bg-red-600/70 backdrop-blur-md px-8 py-16 text-white flex flex-col justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto inline-flex flex-col items-start">
                <div className="text-sm font-semibold mb-3">Mode DEV · Accés ràpid</div>
                <div className="text-sm opacity-90 w-full">
                  <div>1. Cmd+Shift+P</div>
                  <div>2. Simple Browser: Show</div>
                  <div>3. http://localhost:3000/admin-login</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Background Media */}
        {effectiveBackgroundType === 'video' && effectiveVideoUrl && (
          <video
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ filter: 'contrast(1.5)', zIndex: 0 }}
            autoPlay
            muted
            loop={!(String(config.redirectUrl || '').trim() && (config.autoRedirect || config.globalRedirect))}
            playsInline
            preload="metadata"
            poster={config.imageUrl || undefined}
            src={effectiveVideoUrl}
            onEnded={handleVideoEnd}
          />
        )}

        {config?.backgroundType === 'image' && config.imageUrl && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${config.imageUrl})` }}
          />
        )}

        {/* Default or Color Background */}
        {(!config || effectiveBackgroundType === 'color') && (
          <div
            className="absolute inset-0 w-full h-full"
            style={getBackgroundStyle()}
          />
        )}

        {/* Content */}
        {(title || subtitle || description || showButton) && (
          <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 md:px-12 lg:px-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl text-center"
            >
              {title && (
                <h1
                  className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
                  style={{ color: textColor }}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  className="text-xl md:text-2xl lg:text-3xl mb-8"
                  style={{ color: textColor, opacity: 0.9 }}
                >
                  {subtitle}
                </p>
              )}

              {description && (
                <p
                  className="text-lg md:text-xl mb-8"
                  style={{ color: textColor, opacity: 0.8 }}
                >
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

export default ECPreviewPage;
