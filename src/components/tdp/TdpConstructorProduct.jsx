import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  fontSize: 12,
  fontWeight: 300,
  selectedFontWeight: 400,
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
  priceTranslateY = '0px',
  imageBorder,
  imageWidth = 'auto',
  imageMaxHeight = '100%',
  imageScale = 1,
  collectionHref,
  productHref,
  editable = true,
  overlaySrc,
  overlayAlt = '',
  overlayEnabled = true,
  overlayScale = 0.345,
  overlayTranslateX = '0%',
  overlayTranslateY = '-9%',
  overlayOpacity = 1,
  hoverImages,
  hoverIntervalMs = 700,
}) {
  const [sizeButtonTextSettings, setSizeButtonTextSettings] = useState(TDP_SIZE_BUTTON_TEXT_SETTINGS);
  const [cartSizeSettings, setCartSizeSettings] = useState(TDP_CART_SIZE_SETTINGS);
  const [nameHovered, setNameHovered] = useState(false);
  const columnCount = sizes.length;

  // Carrusel de variants en hover: mentre el cursor és sobre la imatge, va
  // rotant per `hoverImages`. En sortir, torna a la imatge original.
  const variantImages = Array.isArray(hoverImages) ? hoverImages.filter(Boolean) : [];
  const canCarousel = variantImages.length > 1;
  const [variantIdx, setVariantIdx] = useState(0);
  const carouselTimer = useRef(null);
  const stopCarousel = () => {
    if (carouselTimer.current) {
      clearInterval(carouselTimer.current);
      carouselTimer.current = null;
    }
    setVariantIdx(0);
  };
  const startCarousel = () => {
    if (!canCarousel || carouselTimer.current) return;
    carouselTimer.current = setInterval(() => {
      setVariantIdx((i) => (i + 1) % variantImages.length);
    }, hoverIntervalMs);
  };
  useEffect(() => stopCarousel, []); // eslint-disable-line react-hooks/exhaustive-deps
  const shownImageSrc = canCarousel ? variantImages[variantIdx] : imageSrc;
  // Enllaç dels elements clicables de la fitxa (imatge + nom): prioritza la
  // pàgina de producte (productHref) i, si no n'hi ha, cau a la col·lecció.
  const linkHref = productHref || collectionHref;
  const priceCartStyle = {
    gridColumn,
    gridRow: variant === 'v4' ? `${18 + rowOffset} / ${19 + rowOffset}` : `${19 + rowOffset} / ${20 + rowOffset}`,
    alignSelf: 'stretch',
    justifySelf: 'center',
    pointerEvents: 'auto',
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    columnGap: '5px',
    width: '75%',
    height: '100%',
    transform: `translateY(calc(-50% - 1.5px + ${priceTranslateY} + ${variant === 'v4' ? '10px' : '0px'}))`,
    zIndex: 3,
  };
  const buttonGroupStyle = {
    gridColumn,
    gridRow: sizeButtonsGridRow ?? (variant === 'v4' ? `${19 + rowOffset} / ${20 + rowOffset}` : `${20 + rowOffset} / ${21 + rowOffset}`),
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
    transform: variant === 'v4' ? 'translateY(10px)' : undefined,
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
        onMouseEnter={canCarousel ? startCarousel : undefined}
        onMouseLeave={canCarousel ? stopCarousel : undefined}
        style={{
          gridColumn,
          gridRow: imageGridRow ?? (variant === 'v4' ? `${8 + rowOffset} / ${18 + rowOffset}` : `${1 + rowOffset} / ${12 + rowOffset}`),
          justifySelf: 'stretch',
          alignSelf: 'stretch',
          zIndex: 5,
          width: variant === 'v4' ? 'calc(100% + 11px)' : '100%',
          minWidth: variant === 'v4' ? 'calc(100% + 11px)' : '100%',
          maxWidth: variant === 'v4' ? 'calc(100% + 11px)' : '100%',
          height: variant === 'v4' ? 'auto' : '100%',
          display: variant === 'v4' ? 'block' : 'flex',
          textAlign: 'center',
          alignItems: variant === 'v4' ? 'center' : 'flex-end',
          justifyContent: 'center',
          overflow: 'visible',
          transform: imageTranslateY === '0px' && imageNameTranslateY === '0px' ? undefined : `translateY(calc(${imageTranslateY} + ${imageNameTranslateY}))`,
          padding: 0,
          margin: variant === 'v4' ? '0 -5.5px' : 0,
          position: 'relative',
        }}
      >
        {linkHref ? (
          <Link to={linkHref} target="_blank" rel="noopener noreferrer" style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
            <img
              src={shownImageSrc}
              alt={imageAlt}
              style={{
                display: 'block',
                width: variant === 'v4' ? '100%' : imageWidth,
                minWidth: variant === 'v4' ? '100%' : undefined,
                maxWidth: '100%',
                maxHeight: variant === 'v4' ? 'none' : imageMaxHeight,
                height: 'auto',
                objectFit: (imageWidth === '100%' || variant === 'v4') ? undefined : 'contain',
                border: imageBorder,
                transform: [
                  variant === 'v4' ? 'translateX(0.5px) translateY(3px)' : '',
                  imageScale !== 1 ? `scale(${imageScale})` : ''
                ].filter(Boolean).join(' ') || undefined,
                flexShrink: 0,
                padding: 0,
                margin: '0 auto',
              }}
            />
          </Link>
        ) : (
          <img
            src={shownImageSrc}
            alt={imageAlt}
            style={{
              display: 'block',
              width: variant === 'v4' ? '100%' : imageWidth,
              minWidth: variant === 'v4' ? '100%' : undefined,
              maxWidth: '100%',
              maxHeight: variant === 'v4' ? 'none' : imageMaxHeight,
              height: 'auto',
              objectFit: (imageWidth === '100%' || variant === 'v4') ? undefined : 'contain',
              border: imageBorder,
              transform: [
                variant === 'v4' ? 'translateX(0.5px) translateY(3px)' : '',
                imageScale !== 1 ? `scale(${imageScale})` : ''
              ].filter(Boolean).join(' ') || undefined,
              flexShrink: 0,
              padding: 0,
              margin: '0 auto',
            }}
          />
        )}

        {overlayEnabled && overlaySrc ? (
          <img
            src={encodeURI(overlaySrc)}
            alt={overlayAlt}
            aria-hidden={overlayAlt ? undefined : 'true'}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none',
              opacity: overlayOpacity,
              transform: `translateX(0.5px) translateY(3px) translate(${overlayTranslateX}, ${overlayTranslateY}) scale(${overlayScale})`,
              transformOrigin: 'center center',
              zIndex: 1,
            }}
            loading="eager"
            decoding="async"
          />
        ) : null}
      </div>

      <div
        style={{
          gridColumn,
          gridRow: productNameGridRow ?? (variant === 'v4' ? `${2 + rowOffset} / ${4 + rowOffset}` : `${12 + rowOffset} / ${14 + rowOffset}`),
          alignSelf: 'stretch',
          justifySelf: 'stretch',
          zIndex: 6,
          pointerEvents: 'auto',
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          transform: productNameTranslateY ? `translateY(calc(${productNameTranslateY} + ${imageNameTranslateY}))` : (imageNameTranslateY !== '0px' ? `translateY(${imageNameTranslateY})` : (variant === 'v4' ? 'translateY(-19px)' : undefined)),
        }}
      >
        {productNamePlain ? (
          linkHref ? (
            <Link
              to={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setNameHovered(true)}
              onMouseLeave={() => setNameHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                textDecoration: 'none',
                color: nameHovered ? '#111827' : TDP_PRODUCT_NAME_SETTINGS.color,
                transition: 'color 200ms',
                fontFamily: `${TDP_PRODUCT_NAME_SETTINGS.fontFamily}, sans-serif`,
                fontSize: `${TDP_PRODUCT_NAME_SETTINGS.fontSize}pt`,
                fontWeight: TDP_PRODUCT_NAME_SETTINGS.fontWeight,
                letterSpacing: `${TDP_PRODUCT_NAME_SETTINGS.letterSpacing}em`,
                lineHeight: TDP_PRODUCT_NAME_SETTINGS.lineHeight,
                textAlign: 'center',
                textTransform: TDP_PRODUCT_NAME_SETTINGS.textTransform,
                whiteSpace: 'nowrap',
                position: 'relative',
                zIndex: 6,
              }}
            >
              {productName}
            </Link>
          ) : (
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
          )
        ) : collectionHref ? (
          <Link to={collectionHref} target="_blank" rel="noopener noreferrer" style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
            <EditableTextBox
              id={`${editableIdPrefix}-product-name-layout-v2`}
              initialText={productName}
              initialSettings={TDP_PRODUCT_NAME_SETTINGS}
              presetVersion={presetVersion}
              renderHandle={!copyMode}
              handleRight="-18px"
              style={{ width: '100%', height: '100%', zIndex: 5, pointerEvents: 'auto' }}
            />
          </Link>
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
      {editable ? (
        <EditableTextBox
          id={`${editableIdPrefix}-product-description-layout-v2`}
          initialText={description}
          initialSettings={{
            ...TDP_PRODUCT_DESCRIPTION_SETTINGS,
            y: presetVersion === 'tdp-home-v4-clean' ? 0 : TDP_PRODUCT_DESCRIPTION_SETTINGS.y,
            lineHeight: presetVersion === 'tdp-home-v4-clean' ? 1.5 : TDP_PRODUCT_DESCRIPTION_SETTINGS.lineHeight,
            fontSize: descriptionFontSize ?? TDP_PRODUCT_DESCRIPTION_SETTINGS.fontSize,
          }}
          presetVersion={presetVersion}
          multiline
          renderHandle={!copyMode}
          handleRight="-18px"
          style={{ gridColumn, gridRow: descriptionGridRow ?? (variant === 'v4' ? `${3 + rowOffset} / ${8 + rowOffset}` : `${13 + rowOffset} / ${18 + rowOffset}`), zIndex: 5, width: '100%', height: descriptionHeight ?? '100%', transform: descriptionTranslateY ? `translateY(calc(${descriptionTranslateY} + ${variant === 'v4' ? '2px' : '0px'}))` : (variant === 'v4' ? 'translateY(-17px)' : undefined) }}
        />
      ) : (
        <div
          style={{
            gridColumn,
            gridRow: descriptionGridRow ?? `${13 + rowOffset} / ${18 + rowOffset}`,
            zIndex: 5,
            width: '100%',
            height: descriptionHeight ?? '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden',
            transform: descriptionTranslateY ? `translateY(${descriptionTranslateY})` : undefined,
            color: TDP_PRODUCT_DESCRIPTION_SETTINGS.color,
            fontFamily: `${TDP_PRODUCT_DESCRIPTION_SETTINGS.fontFamily}, sans-serif`,
            fontSize: `${descriptionFontSize ?? TDP_PRODUCT_DESCRIPTION_SETTINGS.fontSize}pt`,
            fontWeight: TDP_PRODUCT_DESCRIPTION_SETTINGS.fontWeight,
            letterSpacing: `${TDP_PRODUCT_DESCRIPTION_SETTINGS.letterSpacing}em`,
            lineHeight: TDP_PRODUCT_DESCRIPTION_SETTINGS.lineHeight,
            textAlign: TDP_PRODUCT_DESCRIPTION_SETTINGS.textAlign,
            textTransform: TDP_PRODUCT_DESCRIPTION_SETTINGS.textTransform,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            paddingTop: `${TDP_PRODUCT_DESCRIPTION_SETTINGS.y}px`,
          }}
        >
          {description}
        </div>
      )}

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

      {editable && (
        <EditableTextBox
          id={`${editableIdPrefix}-price-centered-v2`}
          initialText={price}
          renderText={false}
          renderHandle={!copyMode}
          initialSettings={TDP_PRICE_SETTINGS}
          presetVersion={presetVersion}
          handleRight="-18px"
          style={{ gridColumn, gridRow: variant === 'v4' ? `${18 + rowOffset} / ${19 + rowOffset}` : `${19 + rowOffset} / ${20 + rowOffset}`, alignSelf: 'start', transform: `translateY(calc(-14px + ${priceTranslateY} + ${variant === 'v4' ? '10px' : '0px'}))`, zIndex: 10, pointerEvents: 'none' }}
        />
      )}

      {editable && (
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
          style={{ gridColumn, gridRow: variant === 'v4' ? `${18 + rowOffset} / ${19 + rowOffset}` : `${19 + rowOffset} / ${20 + rowOffset}`, transform: variant === 'v4' ? 'translateY(10px)' : undefined, zIndex: 10, pointerEvents: 'none' }}
        />
      )}

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

      {editable && (
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
          style={{ gridColumn, gridRow: sizeButtonsGridRow ?? (variant === 'v4' ? `${19 + rowOffset} / ${20 + rowOffset}` : `${20 + rowOffset} / ${21 + rowOffset}`), transform: variant === 'v4' ? 'translateY(10px)' : undefined, zIndex: 10, pointerEvents: 'none' }}
        />
      )}
    </>
  );
}

export default TdpConstructorProduct;
