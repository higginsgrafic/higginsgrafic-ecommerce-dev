import { useState } from 'react';
import EditableTextBox from '@/components/dev/EditableTextBox';

const TDP_TEXT_PRESET_VERSION = 'tdp-layout-2026-05-14-0516';

const TDP_PRODUCT_NAME_SETTINGS = {
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

const TDP_PRODUCT_DESCRIPTION_SETTINGS = {
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

const TDP_PRICE_SETTINGS = {
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

const TDP_SIZE_BUTTON_TEXT_SETTINGS = {
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

const TDP_CART_SIZE_SETTINGS = {
  x: 0,
  y: 0,
  fontFamily: 'Oswald',
  fontSize: 34.1984,
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
  rowOffset = 0,
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
  descriptionFontSize,
  imageGridRow,
  imageTranslateY = '0px',
  productNameGridRow,
  productNameTranslateY,
  imageNameTranslateY = '0px',
  descriptionGridRow,
  descriptionHeight,
  descriptionTranslateY,
  sizeButtonsGridRow,
  sizeButtonsHeight,
  sizeButtonsMarginTop,
  sizeButtonsAlignSelf,
  productNamePlain = false,
}) {
  const [sizeButtonTextSettings, setSizeButtonTextSettings] = useState(TDP_SIZE_BUTTON_TEXT_SETTINGS);
  const [cartSizeSettings, setCartSizeSettings] = useState(TDP_CART_SIZE_SETTINGS);
  const columnCount = sizes.length;
  const priceCartStyle = {
    gridColumn,
    gridRow: `${19 + rowOffset} / ${20 + rowOffset}`,
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
    gridRow: sizeButtonsGridRow ?? `${20 + rowOffset} / ${21 + rowOffset}`,
    alignSelf: sizeButtonsAlignSelf ?? 'stretch',
    justifySelf: 'center',
    pointerEvents: 'auto',
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    columnGap: '5px',
    width: '75%',
    height: sizeButtonsHeight ?? `calc(100% + ${gutterY} + ${gutterY})`,
    marginTop: sizeButtonsMarginTop ?? `calc(-1 * ${gutterY})`,
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
          gridRow: imageGridRow ?? (variant === 'v4' ? `${8 + rowOffset} / ${18 + rowOffset}` : `${1 + rowOffset} / ${12 + rowOffset}`),
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
          transform: imageTranslateY === '0px' && imageNameTranslateY === '0px' ? undefined : `translateY(calc(${imageTranslateY} + ${imageNameTranslateY}))`,
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

      <div
        style={{
          gridColumn,
          gridRow: productNameGridRow ?? (variant === 'v4' ? `${2 + rowOffset} / ${4 + rowOffset}` : `${12 + rowOffset} / ${14 + rowOffset}`),
          alignSelf: 'stretch',
          justifySelf: 'stretch',
          zIndex: 5,
          pointerEvents: 'auto',
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          transform: productNameTranslateY ? `translateY(calc(${productNameTranslateY} + ${imageNameTranslateY}))` : (imageNameTranslateY !== '0px' ? `translateY(${imageNameTranslateY})` : (variant === 'v4' ? 'translateY(-19px)' : undefined)),
        }}
      >
        {productNamePlain ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: TDP_PRODUCT_NAME_SETTINGS.color,
              fontFamily: `${TDP_PRODUCT_NAME_SETTINGS.fontFamily}, sans-serif`,
              fontSize: `${TDP_PRODUCT_NAME_SETTINGS.fontSize}pt`,
              fontWeight: TDP_PRODUCT_NAME_SETTINGS.fontWeight,
              letterSpacing: `${TDP_PRODUCT_NAME_SETTINGS.letterSpacing}em`,
              lineHeight: TDP_PRODUCT_NAME_SETTINGS.lineHeight,
              textAlign: 'center',
              textTransform: TDP_PRODUCT_NAME_SETTINGS.textTransform,
              whiteSpace: 'nowrap',
            }}
          >
            {productName}
          </div>
        ) : (
          <EditableTextBox
            id={`${editableIdPrefix}-product-name-layout-v2`}
            initialText={productName}
            initialSettings={TDP_PRODUCT_NAME_SETTINGS}
            presetVersion={presetVersion}
            renderHandle={!copyMode}
            handleRight="-18px"
            style={{ width: '100%', height: '100%', zIndex: 5, pointerEvents: 'auto' }}
          />
        )}
      </div>
      <EditableTextBox
        id={`${editableIdPrefix}-product-description-layout-v2`}
        initialText={description}
        initialSettings={{
          ...TDP_PRODUCT_DESCRIPTION_SETTINGS,
          fontSize: descriptionFontSize ?? TDP_PRODUCT_DESCRIPTION_SETTINGS.fontSize,
        }}
        presetVersion={presetVersion}
        multiline
        renderHandle={!copyMode}
        handleRight="-18px"
        style={{ gridColumn, gridRow: descriptionGridRow ?? (variant === 'v4' ? `${3 + rowOffset} / ${8 + rowOffset}` : `${13 + rowOffset} / ${18 + rowOffset}`), zIndex: 5, width: '100%', height: descriptionHeight ?? '100%', transform: descriptionTranslateY ? `translateY(${descriptionTranslateY})` : (variant === 'v4' ? 'translateY(-19px)' : undefined) }}
      />

      <div style={priceCartStyle}>
        <div style={{ gridColumn: '2 / 3', position: 'relative', alignSelf: 'center', justifySelf: 'center', width: '95px', height: '100%', overflow: 'visible', zIndex: 1 }}>
          <EditableTextBox
            id={`${editableIdPrefix}-price-centered-v2`}
            initialText={price}
            initialSettings={TDP_PRICE_SETTINGS}
            presetVersion={presetVersion}
            renderHandle={false}
            style={{ width: '100%', height: '100%', whiteSpace: 'nowrap', zIndex: 1 }}
          />
        </div>
        <div className="col-start-4 flex items-center justify-center" style={{ position: 'relative', zIndex: 1, transform: 'translateY(-1.5px)' }}>
          <button type="button" onClick={onAddToCart} aria-label="Afegir al cistell" className="relative flex items-center justify-center bg-transparent p-0 transition-transform duration-200 active:scale-95" style={{ width: `${cartSizeSettings.fontSize}px`, height: `${cartSizeSettings.fontSize}px` }}>
            <img src={getTdpCartIconSrc(cartCount)} alt="" aria-hidden="true" draggable="false" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
          </button>
        </div>
      </div>

      <EditableTextBox
        id={`${editableIdPrefix}-price-centered-v2`}
        initialText={price}
        renderText={false}
        renderHandle={!copyMode}
        initialSettings={TDP_PRICE_SETTINGS}
        presetVersion={presetVersion}
        handleRight="-18px"
        style={{ gridColumn, gridRow: `${19 + rowOffset} / ${20 + rowOffset}`, alignSelf: 'start', transform: 'translateY(-14px)', zIndex: 10, pointerEvents: 'none' }}
      />

      <EditableTextBox
        id={`${editableIdPrefix}-cart-size-handle-v1`}
        initialText=""
        renderText={false}
        renderHandle={!copyMode}
        onSettingsChange={setCartSizeSettings}
        initialSettings={TDP_CART_SIZE_SETTINGS}
        presetVersion={presetVersion}
        handleRight="-18px"
        editorPreview={(
          <img
            src={getTdpCartIconSrc(cartCount)}
            alt=""
            aria-hidden="true"
            draggable="false"
            style={{ width: `${cartSizeSettings.fontSize}px`, height: `${cartSizeSettings.fontSize}px`, objectFit: 'contain' }}
          />
        )}
        style={{ gridColumn, gridRow: `${19 + rowOffset} / ${20 + rowOffset}`, zIndex: 10, pointerEvents: 'none' }}
      />

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
      </div>

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
        handleRight="-18px"
        style={{ gridColumn, gridRow: sizeButtonsGridRow ?? `${20 + rowOffset} / ${21 + rowOffset}`, zIndex: 10, pointerEvents: 'none' }}
      />
    </>
  );
}

export default TdpConstructorProduct;
