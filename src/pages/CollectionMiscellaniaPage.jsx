import CollectionVerticalPage from '@/pages/CollectionVerticalPage';

/**
 * Pagina de la colleccio MISCEL·LÀNIA (vista vertical).
 *
 * Els parametres d'aquesta colleccio son a `config/collectionVertical.js`; el
 * component unic es `CollectionVerticalPage`. Aquest fitxer es l'unic punt
 * d'entrada de la ruta `/miscellania`.
 */
export default function CollectionMiscellaniaPage() {
  return <CollectionVerticalPage slug="miscellania" />;
}
