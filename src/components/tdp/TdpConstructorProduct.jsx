import React, { useState } from 'react';
import EditableTextBox from '@/components/dev/EditableTextBox';

export const TDP_TEXT_PRESET_VERSION = 'tdp-layout-2026-05-14-0516';

export const TDP_PRODUCT_NAME_SETTINGS = {
  x: 0,
  y: 0,
  fontFamily: 'Oswald',
  fontSize: 24,
  fontWeight: 300,
  selectedFontWeight: 700,
  letterSpacing: 0.04,
  lineHeight: 1,
  textAlign: 'center',
  verticalAlign: 'center',
  color: '#475059',
  textTransform: 'uppercase',
};

export const TDP_PRODUCT_DESCRIPTION_SETTINGS = {
  x: 0,
  y: 20,
  fontFamily: 'Roboto',
  fontSize: 19,
  fontWeight: 300,
  selectedFontWeight: 700,
  letterSpacing: 0.03,
  lineHeight: 1.65,
  textAlign: 'left',
  verticalAlign: 'center',
  color: '#111827',
  textTransform: 'none',
};

export const TDP_PRICE_SETTINGS = {
  x: 0,
  y: 0,
  fontFamily: 'Oswald',
  fontSize: 24,
  fontWeight: 300,
  selectedFontWeight: 700,
  letterSpacing: 0,
  lineHeight: 1,
  textAlign: 'center',
  verticalAlign: 'center',
  color: '#475059',
  textTransform: 'none',
};

export const TDP_SIZE_BUTTON_TEXT_SETTINGS = {
  x: 0,
  y: 0,
  fontFamily: 'Oswald',
  fontSize: 20,
  fontWeight: 300,
  selectedFontWeight: 700,
  letterSpacing: 0,
  lineHeight: 1,
  textAlign: 'center',
  verticalAlign: 'center',
  color: '#475059',
  textTransform: 'none',
};

const getTdpCartIconSrc = (count) => {
  if (count >= 2) return '/custom_logos/icons/v3-ple-2.svg';
  if (count === 1) return '/custom_logos/icons/v3-ple-1.svg';
  return '/custom_logos/icons/v3-buit.svg';
};

