import { useState, useEffect, useRef, useCallback } from 'react';

export default function useLayoutInspector({ layoutInspectorActive }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedContainerToken, setSelectedContainerToken] = useState('');
  const [copyContainerStatus, setCopyContainerStatus] = useState('idle');
  const [selectionStatus, setSelectionStatus] = useState('idle');
  const [layoutInspectorPickEnabled, setLayoutInspectorPickEnabled] = useState(false);
  const [clicksEnabled, setClicksEnabled] = useState(false);
  const [clickMarks, setClickMarks] = useState([]);

  const debugButtonsWrapRef = useRef(null);
  const selectedElementNodeRef = useRef(null);
  const lastCopiedTokenRef = useRef('');
  const pickCycleRef = useRef({ x: null, y: null, idx: 0, sig: '' });

  // Persist clicksEnabled
  useEffect(() => {
    try {
      localStorage.setItem('DEV_CLICKS_ENABLED', clicksEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [clicksEnabled]);

  // Reset clicks when inspector deactivates
  useEffect(() => {
    if (layoutInspectorActive) return;
    setClicksEnabled(false);
    setClickMarks([]);
  }, [layoutInspectorActive]);

  // Persist layoutInspectorPickEnabled
  useEffect(() => {
    try {
      localStorage.setItem('layoutInspectorPickEnabled', JSON.stringify(layoutInspectorPickEnabled));
    } catch {
      // ignore
    }
  }, [layoutInspectorPickEnabled]);

  // Toggle body class
  useEffect(() => {
    try {
      document.body.classList.toggle('debug-containers', !!layoutInspectorActive);
      return () => {
        document.body.classList.remove('debug-containers');
      };
    } catch {
      return undefined;
    }
  }, [layoutInspectorActive]);

  // Cleanup stale localStorage keys on mount
  useEffect(() => {
    try {
      localStorage.removeItem('layoutInspectorPickEnabled');
      localStorage.removeItem('adminTools');
    } catch {
      // ignore
    }
  }, []);

  const buildContainerToken = useCallback((el) => {
    if (!el || !(el instanceof Element)) return '';
    const tagNameRaw = (el.tagName || '').toLowerCase();
    const idRaw = (el.getAttribute('id') || '').trim();
    const classRaw = (el.getAttribute('class') || '').replace(/\bdebug-selected\b/g, '').trim();
    const classes = classRaw ? String(classRaw).split(/\s+/).filter(Boolean) : [];

    const isTailwindUtilityClass = (cls) => {
      if (!cls) return true;
      if (cls === 'debug-exempt' || cls === 'debug-selected') return true;
      if (cls.includes(':')) return true;
      if (/^(group|peer)$/.test(cls)) return true;
      if (/^(container)$/.test(cls)) return true;
      if (/^(sr-only|not-sr-only)$/.test(cls)) return true;
      if (/^(prose|dark|light)$/.test(cls)) return true;
      return /^(mx|my|mt|mr|mb|ml|m|px|py|pt|pr|pb|pl|p|w|min-w|max-w|h|min-h|max-h|text|font|leading|tracking|uppercase|lowercase|capitalize|bg|from|via|to|border|rounded|ring|shadow|opacity|flex|inline-flex|grid|block|inline-block|hidden|items|justify|content|self|place|gap|space|order|grow|shrink|basis|overflow|relative|absolute|fixed|sticky|top|left|right|bottom|inset|z|cursor|pointer-events|select|transition|duration|ease|delay|animate|transform|origin|scale|rotate|translate|skew|blur|drop-shadow|backdrop|object|aspect|whitespace|break|truncate|antialiased|subpixel-antialiased)(-|$)/.test(cls);
    };

    const pickHumanClass = () => {
      const candidate = classes.find((c) => !isTailwindUtilityClass(c));
      return candidate || '';
    };

    const hintClass = pickHumanClass();

    const getDataHint = (node) => {
      if (!node || !(node instanceof Element)) return '';
      const page = (node.getAttribute('data-page') || '').trim();
      if (page) return `[data-page=${page}]`;
      const section = (node.getAttribute('data-section') || '').trim();
      if (section) return `[data-section=${section}]`;
      const component = (node.getAttribute('data-component') || '').trim();
      if (component) return `[data-component=${component}]`;
      const container = (node.getAttribute('data-container') || '').trim();
      if (container) return `[data-container=${container}]`;
      return '';
    };

    const getAriaHint = (node) => {
      if (!node || !(node instanceof Element)) return '';
      const aria = (node.getAttribute('aria-label') || '').trim();
      if (aria) return `[aria-label="${aria}"]`;
      const role = (node.getAttribute('role') || '').trim();
      if (role && role !== 'presentation') return `[role=${role}]`;
      return '';
    };

    const getNodeLabel = (node) => {
      if (!node || !(node instanceof Element)) return '';
      const id = (node.getAttribute('id') || '').trim();
      if (id) return `#${id}`;
      const dataHint = getDataHint(node);
      if (dataHint) return dataHint;
      const ariaHint = getAriaHint(node);
      if (ariaHint) return ariaHint;
      const clsRaw = (node.getAttribute('class') || '').replace(/\bdebug-selected\b/g, '').trim();
      const cls = clsRaw ? String(clsRaw).split(/\s+/).filter(Boolean) : [];
      const humanCls = cls.find((c) => !isTailwindUtilityClass(c));
      if (humanCls) return `.${humanCls}`;
      return '';
    };

    const buildPath = () => {
      const parts = [];
      let cur = el;
      while (cur && cur instanceof Element && cur !== document.body) {
        const tag = (cur.tagName || '').toLowerCase();
        const parent = cur.parentElement;
        const idx = parent ? Math.max(0, Array.from(parent.children).indexOf(cur)) : 0;
        const label = getNodeLabel(cur);
        parts.unshift(label ? `${tag}${label}` : `${tag}[${idx}]`);
        if (cur.getAttribute('id')) break;
        if (cur.getAttribute('data-page')) break;
        if (cur.getAttribute('data-section')) break;
        if (cur.getAttribute('data-component')) break;
        if (cur.getAttribute('data-container')) break;
        cur = parent;
      }
      return parts.join('>');
    };

    const hint = idRaw
      ? `#${idRaw}`
      : getDataHint(el)
        ? getDataHint(el)
      : hintClass
        ? `.${hintClass}`
        : '';

    return `${buildPath()}${hint ? ` ${tagNameRaw}${hint}` : ''}`.trim();
  }, []);

  // Handle layout inspector element click
  useEffect(() => {
    if (!layoutInspectorActive) {
      setSelectedElement(null);
      selectedElementNodeRef.current = null;
      setSelectedContainerToken('');
      setCopyContainerStatus('idle');
      setSelectionStatus('idle');
      lastCopiedTokenRef.current = '';
      return;
    }

    const isFixedElement = (el) => {
      if (!el || !(el instanceof Element)) return false;
      try {
        return window.getComputedStyle(el).position === 'fixed';
      } catch {
        return false;
      }
    };

    const isInLayoutInspectorRoot = (el) => {
      if (!el || !(el instanceof Element) || !el.closest) return false;
      return !!el.closest('[data-layout-inspector-root="true"]');
    };

    const isDevOverlay = (el) => !!(el && el instanceof Element && el.closest('[data-dev-overlay="true"]'));

    const pickElementInMain = (clientX, clientY) => {
      const main = document.getElementById('main-content');
      const overlayRoot = document.querySelector('[data-layout-inspector-root="true"]');
      if (!main && !overlayRoot) return null;
      if (!document.elementsFromPoint) return null;
      const stack = document.elementsFromPoint(clientX, clientY);
      const toolbar = debugButtonsWrapRef.current;

      const filtered = stack
        .filter((el) => el instanceof Element)
        .filter((el) => (main && main.contains(el)) || (overlayRoot && overlayRoot.contains(el)))
        .filter((el) => !isDevOverlay(el))
        .filter((el) => !(toolbar && toolbar.contains(el)))
        .filter((el) => !isFixedElement(el) || isInLayoutInspectorRoot(el))
        .filter((el) => {
          try {
            const cs = window.getComputedStyle(el);
            if (cs.pointerEvents === 'none') return false;
            if (cs.visibility === 'hidden') return false;
            if (cs.display === 'none') return false;
          } catch {
            // ignore
          }
          return true;
        });

      if (!filtered.length) return null;

      const signature = filtered
        .slice(0, 12)
        .map((el) => {
          const tag = (el.tagName || '').toLowerCase();
          const id = (el.getAttribute('id') || '').trim();
          const cls = (el.getAttribute('class') || '').toString();
          return `${tag}#${id}.${cls}`;
        })
        .join('|');

      const samePoint = pickCycleRef.current.x === clientX && pickCycleRef.current.y === clientY && pickCycleRef.current.sig === signature;
      const nextIdx = samePoint ? pickCycleRef.current.idx + 1 : 0;
      const idx = nextIdx % filtered.length;
      pickCycleRef.current = { x: clientX, y: clientY, idx, sig: signature };

      return filtered[idx];
    };

    const clearSelection = () => {
      const previousSelected = document.querySelector('.debug-selected');
      if (previousSelected) previousSelected.classList.remove('debug-selected');
      setSelectedElement(null);
      selectedElementNodeRef.current = null;
      setSelectedContainerToken('');
      setCopyContainerStatus('idle');
      setSelectionStatus('idle');
    };

    const onPointerDown = (e) => {
      if (!layoutInspectorActive) {
        return;
      }
      const toolbar = debugButtonsWrapRef.current;
      if (toolbar && toolbar.contains(e.target)) return;
      if (e.target && e.target.closest && e.target.closest('.debug-exempt,[data-debug-exempt="true"]')) return;
      if (isDevOverlay(e.target)) return;
      if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
      const main = document.getElementById('main-content');
      const inMain = main && e.target instanceof Element && main.contains(e.target);
      const inOverlay = e.target instanceof Element && isInLayoutInspectorRoot(e.target);
      if (!(inMain || inOverlay)) return;

      // Només selecciona elements si clicksEnabled està desactivat
      if (clicksEnabled) return;

      const pickedFromPoint = pickElementInMain(e.clientX, e.clientY);
      const pickedFromTarget = (main && main.contains(e.target) && !isDevOverlay(e.target) && !isFixedElement(e.target)) ? e.target : null;
      const picked = pickedFromPoint || pickedFromTarget;
      if (!picked) {
        clearSelection();
        return;
      }

      const target = picked;
      const previousSelected = document.querySelector('.debug-selected');
      if (previousSelected) previousSelected.classList.remove('debug-selected');
      if (target.classList) target.classList.add('debug-selected');

      selectedElementNodeRef.current = target;
      const token = buildContainerToken(target);
      setSelectedContainerToken((prev) => {
        const isSame = prev && prev === token;
        setSelectionStatus(isSame ? 'selected_same' : 'selected_new');
        window.setTimeout(() => setSelectionStatus('idle'), 900);
        return token;
      });
      setCopyContainerStatus('ready');
    };

    const onClickCapture = (e) => {
      if (!layoutInspectorActive) return;
      const toolbar = debugButtonsWrapRef.current;
      if (toolbar && toolbar.contains(e.target)) return;
      if (e.target && e.target.closest && e.target.closest('.debug-exempt,[data-debug-exempt="true"]')) return;
      if (isDevOverlay(e.target)) return;
      if (e.target && e.target.closest && e.target.closest('[data-stripe-calib-hud="1"]')) return;
      const main = document.getElementById('main-content');
      const inMain = main && e.target instanceof Element && main.contains(e.target);
      const inOverlay = e.target instanceof Element && isInLayoutInspectorRoot(e.target);
      if (!(inMain || inOverlay)) return;

      // Blocatge només si clicksEnabled està desactivat
      if (!clicksEnabled) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      }
    };

    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    window.addEventListener('click', onClickCapture, { capture: true });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
      window.removeEventListener('click', onClickCapture, { capture: true });
      const selected = document.querySelector('.debug-selected');
      if (selected) selected.classList.remove('debug-selected');
      selectedElementNodeRef.current = null;
    };
  }, [layoutInspectorActive, layoutInspectorPickEnabled, clicksEnabled, buildContainerToken]);

  const copySelectedContainer = useCallback(async () => {
    if (!layoutInspectorActive) return;

    const mainContent = document.getElementById('main-content');
    const overlayRoot = document.querySelector('[data-layout-inspector-root="true"]');
    const node = selectedElementNodeRef.current;
    const nodeIsValid = !!(
      node &&
      node instanceof Element &&
      !node.closest('[data-dev-overlay="true"]') &&
      ((mainContent && mainContent.contains(node)) || (overlayRoot && overlayRoot.contains(node))) &&
      (window.getComputedStyle(node).position !== 'fixed' || (node.closest && node.closest('[data-layout-inspector-root="true"]')))
    );

    const tokenNow = nodeIsValid ? buildContainerToken(node) : '';
    if (!tokenNow) return;
    const text = tokenNow;
    if (text !== selectedContainerToken) {
      setSelectedContainerToken(text);
    }

    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = fallbackCopy();
        if (!ok) throw new Error('copy_failed');
      }
      setCopyContainerStatus((prev) => {
        const isRepeat = lastCopiedTokenRef.current && lastCopiedTokenRef.current === text;
        return isRepeat ? 'copied_again' : 'copied';
      });
      lastCopiedTokenRef.current = text;
      window.setTimeout(() => setCopyContainerStatus('ready'), 1200);
    } catch {
      setCopyContainerStatus('ready');
    }
  }, [layoutInspectorActive, buildContainerToken, selectedContainerToken]);

  return {
    selectedElement,
    setSelectedElement,
    selectedContainerToken,
    setSelectedContainerToken,
    copyContainerStatus,
    setCopyContainerStatus,
    selectionStatus,
    setSelectionStatus,
    layoutInspectorPickEnabled,
    setLayoutInspectorPickEnabled,
    clicksEnabled,
    setClicksEnabled,
    clickMarks,
    setClickMarks,
    debugButtonsWrapRef,
    selectedElementNodeRef,
    lastCopiedTokenRef,
    pickCycleRef,
    buildContainerToken,
    copySelectedContainer,
  };
}
