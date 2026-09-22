import CollectionVerticalPage from '@/pages/CollectionVerticalPage';

/**
 * Pagina de la colleccio CUBE (vista vertical).
 *
 * Els parametres d'aquesta colleccio son a `config/collectionVertical.js`; el
 * component unic es `CollectionVerticalPage`. Aquest fitxer es l'unic punt
 * d'entrada de la ruta `/cube`.
 */
export default function CollectionCubePage() {
  return <CollectionVerticalPage slug="cube" />;
}
