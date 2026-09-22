import CollectionVerticalPage from '@/pages/CollectionVerticalPage';

/**
 * Pagina de la colleccio FIRST CONTACT (vista vertical).
 *
 * Els parametres d'aquesta colleccio son a `config/collectionVertical.js`; el
 * component unic es `CollectionVerticalPage`. Aquest fitxer es l'unic punt
 * d'entrada de la ruta `/first-contact`.
 */
export default function CollectionFirstContactPage() {
  return <CollectionVerticalPage slug="first-contact" />;
}
