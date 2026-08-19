function formatPrice(n) {
  return `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`;
}

export function ItemsTable({ items }) {
  if (!items || items.length === 0) return null;

  const rows = items.map((item, i) => {
    const name = item.name || 'Producte';
    const size = item.size || '-';
    const qty = item.quantity || item.qty || 1;
    const price = formatPrice(item.price || 0);
    return (
      <tr key={i}>
        <td
          style={{
            width: '52%',
            padding: '5px 0',
            fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
            fontSize: '13px',
            color: '#141414',
            textAlign: 'left',
          }}
        >
          {name}
        </td>
        <td
          style={{
            width: '16%',
            padding: '5px 4px',
            fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
            fontSize: '13px',
            color: '#141414',
            textAlign: 'center',
          }}
        >
          {size}
        </td>
        <td
          style={{
            width: '12%',
            padding: '5px 4px',
            fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
            fontSize: '13px',
            color: '#141414',
            textAlign: 'center',
          }}
        >
          {qty}
        </td>
        <td
          style={{
            width: '20%',
            padding: '5px 0',
            fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
            fontSize: '13px',
            color: '#141414',
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          {price}
        </td>
      </tr>
    );
  });

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border="0"
      style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}
    >
      <tbody>{rows}</tbody>
    </table>
  );
}
