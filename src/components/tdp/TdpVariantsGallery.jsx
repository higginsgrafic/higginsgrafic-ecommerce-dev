import React, { useState } from 'react';
import TdpConstructorProduct from '@/components/tdp/TdpConstructorProduct';

const PAUTA_ROWS = 21;
const PAUTA_GUTTER_X = '22.5px';
const PAUTA_GUTTER_Y = '3px';
const PAUTA_FIRST_ROW_SCALE = 0.7;
const PAUTA_FIRST_ROW_EXTRA_PX = 4;
const PAUTA_ROWS_TEMPLATE = `minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, ${PAUTA_FIRST_ROW_SCALE}fr) repeat(${PAUTA_ROWS - 1}, minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, 1fr))`;

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
}) {
  const [selectedSize, setSelectedSize] = useState('M');
  const columnCount = Math.max(variants.length, 1);
  const columnsTemplate = `repeat(${columnCount}, minmax(0, calc((100% - ${
    (columnCount - 1) * 22.5
  }px) / ${columnCount})))`;

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: columnsTemplate,
        gridTemplateRows: PAUTA_ROWS_TEMPLATE,
        columnGap: PAUTA_GUTTER_X,
        rowGap: PAUTA_GUTTER_Y,
      }}
    >
      {variants.map((entry, index) => {
        const gridColumn = `${index + 1} / ${index + 2}`;
        const idPrefix = entry.editableIdPrefix || `tdp-gallery-${entry.variant || index}`;
        return (
          <React.Fragment key={idPrefix}>
            {showLabels && entry.label ? (
              <div
                style={{
                  gridColumn,
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
              gridColumn={gridColumn}
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
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default TdpVariantsGallery;
