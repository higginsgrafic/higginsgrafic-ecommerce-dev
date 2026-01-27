import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';

const ProductGallery = ({
  images,
  productName,
  onImageClick,
  layout = 'desktop',
  colorThumbnails = null,
  selectedColor = null,
  onColorSelect = null,
  thumbnailRows = null
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [pendingSelectedImage, setPendingSelectedImage] = useState(null);
  const [selectedThumbKey, setSelectedThumbKey] = useState(null);
  const [mainForcedSrc, setMainForcedSrc] = useState(null);
  const [mainOverlaySrc, setMainOverlaySrc] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [thumbsTop, setThumbsTop] = useState(null);
  const [thumbsLeft, setThumbsLeft] = useState(null);
  const [thumbsWidth, setThumbsWidth] = useState(null);
  const [thumbsGap, setThumbsGap] = useState(null);
  const [disableFadeForComparison, setDisableFadeForComparison] = useState(false);
  const skipNextColorSyncRef = useRef(false);
  const mainImageWrapRef = useRef(null);
  const thumbsWrapRef = useRef(null);
  const prevSelectedColorKeyRef = useRef(null);
  const prevInkKeyRef = useRef(null);
  const pendingLoadTokenRef = useRef(0);
  const prefetchedRef = useRef(new Set());
  const displayedMainSrcRef = useRef(null);
  const nextDisableFadeRef = useRef(false);
  const lastThumbWasPlaceholderRef = useRef(false);
  const forcedPlaceholderColorKeyRef = useRef(null);

  const imagesSignature = Array.isArray(images) ? images.join('|') : '';

  const effectiveSelectedImage =
    typeof pendingSelectedImage === 'number' && pendingSelectedImage >= 0
      ? pendingSelectedImage
      : selectedImage;

  const normalizeLoose = (value) => {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const normalizeToCanonicalColor = (value) => {
    const v = (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/%20/g, ' ')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!v) return null;
    if (v === 'blanc' || v === 'white') return 'Blanc';
    if (v === 'negre' || v === 'black') return 'Negre';
    if (v === 'vermell' || v === 'red') return 'Vermell';
    if (v === 'verd' || v === 'green') return 'Verd';
    if (v.includes('militar') || v.includes('military') || v.includes('army')) return 'Militar';
    if (v.includes('forest')) return 'Forest';
    if (v.includes('royal')) return 'Royal';
    if (v.includes('navy') || v.includes('marina')) return 'Navy';
    if (v === 'blau' || v === 'blue' || v === 'azul') return 'Blau';
    return null;
  };

  const normalizeHexColor = (value) => {
    const raw = (value ?? '').toString().trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();

    // Allow functional colors directly
    if (lower.startsWith('rgb(') || lower.startsWith('rgba(') || lower.startsWith('hsl(') || lower.startsWith('hsla(')) {
      return raw;
    }

    // 0xRRGGBB
    if (lower.startsWith('0x') && lower.length === 8) {
      return `#${lower.slice(2)}`;
    }

    // #RGB / #RRGGBB
    if (lower.startsWith('#')) {
      return lower;
    }

    // RRGGBB
    if (/^[0-9a-f]{6}$/i.test(raw)) {
      return `#${raw}`;
    }

    return raw;
  };

  const extractLooseColorFromImageUrl = (url) => {
    const normalized = (url || '').toString().replace(/\\/g, '/');
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return parts[parts.length - 2] || null;
  };

  const placeholderByCanonicalColor = {
    Blanc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png',
    Negre: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
    Vermell: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_red_gpr-4-0_front.png',
    Militar: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_military-green_gpr-4-0_front.png',
    Forest: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png',
    Royal: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.png',
    Navy: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_navy_gpr-4-0_front.png',
    Blau: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.png',
    Verd: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png'
  };

  const fallbackHexByCanonicalColor = {
    Blanc: '#FFFFFF',
    Negre: '#000000',
    Vermell: '#D00000',
    Militar: '#556B2F',
    Forest: '#0B3D2E',
    Royal: '#0052CC',
    Navy: '#001F3F',
    Blau: '#0052CC',
    Verd: '#0B3D2E'
  };

  const resolvePlaceholderForColor = (color) => {
    const canonical = normalizeToCanonicalColor(color) || (color || '').toString().trim();
    return placeholderByCanonicalColor[canonical] || null;
  };

  const selectedColorKey = selectedColor ? normalizeLoose(selectedColor) : null;

  const resolveMainImageSrc = () => {
    if (mainForcedSrc) return mainForcedSrc;
    const img = Array.isArray(images) ? images[selectedImage] : null;
    if (!selectedColor) return img || null;

    const target = normalizeLoose(selectedColor);
    const thumbRows = Array.isArray(thumbnailRows) ? thumbnailRows : [];
    const flatThumbs = thumbRows.flatMap((r) => (Array.isArray(r) ? r : []));

    // If the currently selected index already corresponds to the selected color, keep it.
    const currentThumb = flatThumbs.find((it) => typeof it?.index === 'number' && it.index === selectedImage);
    const currentThumbColor = currentThumb?.color || currentThumb?.label || null;
    if (img && currentThumbColor && normalizeLoose(currentThumbColor) === target) return img;

    // Otherwise, look for the first matching color (used when selectedColor changes externally).
    const firstMatch = flatThumbs.find((it) => {
      const c = it?.color || it?.label || null;
      return normalizeLoose(c) === target;
    });

    if (firstMatch?.url) return firstMatch.url;
    const placeholder = resolvePlaceholderForColor(firstMatch?.color || selectedColor);
    if (placeholder) return placeholder;

    return img || null;
  };

  const currentMainSrc = resolveMainImageSrc();
  useEffect(() => {
    displayedMainSrcRef.current = currentMainSrc || null;
  }, [currentMainSrc]);

  useEffect(() => {
    // If selectedColor changes due to clicking a placeholder, keep the forced placeholder image.
    // Only clear forced placeholder when the selected color changes to a *different* color.
    if (mainForcedSrc) {
      const forcedKey = forcedPlaceholderColorKeyRef.current;
      const shouldKeep = !!forcedKey && !!selectedColorKey && forcedKey === selectedColorKey;
      if (!shouldKeep) {
        forcedPlaceholderColorKeyRef.current = null;
        setMainForcedSrc(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColorKey]);

  const inferInkKeyFromUrl = (url) => {
    const u = (url || '').toString().toLowerCase();
    if (!u) return null;
    if (u.includes('/blanc/') || u.includes('/white/') || u.includes('white-')) return 'white';
    if (u.includes('/negre/') || u.includes('/black/') || u.includes('black-')) return 'black';
    return null;
  };

  const prepareFadeForNextSelection = ({ nextUrl, nextColorKey }) => {
    const currentUrl = Array.isArray(images) ? images[selectedImage] : null;
    const currentInkKey = inferInkKeyFromUrl(currentUrl);
    const nextInkKey = inferInkKeyFromUrl(nextUrl);

    const currentColorKey = selectedColorKey;
    const sameColor = !!currentColorKey && !!nextColorKey && currentColorKey === nextColorKey;
    const inkChanged = !!currentInkKey && !!nextInkKey && currentInkKey !== nextInkKey;

    // Only disable fade when toggling ink for the same color.
    // For color changes, keep fade enabled.
    const nextDisable = sameColor && inkChanged;
    nextDisableFadeRef.current = nextDisable;
    setDisableFadeForComparison(nextDisable);
  };

  const preloadThenSelect = ({ nextIndex, nextUrl }) => {
    if (typeof nextIndex !== 'number' || nextIndex < 0) return;
    if (!nextUrl) {
      setPendingSelectedImage(null);
      setMainOverlaySrc(null);
      setSelectedImage(nextIndex);
      return;
    }

    const token = pendingLoadTokenRef.current + 1;
    pendingLoadTokenRef.current = token;
    setPendingSelectedImage(nextIndex);
    // Cancel any in-flight overlay fade to avoid flicker on rapid clicks.
    setMainOverlaySrc(null);

    const img = new Image();
    img.onload = () => {
      if (pendingLoadTokenRef.current !== token) return;
      const prevMainSrc = displayedMainSrcRef.current;
      setPendingSelectedImage(null);

      if (nextDisableFadeRef.current) {
        setMainOverlaySrc(null);
        setSelectedImage(nextIndex);
        return;
      }

      // Show the new image immediately (as background), and fade-out the previous on top.
      const nextSrc = nextUrl || null;
      if (prevMainSrc && nextSrc && prevMainSrc.toString() === nextSrc.toString()) {
        setMainOverlaySrc(null);
      } else {
        setMainOverlaySrc(prevMainSrc || null);
      }
      setSelectedImage(nextIndex);
    };
    img.onerror = () => {
      if (pendingLoadTokenRef.current !== token) return;
      setPendingSelectedImage(null);
      setMainOverlaySrc(null);
      setSelectedImage(nextIndex);
    };
    img.src = nextUrl;
  };

  const prefetchUrl = (url) => {
    if (!url) return;
    const key = url.toString();
    const set = prefetchedRef.current;
    if (set.has(key)) return;
    set.add(key);
    const img = new Image();
    img.src = key;
  };

  const buildInkPairMap = () => {
    const rows = Array.isArray(thumbnailRows) ? thumbnailRows : [];
    const flat = rows.flatMap((r) => (Array.isArray(r) ? r : []));
    const map = new Map();
    for (const it of flat) {
      const color = it?.color || it?.label || null;
      const url = it?.url || null;
      if (!color || !url) continue;
      const key = normalizeLoose(color);
      if (!key) continue;
      const ink = inferInkKeyFromUrl(url) || 'unknown';
      if (!map.has(key)) map.set(key, {});
      const bucket = map.get(key);
      bucket[ink] = url;
    }
    return map;
  };

  useEffect(() => {
    // Proactively warm the cache for thumbnail images so switching feels instant.
    const urls = [];
    const push = (u) => {
      if (!u) return;
      urls.push(u);
    };

    const rows = Array.isArray(thumbnailRows) ? thumbnailRows : [];
    for (const row of rows) {
      for (const it of Array.isArray(row) ? row : []) {
        if (it?.url) push(it.url);
      }
    }

    // Also prefetch the opposite-ink pair for each color (if available)
    const pairMap = buildInkPairMap();
    for (const bucket of pairMap.values()) {
      if (bucket.white) push(bucket.white);
      if (bucket.black) push(bucket.black);
    }

    if (Array.isArray(images)) {
      for (const u of images) push(u);
    }

    const unique = [...new Set(urls.map((u) => u.toString()))];

    // Safety cap to avoid preloading too many resources.
    for (const u of unique.slice(0, 48)) {
      prefetchUrl(u);
    }
  }, [imagesSignature, thumbnailRows]);

  useEffect(() => {
    // Keep refs updated for potential debugging/inspection, but do NOT drive fade state here
    // (fade must be decided before switching selectedImage to avoid desync).
    const img = Array.isArray(images) ? images[selectedImage] : null;
    prevSelectedColorKeyRef.current = selectedColorKey;
    prevInkKeyRef.current = inferInkKeyFromUrl(img);
  }, [selectedImage, selectedColorKey, imagesSignature]);

  const overlayFadeMotion = disableFadeForComparison
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 1 },
        animate: { opacity: 0 },
        transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
      };
  const indexColorKey = (() => {
    if (!selectedColorKey) return null;
    const thumbRows = Array.isArray(thumbnailRows) ? thumbnailRows : [];
    const flatThumbs = thumbRows.flatMap((r) => (Array.isArray(r) ? r : []));
    const match = flatThumbs.find((it) => typeof it?.index === 'number' && it.index === effectiveSelectedImage);
    if (!match) return null;
    return normalizeLoose(match?.color || match?.label);
  })();

  const hasValidSelectedIndex = (() => {
    const thumbRows = Array.isArray(thumbnailRows) ? thumbnailRows : [];
    const flatThumbs = thumbRows.flatMap((r) => (Array.isArray(r) ? r : []));
    return flatThumbs.some((it) => typeof it?.index === 'number' && it.index >= 0 && it.index === effectiveSelectedImage);
  })();

  useEffect(() => {
    const thumbRows = Array.isArray(thumbnailRows) ? thumbnailRows : [];
    const flatThumbs = thumbRows.flatMap((r) => (Array.isArray(r) ? r : []));

    const byIndex = flatThumbs.find((it) => typeof it?.index === 'number' && it.index === effectiveSelectedImage);
    if (!lastThumbWasPlaceholderRef.current && byIndex?.key) {
      setSelectedThumbKey(byIndex.key);
      return;
    }

    if (selectedColorKey) {
      const byColor = flatThumbs.find((it) => normalizeLoose(it?.color || it?.label) === selectedColorKey);
      if (!lastThumbWasPlaceholderRef.current && byColor?.key) setSelectedThumbKey(byColor.key);
    }
  }, [effectiveSelectedImage, selectedColorKey, thumbnailRows]);

  useEffect(() => {
    if (!Array.isArray(images) || images.length === 0) {
      setSelectedImage(0);
      return;
    }

    setSelectedImage((prev) => {
      if (typeof prev !== 'number' || prev < 0) return 0;
      if (prev >= images.length) return 0;
      return prev;
    });
  }, [imagesSignature]);

  useEffect(() => {
    if (!selectedColor) return;
    if (!Array.isArray(images) || images.length === 0) return;

    if (skipNextColorSyncRef.current) {
      skipNextColorSyncRef.current = false;
      return;
    }

    const target = normalizeLoose(selectedColor);

    const thumbRows = Array.isArray(thumbnailRows) ? thumbnailRows : [];
    const flatThumbs = thumbRows.flatMap((r) => (Array.isArray(r) ? r : []));
    const matches = flatThumbs.filter((it) => {
      const c = it?.color || it?.label || null;
      return normalizeLoose(c) === target && typeof it?.index === 'number' && it.index >= 0;
    });

    if (matches.length > 0) {
      const keepCurrent = matches.some((m) => m.index === selectedImage);
      if (!keepCurrent) setSelectedImage(matches[0].index);
      return;
    }

    // Fallback for legacy products where we don't have thumbnailRows colors
    const idx = images.findIndex((imgUrl) => {
      const c = extractLooseColorFromImageUrl(imgUrl);
      return normalizeLoose(c) === target;
    });

    if (idx >= 0) setSelectedImage(idx);
  }, [selectedColor, images, thumbnailRows]);

  useLayoutEffect(() => {
    if (layout !== 'desktop') return;

    const compute = () => {
      const mainEl = mainImageWrapRef.current;
      const thumbsEl = thumbsWrapRef.current;
      if (!mainEl || !thumbsEl) return;

      const mainRect = mainEl.getBoundingClientRect();
      const thumbsRect = thumbsEl.getBoundingClientRect();
      if (!mainRect.height || !thumbsRect.height) return;

      const parent = mainEl.offsetParent;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();

      const desktopContainer = document.querySelector('[data-pdp-desktop="1"]');
      const basisRect = desktopContainer?.getBoundingClientRect?.() || parentRect;

      const firstThumbButton = thumbsEl.querySelector('button');
      const cell = firstThumbButton?.getBoundingClientRect?.().width;

      // If we have thumbnailRows (one or two rows), keep them in the ProductInfo column:
      // - horizontally aligned between the leftmost size button and the cart button
      // - vertically positioned BELOW the size buttons
      // This avoids overlap with checkout/wishlist while not "floating" under the main image.
      const hasRows =
        thumbsEl.hasAttribute('data-two-row-thumbs') ||
        thumbsEl.hasAttribute('data-one-row-thumbs');

      if (hasRows) {
        const sizeButtons = Array.from(
          document.querySelectorAll('[data-size-layout="desktop"][data-size-button]')
        );
        const cartButton = document.querySelector('[data-cart-button="1"]');

        const sizeRects = sizeButtons
          .map((el) => el?.getBoundingClientRect?.())
          .filter((r) => r && Number.isFinite(r.left) && Number.isFinite(r.width) && Number.isFinite(r.bottom));

        const sizeAnchorRect = sizeRects.sort((a, b) => a.left - b.left)[0] || null;
        const maxSizeBottom = sizeRects.reduce((acc, r) => Math.max(acc, r.bottom), -Infinity);

        const cartRect = cartButton?.getBoundingClientRect?.() || null;

        if (!sizeAnchorRect || !cartRect || !Number.isFinite(cell) || cell <= 0 || !Number.isFinite(maxSizeBottom)) {
          setThumbsLeft(null);
          setThumbsWidth(null);
          setThumbsGap(null);
          // Still place under main image as a last resort.
          const mainBottomWithinParent = mainRect.bottom - parentRect.top;
          const topPx = `${Math.round(mainBottomWithinParent + 12)}px`;
          setThumbsTop(topPx);
          window.__GRAFIC_THUMBS_TOP__ = topPx;
          return;
        }

        const lCenterX = sizeAnchorRect.left + sizeAnchorRect.width / 2;
        const cartCenterX = cartRect.left + cartRect.width / 2;

        const cols = 6;
        const leftFromL = lCenterX - basisRect.left - cell / 2;
        const cartCenterWithin = cartCenterX - basisRect.left;
        const desiredWidth = cartCenterWithin - leftFromL + cell / 2;

        const rawGap = (desiredWidth - cols * cell) / (cols - 1);
        const gap = Number.isFinite(rawGap) ? Math.max(0, rawGap) : 0;
        const finalWidth = cols * cell + (cols - 1) * gap;

        const maxLeft = Math.max(0, basisRect.width - finalWidth);
        const clampedLeft = Math.max(0, Math.min(leftFromL, maxLeft));

        const leftPx = `${Math.round(clampedLeft)}px`;
        const widthPx = `${Math.round(finalWidth)}px`;
        const gapPx = `${Math.round(gap)}px`;

        const bottomWithinParent = maxSizeBottom - parentRect.top;
        const topPx = `${Math.round(bottomWithinParent + 12)}px`;

        setThumbsTop(topPx);
        setThumbsLeft(leftPx);
        setThumbsWidth(widthPx);
        setThumbsGap(gapPx);
        window.__GRAFIC_THUMBS_TOP__ = topPx;
        window.__GRAFIC_THUMBS_LEFT__ = leftPx;
        window.__GRAFIC_THUMBS_WIDTH__ = widthPx;
        window.__GRAFIC_THUMBS_GAP__ = gapPx;
        return;
      }

      // Legacy positioning path: align with ProductInfo controls.
      const mainBottomWithinParent = mainRect.bottom - parentRect.top;
      const top = mainBottomWithinParent - thumbsRect.height + 1 - 23;
      const px = `${Math.round(top)}px`;
      setThumbsTop(px);
      window.__GRAFIC_THUMBS_TOP__ = px;

      const sizeButtons = Array.from(
        document.querySelectorAll('[data-size-layout="desktop"][data-size-button]')
      );

      const sizeAnchor = sizeButtons
        .map((el) => ({ el, rect: el.getBoundingClientRect?.() }))
        .filter((it) => it?.rect && Number.isFinite(it.rect.left) && Number.isFinite(it.rect.width))
        .sort((a, b) => a.rect.left - b.rect.left)[0]?.el;

      const cartButton = document.querySelector('[data-cart-button="1"]');

      if (!sizeAnchor || !cartButton || !firstThumbButton || !Number.isFinite(cell) || cell <= 0) {
        setThumbsLeft(null);
        setThumbsWidth(null);
        setThumbsGap(null);
        return;
      }

      const lRect = sizeAnchor.getBoundingClientRect();
      const cartRect = cartButton.getBoundingClientRect();

      const lCenterX = lRect.left + lRect.width / 2;
      const cartCenterX = cartRect.left + cartRect.width / 2;

      const cols = 6;
      const defaultLeft = '655px';
      const defaultWidth = '400px';
      const defaultGap = '10px';

      const leftFromL = lCenterX - basisRect.left - cell / 2;
      const cartCenterWithin = cartCenterX - basisRect.left;
      const desiredWidth = cartCenterWithin - leftFromL + cell / 2;

      const rawGap = (desiredWidth - cols * cell) / (cols - 1);
      const gap = Number.isFinite(rawGap) ? Math.max(0, rawGap) : NaN;
      const finalWidth = cols * cell + (cols - 1) * (Number.isFinite(gap) ? gap : 0);

      if (!Number.isFinite(leftFromL) || !Number.isFinite(desiredWidth) || !Number.isFinite(gap) || finalWidth <= 0) {
        setThumbsLeft(null);
        setThumbsWidth(null);
        setThumbsGap(null);
        window.__GRAFIC_THUMBS_LEFT__ = defaultLeft;
        window.__GRAFIC_THUMBS_WIDTH__ = defaultWidth;
        window.__GRAFIC_THUMBS_GAP__ = defaultGap;
        return;
      }

      const maxLeft = Math.max(0, basisRect.width - finalWidth);
      const clampedLeft = Math.max(0, Math.min(leftFromL, maxLeft));

      const leftPx = `${Math.round(clampedLeft)}px`;
      const widthPx = `${Math.round(finalWidth)}px`;
      const gapPx = `${Math.round(gap)}px`;

      setThumbsLeft(leftPx);
      setThumbsWidth(widthPx);
      setThumbsGap(gapPx);
      window.__GRAFIC_THUMBS_LEFT__ = leftPx;
      window.__GRAFIC_THUMBS_WIDTH__ = widthPx;
      window.__GRAFIC_THUMBS_GAP__ = gapPx;
    };

    const raf1 = requestAnimationFrame(compute);
    const raf2 = requestAnimationFrame(compute);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => compute());
      if (mainImageWrapRef.current) ro.observe(mainImageWrapRef.current);
      if (thumbsWrapRef.current) ro.observe(thumbsWrapRef.current);
    }

    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener('resize', compute);
      if (ro) ro.disconnect();
    };
  }, [layout, images, selectedImage, thumbnailRows]);

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (layout === 'desktop') {
    const hasTwoRows =
      Array.isArray(thumbnailRows) &&
      thumbnailRows.length === 2 &&
      thumbnailRows.every((r) => Array.isArray(r) && r.length > 0);

    const hasOneRow =
      Array.isArray(thumbnailRows) &&
      thumbnailRows.length === 1 &&
      Array.isArray(thumbnailRows[0]) &&
      thumbnailRows[0].length > 0;

    const renderThumbItem = (item, idx, keyPrefix = 'r0') => {
      if (item?.hidden) {
        const itemKey = item?.key || `${keyPrefix}-${idx}`;
        return (
          <span
            key={itemKey}
            className="block aspect-square"
            aria-hidden="true"
            style={{ borderRadius: '3px' }}
          />
        );
      }

      const img = item?.url || null;
      const absoluteIndex = typeof item?.index === 'number' ? item.index : -1;
      const itemColorKey = normalizeLoose(item?.color || item?.label);
      const selectedByIndex = absoluteIndex === effectiveSelectedImage;
      const selectedByColor = !!selectedColorKey && itemColorKey === selectedColorKey;

      const itemKey = item?.key || `${keyPrefix}-${idx}`;
      const selectedByKey = !!selectedThumbKey && itemKey === selectedThumbKey;

      // If a thumbKey is selected, ONLY that one should show the selector.
      // Otherwise fall back to index (real image) or color.
      const isSelected = selectedThumbKey ? selectedByKey : (hasValidSelectedIndex ? selectedByIndex : selectedByColor);

      return (
        <button
          key={itemKey}
          onMouseEnter={() => {
            if (img) prefetchUrl(img);
          }}
          onFocus={() => {
            if (img) prefetchUrl(img);
          }}
          onClick={() => {
            setSelectedThumbKey(itemKey);
            lastThumbWasPlaceholderRef.current = !(img && absoluteIndex >= 0);
            if (img && absoluteIndex >= 0) {
              setMainForcedSrc(null);
              forcedPlaceholderColorKeyRef.current = null;
              const nextColorKey = normalizeLoose(item?.color || item?.label);
              prepareFadeForNextSelection({ nextUrl: img, nextColorKey });

              // Prefetch opposite ink for same color to make toggling instant
              if (item?.prefetchOppositeInk !== false) {
                const pairs = buildInkPairMap();
                const bucket = pairs.get(nextColorKey);
                const thisInk = inferInkKeyFromUrl(img);
                const otherUrl =
                  thisInk === 'white' ? bucket?.black : thisInk === 'black' ? bucket?.white : null;
                if (otherUrl) prefetchUrl(otherUrl);
              }

              skipNextColorSyncRef.current = true;
              preloadThenSelect({ nextIndex: absoluteIndex, nextUrl: img });
              if (typeof onColorSelect === 'function') {
                const canonical = item?.color || null;
                if (canonical) onColorSelect(canonical);
                else {
                  const inferred = extractLooseColorFromImageUrl(img);
                  if (inferred) onColorSelect(inferred);
                }
              }
              return;
            }

            const rawFallback = item?.color || item?.label || null;
            const canonicalFallback = normalizeToCanonicalColor(rawFallback) || rawFallback;
            const placeholder = resolvePlaceholderForColor(canonicalFallback);
            if (placeholder) {
              forcedPlaceholderColorKeyRef.current = canonicalFallback
                ? normalizeLoose(canonicalFallback)
                : null;
              setMainForcedSrc(placeholder);
            }

            if (typeof onColorSelect === 'function') {
              if (canonicalFallback) onColorSelect(canonicalFallback);
            }
          }}
          className="aspect-square transition-all"
          style={{
            padding: '0',
            border: 'none',
            outline: 'none',
            outlineOffset: '0px',
            borderRadius: '0px',
            overflow: isSelected ? 'visible' : 'hidden',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            position: 'relative'
          }}
          aria-label={item?.label || `Seleccionar miniatura ${idx + 1}`}
        >
          {isSelected ? (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-6px',
                width: 'calc(100% + 12px)',
                height: 'calc(100% + 12px)',
                pointerEvents: 'none',
                zIndex: 0,
                backgroundColor: '#d1d5db',
                WebkitMaskImage: "url('/custom_logos/icons/badge-square-white.svg')",
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskImage: "url('/custom_logos/icons/badge-square-white.svg')",
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: 'contain'
              }}
            />
          ) : null}

          {img ? (
            <img
              src={img}
              alt={item?.label || `Miniatura ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              style={{ borderRadius: '3px', position: 'relative', zIndex: 1 }}
            />
          ) : (
            <span
              className="block w-full h-full"
              style={{
                position: 'relative',
                zIndex: 1,
                backgroundColor: (() => {
                  const raw = (item?.color || '').toString().trim();
                  const canonical = normalizeToCanonicalColor(raw) || raw;
                  const hex = normalizeHexColor(item?.hex || fallbackHexByCanonicalColor[canonical] || null);
                  const isWhite =
                    normalizeLoose(canonical) === normalizeLoose('Blanc') ||
                    normalizeLoose(hex) === normalizeLoose('#ffffff');
                  return isWhite ? '#f3f4f6' : (hex || '#f9fafb');
                })(),
                WebkitMaskImage: "url('/custom_logos/icons/badge-head-white.svg')",
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                WebkitMaskSize: '75%',
                maskImage: "url('/custom_logos/icons/badge-head-white.svg')",
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: '75%',
                transform: 'translateY(1px)',
                borderRadius: '3px',
                border: (() => {
                  const raw = (item?.color || '').toString().trim();
                  const canonical = normalizeToCanonicalColor(raw) || raw;
                  const hex = normalizeHexColor(item?.hex || fallbackHexByCanonicalColor[canonical] || null);
                  const isWhite =
                    normalizeLoose(canonical) === normalizeLoose('Blanc') ||
                    normalizeLoose(hex) === normalizeLoose('#ffffff');
                  return isWhite ? '1px solid #e5e7eb' : 'none';
                })()
              }}
            />
          )}
        </button>
      );
    };

    return (
      <>
        <motion.div
          className="aspect-square bg-white overflow-hidden relative cursor-pointer group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ position: 'absolute', top: '19px', left: '10px', width: '600px', height: '600px', transform: 'scale(1.01)' }}
          ref={mainImageWrapRef}
          data-main-image="1"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={resolveMainImageSrc()}
            alt={`${productName} - Vista ${selectedImage + 1}`}
            className="w-full h-full object-cover transition-transform duration-200"
            style={isZoomed ? {
              transform: 'scale(2)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            } : {}}
            onClick={() => !isZoomed && onImageClick(selectedImage)}
          />

          {mainOverlaySrc ? (
            <motion.img
              key={mainOverlaySrc}
              src={mainOverlaySrc}
              alt={`${productName} - Vista anterior`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              initial={overlayFadeMotion.initial}
              animate={overlayFadeMotion.animate}
              transition={overlayFadeMotion.transition}
              onAnimationComplete={() => setMainOverlaySrc(null)}
            />
          ) : null}

          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              aria-label={isZoomed ? 'Reduir zoom' : 'Ampliar'}
            >
              {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </button>
          </div>
        </motion.div>

        {hasTwoRows ? (
          <div
            ref={thumbsWrapRef}
            data-thumbs="1"
            data-two-row-thumbs="1"
            style={{ position: 'absolute', top: thumbsTop || '492px', left: thumbsLeft || '655px', width: thumbsWidth || '400px' }}
          >
            <div className="grid grid-cols-6" style={{ gap: thumbsGap || '10px' }}>
              {thumbnailRows[0].map((item, idx) => renderThumbItem(item, idx, 'r1'))}
            </div>

            <div className="grid grid-cols-6" style={{ gap: thumbsGap || '10px', marginTop: thumbsGap || '10px' }}>
              {thumbnailRows[1].map((item, idx) => renderThumbItem(item, idx, 'r2'))}
            </div>
          </div>
        ) : hasOneRow ? (
          <div
            ref={thumbsWrapRef}
            data-thumbs="1"
            data-one-row-thumbs="1"
            style={{ position: 'absolute', top: thumbsTop || '540px', left: thumbsLeft || '655px', width: thumbsWidth || '400px' }}
          >
            <div className="grid grid-cols-6" style={{ gap: thumbsGap || '10px' }}>
              {thumbnailRows[0].map((item, idx) => renderThumbItem(item, idx, 'r0'))}
            </div>
          </div>
        ) : (
          <div
            ref={thumbsWrapRef}
            data-thumbs="1"
            style={{ position: 'absolute', top: thumbsTop || '540px', left: thumbsLeft || '655px', width: thumbsWidth || '400px' }}
          >
            <div className="grid grid-cols-6" style={{ gap: thumbsGap || '10px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedThumbKey(null);
                    skipNextColorSyncRef.current = true;
                    setSelectedImage(idx);
                    if (typeof onColorSelect === 'function') {
                      const inferred = extractLooseColorFromImageUrl(img);
                      if (inferred) onColorSelect(inferred);
                    }
                  }}
                  className="aspect-square overflow-hidden transition-all"
                  style={{
                    padding: '0',
                    border: 'none',
                    outline: 'none',
                    outlineOffset: '0px',
                    borderRadius: '0px',
                    overflow: idx === selectedImage ? 'visible' : 'hidden',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    position: 'relative'
                  }}
                  aria-label={`Seleccionar miniatura ${idx + 1}`}
                >
                  {idx === selectedImage ? (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: '-6px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                        backgroundColor: '#d1d5db',
                        WebkitMaskImage: "url('/custom_logos/icons/badge-square-white.svg')",
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskImage: "url('/custom_logos/icons/badge-square-white.svg')",
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        maskSize: 'contain'
                      }}
                    />
                  ) : null}
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    style={{ borderRadius: '3px', position: 'relative', zIndex: 1 }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <motion.div
        className="w-full aspect-square bg-white overflow-hidden relative mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => onImageClick(selectedImage)}
      >
        <img
          src={resolveMainImageSrc()}
          alt={`${productName} - Vista ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />

        {mainOverlaySrc ? (
          <motion.img
            key={mainOverlaySrc}
            src={mainOverlaySrc}
            alt={`${productName} - Vista anterior`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            initial={overlayFadeMotion.initial}
            animate={overlayFadeMotion.animate}
            transition={overlayFadeMotion.transition}
            onAnimationComplete={() => setMainOverlaySrc(null)}
          />
        ) : null}
      </motion.div>

      <div className="mb-6">
        {Array.isArray(thumbnailRows) && thumbnailRows.length > 0 ? (
          <>
            {thumbnailRows.slice(0, 2).map((row, rowIdx) => (
              <div
                key={`thumb-row-${rowIdx}`}
                className="grid grid-cols-6"
                style={{ gap: '0', marginTop: rowIdx === 0 ? '0' : '0px' }}
              >
                {(Array.isArray(row) ? row : []).map((item, idx) => {
                  const img = item?.url || null;
                  const absoluteIndex = typeof item?.index === 'number' ? item.index : -1;
                  const itemColorKey = normalizeLoose(item?.color || item?.label);
                  const selectedByIndex = absoluteIndex === effectiveSelectedImage;
                  const selectedByColor = !!selectedColorKey && itemColorKey === selectedColorKey;
                  const isSelected = hasValidSelectedIndex ? selectedByIndex : selectedByColor;

                  return (
                    <button
                      key={item?.key || `m-${rowIdx}-${idx}`}
                      onMouseEnter={() => {
                        if (img) prefetchUrl(img);
                      }}
                      onFocus={() => {
                        if (img) prefetchUrl(img);
                      }}
                      onClick={() => {
                        if (img && absoluteIndex >= 0) {
                          const nextColorKey = normalizeLoose(item?.color || item?.label);
                          prepareFadeForNextSelection({ nextUrl: img, nextColorKey });

                          const pairs = buildInkPairMap();
                          const bucket = pairs.get(nextColorKey);
                          const thisInk = inferInkKeyFromUrl(img);
                          const otherUrl =
                            thisInk === 'white' ? bucket?.black : thisInk === 'black' ? bucket?.white : null;
                          if (otherUrl) prefetchUrl(otherUrl);

                          skipNextColorSyncRef.current = true;
                          preloadThenSelect({ nextIndex: absoluteIndex, nextUrl: img });
                          if (typeof onColorSelect === 'function') {
                            const canonical = item?.color || null;
                            if (canonical) onColorSelect(canonical);
                            else {
                              const inferred = extractLooseColorFromImageUrl(img);
                              if (inferred) onColorSelect(inferred);
                            }
                          }
                          return;
                        }

                        const rawFallback = item?.color || item?.label || null;
                        const canonicalFallback = normalizeToCanonicalColor(rawFallback) || rawFallback;
                        const placeholder = resolvePlaceholderForColor(canonicalFallback);
                        if (placeholder) {
                          forcedPlaceholderColorKeyRef.current = canonicalFallback
                            ? normalizeLoose(canonicalFallback)
                            : null;
                          setMainForcedSrc(placeholder);
                        }

                        if (typeof onColorSelect === 'function') {
                          if (canonicalFallback) onColorSelect(canonicalFallback);
                        }
                      }}
                      className={`aspect-square overflow-hidden transition-all ${
                        isSelected ? 'ring-1 ring-black' : ''
                      }`}
                      style={{
                        padding: '0',
                        borderWidth: '0',
                        borderRadius: '3px'
                      }}
                      aria-label={item?.label || `Seleccionar miniatura ${idx + 1}`}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={item?.label || `Miniatura ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          style={{ borderRadius: '3px', position: 'relative', zIndex: 1 }}
                        />
                      ) : (
                        <span
                          className="block w-full h-full"
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            backgroundColor: (() => {
                              const raw = (item?.color || '').toString().trim();
                              const canonical = normalizeToCanonicalColor(raw) || raw;
                              const hex = item?.hex || fallbackHexByCanonicalColor[canonical] || null;
                              const isWhite =
                                normalizeLoose(canonical) === normalizeLoose('Blanc') ||
                                normalizeLoose(hex) === normalizeLoose('#ffffff');
                              return isWhite ? '#f3f4f6' : (hex || '#f9fafb');
                            })(),
                            WebkitMaskImage: "url('/custom_logos/icons/badge-head-white.svg')",
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            WebkitMaskSize: '75%',
                            maskImage: "url('/custom_logos/icons/badge-head-white.svg')",
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            maskSize: '75%',
                            transform: 'translateY(1px)',
                            borderRadius: '3px',
                            border: (() => {
                              const raw = (item?.color || '').toString().trim();
                              const canonical = normalizeToCanonicalColor(raw) || raw;
                              const hex = item?.hex || fallbackHexByCanonicalColor[canonical] || null;
                              const isWhite =
                                normalizeLoose(canonical) === normalizeLoose('Blanc') ||
                                normalizeLoose(hex) === normalizeLoose('#ffffff');
                              return isWhite ? '1px solid #e5e7eb' : 'none';
                            })()
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </>
        ) : (
          <div className="grid grid-cols-6 gap-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square overflow-hidden transition-all ${
                  idx === selectedImage ? 'ring-1 ring-black' : ''
                }`}
                style={{
                  padding: '0',
                  borderWidth: '0',
                  borderRadius: '3px'
                }}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  style={{ borderRadius: '3px' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductGallery;
