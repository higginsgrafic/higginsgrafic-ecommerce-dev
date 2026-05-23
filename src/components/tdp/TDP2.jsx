import React from 'react';
import TdpConstructorProduct from '@/components/tdp/TdpConstructorProduct';

const PAUTA_GUTTER_Y = '3px';
const PAUTA_FIRST_ROW_SCALE = 0.7;
const PAUTA_FIRST_ROW_EXTRA_PX = 4;

const DEFAULT_DESCRIPTION = [
  "Mereixedors són d'honor, glòria e de fama e contínua bona memòria los ",
  'hòmens virtuosos, e singularment aquells qui per la república lluitaren.',
].join('\n');

const DEFAULT_IMAGE_SRC =
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png';

function TDP2({
  gridColumn,
  productName = 'NOM DE PRODUCTE',
  description = DEFAULT_DESCRIPTION,
  price = '15,50€',
  imageSrc = DEFAULT_IMAGE_SRC,
  imageAlt = 'Product Image',
  sizes = ['S', 'M', 'L', 'XL', 'XXL'],
  selectedSize,
  onSizeChange,
  onAddToCart,
  cartCount = 0,
  editableIdPrefix,
  copyMode = true,
  cardBg = '#fbfcfd',
  cardBgGridRow = '1 / -1',
  cardBgMarginTop = '0px',
  cardBgHeight = '100%',
  style,
  ...extraProps
}) {
  const numRows = 24;
  const rowsTemplate = `minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, ${PAUTA_FIRST_ROW_SCALE}fr) repeat(${numRows - 1}, minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, 1fr))`;

  return (
    <div
      style={{
        gridColumn,
        display: 'grid',
        gridTemplateColumns: '100%',
        gridTemplateRows: rowsTemplate,
        rowGap: PAUTA_GUTTER_Y,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {cardBg ? (
        <div
          style={{
            gridColumn: '1 / -1',
            gridRow: cardBgGridRow,
            backgroundColor: cardBg,
            zIndex: 1,
            pointerEvents: 'none',
            width: '100%',
            marginLeft: '0px',
            marginRight: '0px',
            marginTop: cardBgMarginTop,
            marginBottom: '0px',
            height: cardBgHeight,
            alignSelf: 'start',
          }}
        />
      ) : null}

      <TdpConstructorProduct
        gridColumn="1 / 2"
        productName={productName}
        description={description}
        price={price}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        sizes={sizes}
        selectedSize={selectedSize}
        onSizeChange={onSizeChange}
        cartCount={cartCount}
        onAddToCart={onAddToCart}
        gutterY={PAUTA_GUTTER_Y}
        editableIdPrefix={editableIdPrefix}
        copyMode={copyMode}
        variant="v4"
        rowOffset={4}
        imageGridRow="2 / 12"               // Imatge a dalt (de fila 2 a 12)
        productNameGridRow="14 / 15"         // Baixat 1 fila (abans 13 / 14)
        productNameTranslateY="calc(50% - 13px)"
        descriptionGridRow="16 / 21"         // Baixat 1 fila (abans 15 / 20)
        descriptionTranslateY="-8px"
        priceTranslateY="calc(-50% - 8px)"
        sizeButtonsMarginTop="calc(-1 * 3px - 9.5px)"
        imageWidth="100%"
        imageMaxHeight="none"
        imageTranslateY="calc(-24px + calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.01410547))"
        presetVersion="tdp-home-v4-clean"
        productNamePlain={true}
        {...extraProps}
      />
    </div>
  );
}

export default TDP2;
