import InvoiceEditor from '@/components/admin/InvoiceEditor';

/**
 * L'editor de factures de debò.
 *
 * La pantalla germana, per a les proves, és `AdminInvoiceTestEditorPage`. Són
 * dues rutes separades a posta: en un editor que servís per a les dues coses,
 * la distància entre desar un esborrany i enviar una factura a un client serien
 * tres centímetres.
 */
export default function AdminInvoiceEditorPage() {
  return <InvoiceEditor mode="live" />;
}
