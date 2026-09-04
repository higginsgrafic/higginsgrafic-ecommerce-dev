// =============================================================================
//  useCollectionCardLayout — Posicionament centralitzat de targetes TDP
// =============================================================================
//
//  Tota la lògica de translateY (image, productName, description) per a les
//  targetes de col·lecció està centralitzada aquí. Les 5 pàgines de
//  col·lecció criden aquesta funció amb (colIdx, isPortraitTablet,
//  isLandscapeTablet) i reben els tres valors de translateY.
//
//  Per ajustar el posicionament, només cal modificar aquest fitxer.
//
//  Valors actuals:
//    - Portrait tablet: cols 0/2 pugen (lift), col 1 baixa (lower)
//    - Landscape tablet: cols 0/2 pugen (lift), col 1 baixa (lower) + lift extra
//    - Desktop: sense offsets
//

export function useCollectionCardLayout({ isPortraitTablet, isLandscapeTablet }) {
  return function getCardLayout(colIdx) {
    const tabletLayout = isLandscapeTablet || isPortraitTablet;

    // --- Portrait tablet ---
    const portraitFirstColumnLift = isPortraitTablet && (colIdx === 0 || colIdx === 2) ? 20 : 0;
    const portraitFirstColumnImageNameLift = isPortraitTablet && (colIdx === 0 || colIdx === 2) ? ' - 10px' : '';
    const portraitSecondColumnImageLift = isPortraitTablet && colIdx === 1 ? ' - 10px' : '';
    const portraitSecondColumnDescriptionDrop = isPortraitTablet && colIdx === 1 ? ' + 10px' : '';

    // --- Landscape tablet ---
    const landscapeCol2Lift = isLandscapeTablet && colIdx === 1 ? ' - 40px' : '';
    const landscapeCol2DescriptionLift = isLandscapeTablet && colIdx === 1 ? ' - 60px' : '';

    // --- Comú tablet ---
    const liftCols = tabletLayout && (colIdx === 0 || colIdx === 2);
    const liftOffset = liftCols ? ` - ${30 + portraitFirstColumnLift}px` : '';
    const productNameLiftOffset = liftCols ? ` - ${40 + portraitFirstColumnLift}px` : '';
    const lowerCols = tabletLayout && (colIdx === 1 || colIdx === 3);
    const lowerOffset = lowerCols ? ' + 15px' : '';
    const imageLowerOffset = lowerCols ? ' - 30px' : '';
    const descriptionExtraOffset = tabletLayout ? ' + 5px' : '';
    const globalLiftOffset = tabletLayout ? ' + 10px' : '';

    // --- Translates finals ---
    const imageTranslateY = liftCols
      ? `calc(9px + 1lh${liftOffset}${globalLiftOffset}${portraitFirstColumnImageNameLift})`
      : lowerCols
        ? `calc(9px + 1lh + 159px${imageLowerOffset}${globalLiftOffset}${portraitSecondColumnImageLift})`
        : isLandscapeTablet
          ? `calc(9px + 1lh${globalLiftOffset})`
          : undefined;

    const productNameTranslateY = liftCols
      ? `calc(1lh${productNameLiftOffset}${globalLiftOffset}${portraitFirstColumnImageNameLift})`
      : lowerCols
        ? `calc(1lh - 325px${globalLiftOffset}${landscapeCol2Lift})`
        : isLandscapeTablet
          ? `calc(1lh${globalLiftOffset})`
          : undefined;

    const descriptionTranslateY = liftCols
      ? `calc(2lh - 1px${liftOffset}${descriptionExtraOffset}${globalLiftOffset})`
      : lowerCols
        ? `calc(2lh - 1px - 325px${lowerOffset}${descriptionExtraOffset}${globalLiftOffset}${portraitSecondColumnDescriptionDrop}${landscapeCol2DescriptionLift})`
        : isLandscapeTablet
          ? `calc(2lh - 1px${descriptionExtraOffset}${globalLiftOffset})`
          : undefined;

    return {
      imageTranslateY,
      productNameTranslateY,
      descriptionTranslateY,
    };
  };
}