function TdpConstructorProduct({
  gridColumn = '2 / 3',
  productName = 'NOM DE PRODUCTE',
  description,
  price = '15,50€',
  imageSrc,
  imageAlt = '',
  sizes = ['S', 'M', 'L', 'XL', 'XXL'],
  selectedSize = 'M',
  onSizeChange,
  cartCount = 0,
  onAddToCart,
  gutterY = '3px',
  editableIdPrefix = 'tdp',
  presetVersion = TDP_TEXT_PRESET_VERSION,
  copyMode = false,
  variant = 'v3',
}) {
  const [sizeButtonTextSettings, setSizeButtonTextSettings] = useState(TDP_SIZE_BUTTON_TEXT_SETTINGS);
  const columnCount = sizes.length;
  const priceCartStyle = {
    gridColumn,
    gridRow: '19 / 20',
    alignSelf: 'stretch',
    justifySelf: 'center',
    pointerEvents: 'auto',
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    columnGap: '5px',
    width: '75%',
    height: '100%',
    transform: 'translateY(calc(-50% - 1.5px))',
    zIndex: 3,
  };
  const buttonGroupStyle = {
    gridColumn,
    gridRow: '20 / 21',
    alignSelf: 'stretch',
    justifySelf: 'center',
    pointerEvents: 'auto',
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    columnGap: '5px',
    width: '75%',
    height: `calc(100% + ${gutterY} + ${gutterY})`,
    marginTop: `calc(-1 * ${gutterY})`,
    position: 'relative',
    overflow: 'visible',
    zIndex: 2,
  };
  const handleSizeFromEvent = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const columnWidth = rect.width / sizes.length;
    const index = Math.min(sizes.length - 1, Math.max(0, Math.floor((event.clientX - rect.left) / columnWidth)));
    onSizeChange?.(sizes[index]);
  };

  return (
    <>
      <div
        style={{
          gridColumn,
          gridRow: variant === 'v4' ? '8 / 18' : '1 / 12',
          justifySelf: 'center',
          alignSelf: 'stretch',
          zIndex: 5,
          width: '100%',
          height: '100%',
          minWidth: 0,
          display: 'flex',
          alignItems: variant === 'v4' ? 'center' : 'flex-end',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </div>

      <EditableTextBox
        id={`${editableIdPrefix}-product-name-layout-v2`}
        initialText={productName}
        initialSettings={TDP_PRODUCT_NAME_SETTINGS}
        presetVersion={presetVersion}
        style={{ gridColumn, gridRow: variant === 'v4' ? '2 / 4' : '12 / 14', alignSelf: 'center', justifySelf: 'center', zIndex: 5, width: '100%', transform: variant === 'v4' ? 'translateY(-19px)' : undefined }}
      />
      <EditableTextBox
        id={`${editableIdPrefix}-product-description-layout-v2`}
        initialText={description}
        initialSettings={TDP_PRODUCT_DESCRIPTION_SETTINGS}
        presetVersion={presetVersion}
        multiline
        style={{ gridColumn, gridRow: variant === 'v4' ? '3 / 8' : '13 / 18', zIndex: 5, width: '100%', height: '100%', transform: variant === 'v4' ? 'translateY(-19px)' : undefined }}
      />

      <div style={priceCartStyle}>
        <div style={{ gridColumn: '2 / 3', position: 'relative', alignSelf: 'center', justifySelf: 'center', width: '95px', height: '100%', overflow: 'visible', zIndex: 1 }}>
          <EditableTextBox
            id={`${editableIdPrefix}-price-centered-v2`}
            initialText={price}
            initialSettings={TDP_PRICE_SETTINGS}
            presetVersion={presetVersion}
            style={{ width: '100%', height: '100%', whiteSpace: 'nowrap', zIndex: 1 }}
          />
        </div>
        <div className="col-start-4 flex items-center justify-center" style={{ zIndex: 1, transform: 'translateY(-2.5px)' }}>
          <button type="button" onClick={onAddToCart} aria-label="Afegir al cistell" className="relative flex items-center justify-center bg-transparent p-0 transition-transform duration-200 active:scale-95" style={{ width: '36.1984px', height: '36.1984px' }}>
            <img src={getTdpCartIconSrc(cartCount)} alt="" aria-hidden="true" draggable="false" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
          </button>
        </div>
      </div>

      <div style={{ ...buttonGroupStyle, isolation: 'isolate' }}>
        {sizes.map((size) => (
          <div key={`pauta-size-${copyMode ? 'copy-' : ''}${size}`} className="h-full overflow-visible">
            <button
              onClick={() => onSizeChange?.(size)}
              className={`relative flex h-full w-full items-center justify-center overflow-visible transition-all duration-200 active:scale-95 ${selectedSize === size ? 'bg-[#475059] text-whiteStrong' : 'bg-muted text-[#475059] hover:text-muted-foreground'}`}
              style={{
                borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
                fontFamily: `${sizeButtonTextSettings.fontFamily}, sans-serif`,
                fontSize: `${sizeButtonTextSettings.fontSize}pt`,
                fontWeight: selectedSize === size ? sizeButtonTextSettings.selectedFontWeight : sizeButtonTextSettings.fontWeight,
                letterSpacing: `${sizeButtonTextSettings.letterSpacing}em`,
                height: '100%',
                lineHeight: sizeButtonTextSettings.lineHeight,
              }}
            >
              {size}
            </button>
          </div>
        ))}
        <EditableTextBox
          id={`${editableIdPrefix}-size-buttons-text-grid-v2`}
          initialText={sizes.join(' ')}
          columns={sizes}
          selectedColumn={selectedSize}
          onColumnSelect={onSizeChange}
          renderText={false}
          renderHandle={!copyMode}
          onSettingsChange={setSizeButtonTextSettings}
          onClick={handleSizeFromEvent}
          onDoubleClick={handleSizeFromEvent}
          initialSettings={TDP_SIZE_BUTTON_TEXT_SETTINGS}
          presetVersion={presetVersion}
          style={{ position: 'absolute', inset: 0, zIndex: 10, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      </div>
    </>
  );
}

export default TdpConstructorProduct;
