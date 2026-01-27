import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import FullWideSlide from '@/components/FullWideSlide';

export default function AdminMegaMenu({ className = '' }) {
  const location = useLocation();

  const groups = useMemo(
    () => [
      {
        title: 'Controls globals',
        items: [
          { label: 'Tema / Controls', path: '/admin/controls' },
          { label: 'Plantilles', path: '/admin/plantilles' },
        ],
      },
      {
        title: 'Storefront',
        items: [
          { label: 'Promocions', path: '/admin/promotions' },
          { label: 'Hero', path: '/admin/hero' },
          { label: 'Col·leccions', path: '/admin/collections' },
        ],
      },
      {
        title: 'Contingut',
        items: [
          { label: 'Editor de Textos', path: '/admin/index' },
          { label: 'Textos de Sistema', path: '/admin/system-messages' },
        ],
      },
      {
        title: 'Catàleg / Assets',
        items: [
          { label: 'Media', path: '/admin/media' },
          { label: 'Mockups', path: '/admin/mockups' },
          { label: 'Upload', path: '/admin/upload' },
        ],
      },
      {
        title: 'Operació',
        items: [
          { label: 'Fulfillment', path: '/admin/fulfillment' },
          { label: 'Fulfillment Settings', path: '/admin/fulfillment-settings' },
          { label: 'Gelato Sync', path: '/admin/gelato-sync' },
          { label: 'Gelato Blank', path: '/admin/gelato-blank' },
          { label: 'Gelato Templates', path: '/admin/gelato-templates' },
          { label: 'Products Overview', path: '/admin/products-overview' },
        ],
      },
      {
        title: 'Utilitats',
        items: [
          { label: 'Demos', path: '/admin/demos' },
          { label: 'Unitats', path: '/admin/unitats' },
          { label: 'EC Config', path: '/admin/ec-config' },
        ],
      },
      {
        title: { label: 'WIP', path: '/admin/wip' },
        items: [
          { label: 'FullWideSlide', path: '/full-wide-slide' },
        ],
      },
    ],
    []
  );

  const isHome = location.pathname === '/admin';
  const subtitle = location.pathname;

  return (
    <FullWideSlide
      className={className}
      sections={groups}
      triggerLabel="Menú"
      openAriaLabel="Obrir menú"
      overlayAriaLabel="Tancar menú"
      title={isHome ? undefined : 'Admin'}
      subtitle={isHome ? undefined : subtitle}
    />
  );
}
