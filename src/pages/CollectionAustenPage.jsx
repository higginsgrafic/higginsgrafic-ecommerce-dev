import CollectionVerticalPage from '@/pages/CollectionVerticalPage';

/**
 * Pagina de la colleccio AUSTEN (vista vertical).
 *
 * Els parametres d'aquesta colleccio son a `config/collectionVertical.js`; el
 * component unic es `CollectionVerticalPage`. Aquest fitxer es l'unic punt
 * d'entrada de la ruta `/austen`.
 */
export default function CollectionAustenPage() {
  return <CollectionVerticalPage slug="austen" />;
}
