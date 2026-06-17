import TdpConstructorProduct from '@/components/tdp/TdpConstructorProduct';

function CollectionProductCard({
  gridColumn,
  rowOffset = 10,
  slotGridRow,
  productName,
  description,
  price,
  imageSrc,
  imageAlt,
  sizes,
  selectedSize,
  onSizeChange,
  cartCount = 0,
  onAddToCart,
  editableIdPrefix,
  presetVersion,
  imageGridRow,
  imageTranslateY = 'calc(9px + 1lh)',
  productNameTranslateY = '1lh',
  descriptionTranslateY = 'calc(2lh - 1px)',
  collectionHref,
  productNamePlain = false,
  editable = true,
  cardBackground = '#fbfcfd',
  hoverImages,
}) {
  const resolvedSlotGridRow = slotGridRow ?? `${6 + rowOffset} / ${21 + rowOffset}`;
  const descriptionGridRow = `${13 + rowOffset} / ${18 + rowOffset}`;
  const sizeButtonsGridRow = `${20 + rowOffset} / ${21 + rowOffset}`;
  return (
    <>
      <div
        aria-label="TDP rectangle"
        style={{
          gridColumn,
          gridRow: resolvedSlotGridRow,
          position: 'relative',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 'calc(-100% / 15)',
            bottom: 'calc(-100% / 15)',
            backgroundColor: cardBackground,
          }}
        />
      </div>
      <TdpConstructorProduct
        gridColumn={gridColumn}
        rowOffset={rowOffset}
        productName={productName}
        description={description}
        price={price}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        hoverImages={hoverImages}
        imageGridRow={imageGridRow}
        imageTranslateY={imageTranslateY}
        sizes={sizes}
        selectedSize={selectedSize}
        onSizeChange={onSizeChange}
        cartCount={cartCount}
        onAddToCart={onAddToCart}
        imageNameTranslateY="calc(6px + 2lh)"
        productNameTranslateY={productNameTranslateY}
        descriptionGridRow={descriptionGridRow}
        descriptionHeight="calc(100% - 3px)"
        collectionHref={collectionHref}
        productNamePlain={productNamePlain}
        editable={editable}
        sizeButtonsGridRow={sizeButtonsGridRow}
        sizeButtonsHeight="100%"
        sizeButtonsMarginTop="0px"
        sizeButtonsAlignSelf="center"
        editableIdPrefix={editableIdPrefix}
        presetVersion={presetVersion}
        descriptionFontSize={12}
        descriptionTranslateY={descriptionTranslateY}
      />
    </>
  );
}

export default CollectionProductCard;
