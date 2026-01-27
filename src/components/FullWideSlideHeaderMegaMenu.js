import React from 'react';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';
import FullWideSlideHeaderMegaMenuContained from '@/components/FullWideSlideHeaderMegaMenuContained';

export default function FullWideSlideHeaderMegaMenu({ portalContainer }) {
  const { config, loading } = useComponentCatalogConfig();

  const fullWideSlide = config?.components?.fullWideSlide;
  const megaMenu = fullWideSlide?.megaMenu;

  const resolvedNavItems = Array.isArray(megaMenu?.navItems) && megaMenu.navItems.length > 0 ? megaMenu.navItems : undefined;
  const resolvedMegaConfig =
    megaMenu?.megaConfig && typeof megaMenu.megaConfig === 'object' && Object.keys(megaMenu.megaConfig).length > 0 ? megaMenu.megaConfig : undefined;

  if (loading && !config) return null;

  if (fullWideSlide && fullWideSlide.enabled === false) {
    return null;
  }

  return React.createElement(FullWideSlideHeaderMegaMenuContained, {
    portalContainer,
    navItems: resolvedNavItems,
    megaConfig: resolvedMegaConfig,
    showStripe: megaMenu?.showStripe !== false,
    showCatalogPanel: megaMenu?.showCatalogPanel !== false,
  });
}
