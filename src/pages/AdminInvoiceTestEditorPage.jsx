import InvoiceEditor from '@/components/admin/InvoiceEditor';

/**
 * L'editor de proves, en una pantalla pròpia i dedicada.
 *
 * PER QUÈ NO ÉS EL MATEIX EDITOR AMB UNA CASELLA
 *
 * Ho va demanar l'amo: «la diferència entre enviar una factura o no, poden ser
 * 3 cm. Cal una pantalla separada». En un editor compartit, desar un esborrany
 * i emetre una factura de debò queden a tocar, i un clic equivocat envia una
 * factura a un client.
 *
 * Aquí no es pot enviar res a ningú: la marca de prova impedeix que el correu
 * surti cap a un client (només va a TEST_EMAIL), i el número que s'hi assigna
 * és de la sèrie PROVA, que no toca mai les sèries FO/FS/FR.
 *
 * Els murs també són a la base de dades i al servidor, no només a la pantalla:
 * una errada de programació aquí no pot acabar amb una venda sense factura ni
 * amb un número fiscal gastat per una prova.
 */
export default function AdminInvoiceTestEditorPage() {
  return <InvoiceEditor mode="test" />;
}
