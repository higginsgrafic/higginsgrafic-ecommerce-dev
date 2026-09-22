import CollectionVerticalPage from '@/pages/CollectionVerticalPage';

/**
 * Pagina de la colleccio THE HUMAN INSIDE (vista vertical).
 *
 * Els parametres d'aquesta colleccio son a `config/collectionVertical.js`; el
 * component unic es `CollectionVerticalPage`. Aquest fitxer es l'unic punt
 * d'entrada de la ruta `/the-human-inside`.
 */
export default function CollectionTheHumanInsidePage() {
  return <CollectionVerticalPage slug="the-human-inside" />;
}
