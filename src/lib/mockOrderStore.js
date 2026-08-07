import { generateOrderNumber, generateTrackingNumber, buildMockOrder, MOCK_CLIENT } from '@/lib/mockOrder';

const STORAGE_KEY = 'hg_mock_orders';

function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export function createMockOrder({ items, subtotal, shipping, iva, total, formData }) {
  const orderNumber = generateOrderNumber(15);
  const trackingNumber = generateTrackingNumber();
  const order = buildMockOrder({ items, subtotal, shipping, iva, total, formData, orderNumber, trackingNumber });
  const orders = getStoredOrders();
  orders.unshift(order);
  saveStoredOrders(orders);
  return order;
}

export function fetchMockOrder(orderNumber, email) {
  const orders = getStoredOrders();
  const order = orders.find((o) => o.order_number === orderNumber || o.id === orderNumber);
  if (!order) return null;
  if (email && order.email !== email) return null;
  return order;
}

export function fetchMockOrdersByEmail(email) {
  const orders = getStoredOrders();
  return orders.filter((o) => o.email === email);
}

export { MOCK_CLIENT };
