import 'dotenv/config';
import { sendOrderEmail } from '../netlify/functions/_email.js';

const sample8Items = [
  { name: 'First Contact', size: 'M', quantity: 1, price: 18.5 },
  { name: 'CUbe', size: 'L', quantity: 1, price: 18.5 },
  { name: 'Sense & Sensibility', size: 'S', quantity: 1, price: 22.0 },
  { name: 'Pemberley House', size: 'XL', quantity: 1, price: 19.5 },
  { name: 'Death Star 2D2', size: 'M', quantity: 1, price: 18.5 },
  { name: 'The Human Inside', size: 'L', quantity: 1, price: 24.0 },
  { name: 'Pride & Prejudice', size: 'M', quantity: 1, price: 21.0 },
  { name: 'Miscellània Poster', size: 'A3', quantity: 1, price: 15.0 },
];

const subtotal = sample8Items.reduce((acc, it) => acc + it.price * it.quantity, 0);
const shipping_cost = 0; // Comanda > 50€
const total = +(subtotal + shipping_cost).toFixed(2);
const iva = +(total * (0.21 / 1.21)).toFixed(2);

const testOrder = {
  order_number: 'HG8M2K9PX4',
  email: 'higginsgrafic@gmail.com',
  first_name: 'Marc',
  items: sample8Items,
  shipping_cost,
  iva,
  total,
};

console.log('Enviant email de test a higginsgrafic@gmail.com...');
console.log('From:', process.env.RESEND_FROM_EMAIL);
console.log('API Key present:', !!process.env.RESEND_API_KEY);

const result = await sendOrderEmail('order_confirmed', testOrder);
console.log('Resultat:', result);
