import CollectionProductCard from '@/components/tdp/CollectionProductCard';

// Targeta de col·lecció v5: parteix de v4 (CollectionProductCard) i sobreescriu
// el layout vertical perquè la imatge quedi al fons del slot i el bloc
// nom/descripció es desplaci cap amunt.
//
// Calibratge: independent per defecte (cada instància hauria de rebre un
// `editableIdPrefix` propi). Si vols compartir el calibratge entre v4 i v5,
// passa el mateix `editableIdPrefix` que usa v4.
function CollectionProductCardV5(props) {
  return (
    <CollectionProductCard
      {...props}
      imageTranslateY={props.imageTranslateY ?? 'calc(9px + 1lh + 159px)'}
      productNameTranslateY={props.productNameTranslateY ?? 'calc(1lh - 325px)'}
      descriptionTranslateY={props.descriptionTranslateY ?? 'calc(2lh - 1px - 325px)'}
    />
  );
}

export default CollectionProductCardV5;
