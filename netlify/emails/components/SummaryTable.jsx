import React from 'react';
function formatPrice(n) {
  return `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`;
}

export function SummaryTable({ order }) {
  // El subtotal que desa la comanda és la base imposable: el preu de la peça
  // sense transport i sense IVA. Les tres xifres sumen el total.
  const subtotalNum = order.subtotal != null
    ? Number(order.subtotal)
    : (Number(order.total) || 0) - (Number(order.shipping_cost) || 0) - (Number(order.iva) || 0);
  const subtotal = formatPrice(subtotalNum);
  const shipping = formatPrice(order.shipping_cost || 0);
  const iva = formatPrice(order.iva || 0);
  const total = formatPrice(order.total || 0);

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border="0"
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '37px',
      }}
    >
      <tbody>
        <tr>
          <td colSpan="2" style={{ borderTop: '1px solid #141414', padding: 0 }} />
        </tr>
        <tr>
          <td style={{ padding: '10px 0 4px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414' }}>
            Subtotal
          </td>
          <td style={{ padding: '10px 0 4px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414', textAlign: 'right' }}>
            {subtotal}
          </td>
        </tr>
        <tr>
          <td style={{ padding: '0 0 4px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414' }}>
            Transport
          </td>
          <td style={{ padding: '0 0 4px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414', textAlign: 'right' }}>
            {Number(order.shipping_cost) > 0 ? shipping : 'Gratuït'}
          </td>
        </tr>
        <tr>
          <td style={{ padding: '0 0 4px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414' }}>
            IVA 21%
          </td>
          <td style={{ padding: '0 0 4px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414', textAlign: 'right' }}>
            {iva}
          </td>
        </tr>
        <tr>
          <td colSpan="2" style={{ borderTop: '1px solid #141414', padding: 0 }} />
        </tr>
        <tr>
          <td style={{ padding: '0 0 4px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '15px', fontWeight: 700, color: '#141414' }}>
            <div style={{ marginTop: '2px' }}>TOT PLEGAT FA</div>
          </td>
          <td style={{ padding: '0 0 4px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '15px', fontWeight: 700, color: '#141414', textAlign: 'right' }}>
            <div style={{ marginTop: '2px' }}>{total}</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}