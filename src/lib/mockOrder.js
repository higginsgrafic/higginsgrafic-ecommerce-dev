const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateOrderNumber(length = 10) {
  let s = '';
  for (let i = 0; i < length; i++) {
    s += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return s;
}

export function generateTrackingNumber() {
  const prefix = 'GRF';
  const digits = String(Math.floor(Math.random() * 9000000000) + 1000000000);
  return `${prefix}${digits}`;
}

export const MOCK_CLIENT = {
  fullName: 'Client Prova Higgins',
  email: 'client.prova@higginsgrafic.com',
  password: 'prova123456',
  firstName: 'Client',
  lastName: 'Prova Higgins',
  address: 'Carrer Major 42, 2º 1ª',
  city: 'Barcelona',
  postalCode: '08001',
  country: 'Espanya',
};

export function buildMockOrder({ items, subtotal, shipping, iva, total, formData, orderNumber, trackingNumber }) {
  const now = new Date();
  const estimatedDelivery = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  return {
    id: orderNumber,
    order_number: orderNumber,
    tracking_number: trackingNumber,
    tracking_carrier: 'Correus Express',
    tracking_url: null,
    status: 'confirmada',
    statusLabel: 'CONFIRMADA',
    created_at: now.toISOString(),
    estimated_delivery: estimatedDelivery.toISOString(),
    email: formData.email,
    first_name: formData.firstName,
    last_name: formData.lastName,
    address: formData.address,
    city: formData.city,
    postal_code: formData.postalCode,
    country: formData.country || 'Espanya',
    items: items.map((item, idx) => ({
      id: item.id || `item-${idx}`,
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      image: item.image || '/tshirt-white.jpg',
    })),
    subtotal,
    shipping_cost: shipping,
    iva,
    total,
  };
}
