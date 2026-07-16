import { useState, useEffect } from 'react';

export default function useDebugToggles({ locationSearch }) {
  const layoutInspectorEnabledFromUrl = (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.has('layout') && sp.get('layout') !== '0';
    } catch {
      return false;
    }
  })();
  const [layoutInspectorEnabled, setLayoutInspectorEnabled] = useState(layoutInspectorEnabledFromUrl);

  const guidesEnabledFromUrl = (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.has('guides') && sp.get('guides') !== '0';
    } catch {
      return false;
    }
  })();
  const [guidesEnabled, setGuidesEnabled] = useState(guidesEnabledFromUrl);

  const [copiedDesign, setCopiedDesign] = useState(false);

  const [belt2GuidesEnabled, setBelt2GuidesEnabled] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has('belt2')) return sp.get('belt2') !== '0';
      const raw = window.localStorage.getItem('HG_BELT2_GUIDES_ENABLED_V1');
      return raw === '1';
    } catch {
      return false;
    }
  });

  const [megaAccordionLocked, setMegaAccordionLocked] = useState(() => {
    try {
      return window.localStorage.getItem('HG_MEGA_ACCORDION_LOCKED_V1') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('HG_BELT2_GUIDES_ENABLED_V1', belt2GuidesEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [belt2GuidesEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem('HG_MEGA_ACCORDION_LOCKED_V1', megaAccordionLocked ? '1' : '0');
      window.dispatchEvent(new CustomEvent('hg:mega-accordion-lock-change', { detail: { locked: megaAccordionLocked } }));
    } catch {
      // ignore
    }
  }, [megaAccordionLocked]);

  // Sync layout/guides toggles from URL search params
  useEffect(() => {
    try {
      const sp = new URLSearchParams(locationSearch);

      if (sp.has('layout')) {
        setLayoutInspectorEnabled(sp.get('layout') !== '0');
      }

      if (sp.has('guides')) {
        setGuidesEnabled(sp.get('guides') !== '0');
      }
    } catch {
      // ignore
    }
  }, [locationSearch]);

  return {
    layoutInspectorEnabled,
    setLayoutInspectorEnabled,
    guidesEnabled,
    setGuidesEnabled,
    copiedDesign,
    setCopiedDesign,
    belt2GuidesEnabled,
    setBelt2GuidesEnabled,
    megaAccordionLocked,
    setMegaAccordionLocked,
  };
}
