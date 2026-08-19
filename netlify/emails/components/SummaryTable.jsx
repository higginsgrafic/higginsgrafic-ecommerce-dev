function formatPrice(n) {
  return `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`;
}

export function SummaryTable({ order }) {
  const subtotalNum =
    (Number(order.total) || 0) - (Number(order.shipping_cost) || 0) - (Number(order.iva) || 0);
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
        marginTop: '28px',
        borderTop: '1px solid #141414',
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: '6px 0 3px', fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontSize: '13px', color: '#141414' }}>Subtotal</td>
          <td style={{ padding: '6px 0 3px', fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontSize: '13px', color: '#141414', textAlign: 'right' }}>{subtotal}</td>
        </tr>
        <tr>
          <td style={{ padding: '3px 0', fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontSize: '13px', color: '#141414' }}>Transport</td>
          <td style={{ padding: '3px 0', fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontSize: '13px', color: '#141414', textAlign: 'right' }}>{shipping}</td>
        </tr>
        <tr>
          <td style={{ padding: '3px 0 6px', fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontSize: '13px', color: '#141414' }}>IVA 21%</td>
          <td style={{ padding: '3px 0 6px', fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontSize: '13px', color: '#141414', textAlign: 'right' }}>{iva}</td>
        </tr>
        <tr style={{ borderTop: '1px solid #141414' }}>
          <td style={{ padding: '8px 0 0', fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontSize: '13px', fontWeight: 700, color: '#141414' }}>Tot plegat fa</td>
          <td style={{ padding: '8px 0 0', fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontSize: '13px', fontWeight: 700, color: '#141414', textAlign: 'right' }}>{total}</td>
        </tr>
      </tbody>
    </table>
  );
}
