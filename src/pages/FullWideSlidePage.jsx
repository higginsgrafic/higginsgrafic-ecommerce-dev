import React from 'react';
import { useNavigate } from 'react-router-dom';
import FullWideSlideDemoHeader from '@/components/FullWideSlideDemoHeader';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';
import { useProductContext } from '@/contexts/ProductContext';

export default function FullWideSlidePage() {
  const { config: componentCatalogConfig, loading: componentCatalogLoading } = useComponentCatalogConfig();
  const navigate = useNavigate();
  const { getTotalItems } = useProductContext();

  const fullWideSlide = componentCatalogConfig?.components?.fullWideSlide;
  const megaMenu = fullWideSlide?.megaMenu;
  const resolvedNavItems = Array.isArray(megaMenu?.navItems) && megaMenu.navItems.length > 0 ? megaMenu.navItems : undefined;
  const resolvedMegaConfig =
    megaMenu?.megaConfig && typeof megaMenu.megaConfig === 'object' && Object.keys(megaMenu.megaConfig).length > 0 ? megaMenu.megaConfig : undefined;

  if (componentCatalogLoading && !componentCatalogConfig) return null;
  if (fullWideSlide && fullWideSlide.enabled === false) return null;

  return (
    <div className="min-h-[calc(100vh-var(--appHeaderOffset,0px))] bg-background">
      <FullWideSlideDemoHeader
        cartItemCount={getTotalItems()}
        onCartClick={() => {
          navigate('/cart');
        }}
        onUserClick={() => {
          navigate('/profile');
        }}
        ignoreStripeDebugFromUrl
        navItems={resolvedNavItems}
        megaConfig={resolvedMegaConfig}
        showStripe={megaMenu?.showStripe !== false}
        showCatalogPanel={megaMenu?.showCatalogPanel !== false}
      />
    </div>
  );
}
