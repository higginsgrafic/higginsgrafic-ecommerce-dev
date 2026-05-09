import React from 'react';
import { Helmet } from 'react-helmet';
import ProductCard from '@/components/ProductCard';

const tdpProduct = {
  id: 'tdp-demo',
  slug: 'tdp-demo',
  name: 'NCC-1701',
  description: 'Lo que per la sua gran saviesa e lo seu alt. De discreció; e per ço ab lo. E la seua felicitat no pot ésser atesa.',
  price: 15.5,
  image: '/placeholders/apparel/t-shirt/gildan_64000l/white.png',
  collection: 'tdp',
  variants: [
    { size: 'S' },
    { size: 'M' },
    { size: 'L' },
    { size: 'XL' },
    { size: 'XXL' }
  ]
};

function TdpPage() {
  const handleAddToCart = () => {};

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <Helmet>
        <title>TDP | Higgins Gràfic</title>
        <meta name="description" content="Pàgina de prova per visualitzar una Targeta de Producte." />
      </Helmet>

      <section className="mx-auto max-w-[1400px]">
        <div className="mb-10">
          <p className="font-roboto text-sm uppercase tracking-[0.18em] text-muted-foreground">Prova TDP</p>
          <h1 className="mt-2 font-oswald text-4xl font-medium uppercase text-foreground sm:text-5xl">Targeta de producte</h1>
        </div>

        <div className="w-full max-w-[360px]">
          <ProductCard product={tdpProduct} onAddToCart={handleAddToCart} cartItems={[]} />
        </div>
      </section>
    </main>
  );
}

export default TdpPage;
