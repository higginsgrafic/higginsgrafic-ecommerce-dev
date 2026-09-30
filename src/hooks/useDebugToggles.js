import { useCallback, useEffect, useState } from 'react';

/**
 * Treu un parametre de l'adreca SENSE recarregar la pagina.
 *
 * Els commutadors d'aquest hook es poden encendre des de l'adreca (`?carril=1`,
 * `?belt2=1`) i allo mana en cada obertura. El problema (02/10/2026, «Amaga les
 * guies de carril, que des el botó no va»): si l'adreca porta el parametre, el
 * boto apaga les guies pero el valor NO es desa (es una mesura d'eina), o sigui
 * que al recarregar o navegar tornaven a sortir. Apagar-les a mà ara tambe treu
 * el parametre de l'adreca: a partir d'aqui mana el que diu el boto.
 */
function treuParametreAdreca(nom) {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(nom)) return;
    url.searchParams.delete(nom);
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch {
    // ignore
  }
}

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

  // `?belt2=1` mana nome's en aquesta obertura: es el que fa servir l'eina de
  // formats per posar les guies del carril a cada finestra. I per aixo mateix
  // NO es desa (vegeu l'efecte de sota): si es deses, encendre-les des de l'eina
  // les deixaria enceses per sempre mes, tambe quan l'eina les apaga.
  // EL QUE LA URL DEIA EN OBRIR, CLAVAT (01/10/2026).
  //
  // Era un `const` recalculat a cada render des de la URL VIVA. L'app reescriu
  // la URL (per exemple, el megaslide hi posa `?active=`), i aleshores el
  // parametre desapareixia, aquest valor passava a `null` i la guarda de sota
  // («nome's no es desa l'encendre des de la URL») deixava de fer res: el valor
  // ences s'hi desava i les guies del carril quedaven enceses per SEMPRE, tambe
  // fora de l'eina de mesura. Ho va veure l'amo: «les guies queden connectades
  // tota l'estona». Amb `useState` es llegeix un sol cop, en muntar-se.
  const [belt2FromUrl] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.has('belt2') ? sp.get('belt2') !== '0' : null;
    } catch {
      return null;
    }
  });

  const [belt2GuidesEnabled, setBelt2GuidesEnabled] = useState(() => {
    if (belt2FromUrl !== null) return belt2FromUrl;
    try {
      const raw = window.localStorage.getItem('HG_BELT2_GUIDES_ENABLED_V1');
      return raw === '1';
    } catch {
      return false;
    }
  });

  // LES DUES GUIDES DEL CARRIL (les blaves). Tenen el seu propi commutador
  // perque no arrosseguin les linies del "Belt 2" (les verdes i les
  // horitzontals de calibratge), que no tenen res a veure amb el carril.
  // `?carril=1` mana nome's en aquesta obertura i no es desa (vegeu l'efecte).
  // El mateix que a `belt2`: el que deia la URL en obrir, clavtat (01/10/2026).
  const [carrilFromUrl] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.has('carril') ? sp.get('carril') !== '0' : null;
    } catch {
      return null;
    }
  });

  const [carrilGuidesEnabled, setCarrilGuidesEnabled] = useState(() => {
    if (carrilFromUrl !== null) return carrilFromUrl;
    try {
      return window.localStorage.getItem('HG_CARRIL_GUIDES_ENABLED_V1') === '1';
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

  // EL BOTO MANA SOBRE L'ADRECA (02/10/2026). Quan el commutador es toca a mà es
  // treu el parametre de l'adreca (`treuParametreAdreca`) i, a mes, es deixa de
  // fer cas de la guarda que impedia desar el valor: si no, amb `?carril=1` el
  // boto apagava les guies pero no es desava res i tornaven a sortir al
  // recarregar o navegar («Amaga les guies de carril, que des el botó no va»).
  const [belt2TocatAMa, setBelt2TocatAMa] = useState(false);
  const [carrilTocatAMa, setCarrilTocatAMa] = useState(false);
  const canviaBelt2Guides = useCallback((valor) => {
    treuParametreAdreca('belt2');
    setBelt2TocatAMa(true);
    setBelt2GuidesEnabled(valor);
  }, []);
  const canviaCarrilGuides = useCallback((valor) => {
    treuParametreAdreca('carril');
    setCarrilTocatAMa(true);
    setCarrilGuidesEnabled(valor);
  }, []);

  useEffect(() => {
    // NOME'S NO ES DESA L'ENCENDRE DES DE LA URL (28/09/2026). En Marc: «No es
    // desactiven»: amb `?belt2=0` les guies s'apagaven en aquella obertura, pero
    // el valor desat seguia essent '1' i tornaven a sortir al recarregar. Apagar
    // des de la URL SI que es desa; encendre-hi (que es el que fan les eines de
    // mesura) no, perque no les deixin enceses per sempre.
    if (!belt2TocatAMa && belt2FromUrl === true) return;
    try {
      window.localStorage.setItem('HG_BELT2_GUIDES_ENABLED_V1', belt2GuidesEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [belt2GuidesEnabled, belt2FromUrl, belt2TocatAMa]);

  useEffect(() => {
    // El mateix que a `belt2`: apagar des de la URL es desa, encendre-hi no.
    if (!carrilTocatAMa && carrilFromUrl === true) return;
    try {
      window.localStorage.setItem('HG_CARRIL_GUIDES_ENABLED_V1', carrilGuidesEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [carrilGuidesEnabled, carrilFromUrl, carrilTocatAMa]);

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
    setBelt2GuidesEnabled: canviaBelt2Guides,
    carrilGuidesEnabled,
    setCarrilGuidesEnabled: canviaCarrilGuides,
    megaAccordionLocked,
    setMegaAccordionLocked,
  };
}
