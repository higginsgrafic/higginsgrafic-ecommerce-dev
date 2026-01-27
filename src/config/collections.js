export const COLLECTIONS = {
  'first-contact': {
    collectionSlug: 'first-contact',
    textsKey: 'firstContact',
    breadcrumbLabel: 'First Contact',
    useFullBleedUnderHeader: true,
    headerClassName: 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-16 lg:py-24',
    productSlugs: [
      'first-contact-nx-01',
      'first-contact-ncc-1701',
      'first-contact-ncc-1701-d',
      'first-contact-wormhole',
      'first-contact-plasma-escape',
      'first-contact-vulcans-end',
      'first-contact-the-phoenix'
    ],
    bodyText: "First Contact és una celebració de la curiositat humana i l'exploració de l'univers desconegut. Aquesta col·lecció captura l'esperit d'aventura que ens impulsa a buscar noves fronteres, a qüestionar el que sabem i a somiar amb el que encara està per descobrir. Inspirada en la ciència-ficció i els viatges espacials, cada disseny explora temes de descobriment, contacte amb el desconegut i la recerca de respostes a les grans preguntes de l'existència. És per a qui mira cap a les estrelles amb esperança."
  },

  'proves': {
    collectionSlug: 'proves',
    textsKey: 'proves',
    breadcrumbLabel: 'Proves',
    useFullBleedUnderHeader: true,
    headerClassName: 'bg-gradient-to-br from-gray-900 via-neutral-900 to-gray-900 text-white py-16 lg:py-24',
    productSlugs: [
      'proves-the-phoenix'
    ],
    bodyText: 'Col·lecció de proves per validar el flux de productes i la nova estructura canònica de mockups.'
  },

  'outcasted': {
    collectionSlug: 'outcasted',
    textsKey: 'outcasted',
    breadcrumbLabel: 'Outcasted',
    useFullBleedUnderHeader: true,
    headerClassName: 'bg-gradient-to-br from-gray-900 via-stone-900 to-neutral-900 text-white py-16 lg:py-24',
    // TODO: fill with the real curated Outcasted product slugs.
    // Until then, CollectionPage will fall back to getProductsByCollection('outcasted') in DEV.
    productSlugs: [],
    bodyText: "Outcasted celebra la individualitat i l'autonomia. Per a qui no necessita l'aprovació dels altres per sentir-se complet. Aquesta col·lecció és un homenatge a qui tria el seu propi camí, encara que això signifiqui caminar sol. Inspirada en els que desafien les normes i rebutgen el conformisme, cada peça és una declaració d'independència. És per a qui entén que la solitud pot ser una forma de llibertat, no un càstig. Per a esperits lliures i independents."
  },
};

export const getCollectionConfig = (key) => {
  if (!key) return null;
  const k = key.toString().trim();
  return COLLECTIONS[k] || null;
};
