import TdpConstructorProduct from '@/components/tdp/TdpConstructorProduct';

function CollectionProductCard({
  gridColumn,
  slotGridRow = '16 / 31',
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
}) {
  return (
    <>
      <div
        aria-label="TDP rectangle"
        style={{
          gridColumn,
          gridRow: slotGridRow,
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <TdpConstructorProduct
        gridColumn={gridColumn}
        rowOffset={10}
        productName={productName}
        description={description}
        price={price}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        imageTranslateY="calc(9px + 1lh)"
        sizes={sizes}
        selectedSize={selectedSize}
        onSizeChange={onSizeChange}
        cartCount={cartCount}
        onAddToCart={onAddToCart}
        imageNameTranslateY="calc(6px + 2lh)"
        productNameTranslateY="1lh"
        descriptionGridRow="23 / 28"
        descriptionHeight="calc(100% - 3px)"
        sizeButtonsGridRow="30 / 31"
        sizeButtonsHeight="100%"
        sizeButtonsMarginTop="0px"
        sizeButtonsAlignSelf="center"
        editableIdPrefix={editableIdPrefix}
        presetVersion={presetVersion}
        descriptionFontSize={12}
        descriptionTranslateY="calc(2lh - 1px)"
      />
    </>
  );
}

export default CollectionProductCard;
