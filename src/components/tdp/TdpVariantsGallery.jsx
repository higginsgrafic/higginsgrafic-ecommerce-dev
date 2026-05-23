import React, { useState } from 'react';
import TdpConstructorProduct from '@/components/tdp/TdpConstructorProduct';

const PAUTA_GUTTER_X = '22.5px';
const PAUTA_GUTTER_Y = '3px';
const PAUTA_FIRST_ROW_SCALE = 0.7;
const PAUTA_FIRST_ROW_EXTRA_PX = 4;

const DEFAULT_DESCRIPTION = [
  "Mereixedors són d'honor, glòria e de fama e contínua bona memòria los ",
  'hòmens virtuosos, e singularment aquells qui per la república lluitaren.',
].join('\n');

const DEFAULT_IMAGE_SRC =
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png';

const DEFAULT_VARIANTS = [
  { variant: 'v3', label: 'v3', editableIdPrefix: 'tdp-gallery-v3' },
  { variant: 'v4', label: 'v4', editableIdPrefix: 'tdp-gallery-v4' },
];

function TdpVariantsGallery({
  variants = DEFAULT_VARIANTS,
  productName = 'NOM DE PRODUCTE',
  description = DEFAULT_DESCRIPTION,
  price = '15,50€',
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt = 'Mostra de producte',
  sizes = ['S', 'M', 'L', 'XL', 'XXL'],
  showLabels = true,
  copyMode = true,
  numRows = 21,
}) {
  const [selectedSize, setSelectedSize] = useState('M');
  const columnCount = Math.max(variants.length, 1);
  const columnsTemplate = `repeat(${columnCount}, minmax(0, calc((100% - ${
    (columnCount - 1) * 22.5
  }px) / ${columnCount})))`;

  const rowsTemplate = `minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, ${PAUTA_FIRST_ROW_SCALE}fr) repeat(${numRows - 1}, minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, 1fr))`;

  return (
    <div
      style={{
        position: 'relative',
        left: '50%',
        top: '25px',
        transform: 'translateX(-50%)',
        width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
        height: 'calc(calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.84632) - 231px)',
        display: 'grid',
        gridTemplateColumns: columnsTemplate,
        columnGap: PAUTA_GUTTER_X,
        border: '2px solid #3b82f6', // BLAU: Límit de la galeria de targetes
      }}
    >
      {variants.map((entry, index) => {
        const parentGridColumn = `${index + 1} / ${index + 2}`;
        if (!entry || entry.empty) {
          return (
            <div
              key={`empty-${index}`}
              style={{
                gridColumn: parentGridColumn,
                width: '100%',
                border: '2px dashed #cbd5e1', // GRIS: Columna buida
              }}
            />
          );
        }
        const idPrefix = entry.editableIdPrefix || `tdp-gallery-${entry.variant || index}`;
        return (
          <div
            key={idPrefix}
            style={{
              gridColumn: parentGridColumn,
              display: 'grid',
              gridTemplateColumns: '100%',
              gridTemplateRows: rowsTemplate,
              rowGap: PAUTA_GUTTER_Y,
              position: 'relative',
              width: '100%',
              height: '100%', // Fes que s'adapti verticalment al 100% de l'alçada del pare blau
              overflow: 'hidden', // Restringeix sempre el contingut a l'interior del pare blau
              boxSizing: 'border-box',
              border: '2px dashed #f97316', // TARONJA: Límit del grid de 24 files d'aquesta targeta
            }}
          >
            {entry.cardBg ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  gridRow: entry.cardBgGridRow || '1 / -1',
                  backgroundColor: entry.cardBg,
                  zIndex: 1,
                  pointerEvents: 'none',
                  width: '100%',
                  marginLeft: '0px',
                  marginRight: '0px',
                  marginTop: entry.cardBgMarginTop || '0px',
                  marginBottom: '0px',
                  height: entry.cardBgHeight || '100%',
                  alignSelf: 'start',
                }}
              />
            ) : null}
            {showLabels && entry.label ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  gridRow: '1 / 2',
                  alignSelf: 'center',
                  justifySelf: 'center',
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#475059',
                  zIndex: 5,
                }}
              >
                {entry.label}
              </div>
            ) : null}
            <TdpConstructorProduct
              gridColumn="1 / 2"
              productName={entry.productName ?? productName}
              description={entry.description ?? description}
              price={entry.price ?? price}
              imageSrc={entry.imageSrc ?? imageSrc}
              imageAlt={entry.imageAlt ?? imageAlt}
              sizes={entry.sizes ?? sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              cartCount={0}
              onAddToCart={() => {}}
              gutterY={PAUTA_GUTTER_Y}
              editableIdPrefix={idPrefix}
              copyMode={entry.copyMode ?? copyMode}
              variant={entry.variant ?? 'v3'}
              {...entry}
            />
          </div>
        );
      })}
    </div>
  );
}

export default TdpVariantsGallery;
