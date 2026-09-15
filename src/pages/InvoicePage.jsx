import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import InvoiceSheet, { eur, liniesDelDocument, reparteixTransport, r2 } from '@/components/invoice/InvoiceSheet';

/**
 * Factura d'una comanda, en una pàgina pròpia i imprimible.
 *
 * S'obre amb el testimoni d'accés que el client rep per correu, sense haver
 * d'entrar a cap compte. Les dades són les que es van desar el dia de
 * l'emissió: si avui canvia una adreça o un preu, la factura no es mou.
 *
 * Es pot imprimir o desar en PDF amb la impressió del navegador (Cmd+P).
 *
 * El full en si —el disseny— viu a `components/invoice/InvoiceSheet`, perquè
 * l'editor d'administració en pugui fer servir el mateix i no n'hi hagi dues
 * versions que divergeixin. Aquí només hi ha la feina de la pàgina: carregar la
 * factura pel testimoni i envoltar el full amb el botó d'imprimir.
 */

// Es torna a exportar perquè els tests i qui ho necessiti el trobin aquí.
export { reparteixTransport };

export default function InvoicePage() {
  const { token } = useParams();
  const [estat, setEstat] = useState('carregant');
  const [factura, setFactura] = useState(null);

  useEffect(() => {
    let viu = true;
    fetch(`/api/get-invoice?token=${encodeURIComponent(token || '')}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (viu) { setFactura(d.invoice); setEstat('ok'); } })
      .catch(() => { if (viu) setEstat('error'); });
    return () => { viu = false; };
  }, [token]);

  const linies = useMemo(() => (factura ? liniesDelDocument(factura) : []), [factura]);

  if (estat === 'carregant') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregant la factura…</div>;
  }
  if (estat === 'error' || !factura) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="font-oswald text-2xl tracking-wide">FACTURA NO TROBADA</div>
        <p className="text-gray-500 max-w-md">
          Aquest enllaç no correspon a cap factura. Comprova que l&apos;hagis copiat sencer.
        </p>
      </div>
    );
  }

  const sumaBases = r2(linies.reduce((a, l) => a + l.baseProducte, 0));
  const ajustCentims = Math.abs(sumaBases - r2(factura.base_products)) > 0.02
    ? `Les línies no quadren exactament amb la base desada (${eur(sumaBases)} vs ${eur(factura.base_products)}).`
    : null;

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      <InvoiceSheet
        doc={factura}
        numero={factura.number || '—'}
        blocClient="sencer"
        linies={linies}
        ajustCentims={ajustCentims}
        isTest={factura.is_test === true}
      />

      {/* Botó d'imprimir, que no surt al paper */}
      <div className="mx-auto mt-4 print:hidden" style={{ width: '210mm' }}>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full py-3 bg-gray-900 text-white font-oswald tracking-[0.12em] uppercase text-sm hover:bg-black transition-colors"
        >
          Imprimir o desar en PDF
        </button>
      </div>
    </div>
  );
}
