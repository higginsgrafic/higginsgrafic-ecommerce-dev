import React from 'react';
import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout.jsx';

export function InvoiceAvailableEmail({ invoice = {} }) {
  return (
    <EmailLayout
      statusText="Document fiscal"
      labelText={invoice.document_kind === 'rectification' ? 'FACTURA RECTIFICATIVA' : 'FACTURA DISPONIBLE'}
      clientName={invoice.customer_name || 'Client'}
      messageContent={<span>Ja pots consultar i desar la factura {invoice.number || ''}.</span>}
      showCta={false}
    >
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link
          href={invoice.invoice_link}
          style={{
            display: 'inline-block', padding: '12px 24px', backgroundColor: '#141414',
            color: '#FFFFFF', textDecoration: 'none',
            fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
            fontSize: '11pt', fontWeight: 500, borderRadius: '6px',
          }}
        >
          Veure la factura →
        </Link>
      </div>
    </EmailLayout>
  );
}

export const invoiceAvailableMeta = {
  subject: (invoice) => `${invoice?.document_kind === 'rectification' ? 'Factura rectificativa' : 'Factura'} ${invoice?.number || ''}`,
};
