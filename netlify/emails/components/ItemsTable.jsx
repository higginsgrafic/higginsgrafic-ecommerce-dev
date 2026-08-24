function formatPrice(n) {
  return `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`;
}

export function ItemsTable({ items }) {
  if (!items || items.length === 0) return null;

  const rows = items.map((item, i) => {
    const name = item.name || 'Producte';
    const size = item.size || '-';
    const qty = item.quantity || item.qty || 1;
    const price = formatPrice(item.price ? item.price * qty : 0);
    const rowStyle = i === 0 ? {} : { marginTop: '-12px' };
    return (
      <tr key={i}>
        <td style={{ padding: '8px 0', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414', textAlign: 'left' }}>
          <div style={rowStyle}>{name}</div>
        </td>
        <td style={{ padding: '8px 12px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414', textAlign: 'center' }}>
          <div style={rowStyle}>{size}</div>
        </td>
        <td style={{ padding: '8px 12px', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414', textAlign: 'center' }}>
          <div style={rowStyle}>{qty}</div>
        </td>
        <td style={{ padding: '8px 0', fontFamily: "'Roboto', Helvetica, Arial, sans-serif", fontSize: '14px', color: '#141414', textAlign: 'right', whiteSpace: 'nowrap' }}>
          <div style={rowStyle}>{price}</div>
        </td>
      </tr>
    );
  });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0 16px 0' }}>
      <tbody>{rows}</tbody>
    </table>
  );
}
