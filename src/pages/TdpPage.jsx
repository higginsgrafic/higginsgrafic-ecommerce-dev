import React from 'react';
import { Helmet } from 'react-helmet';
import ProductCard from '@/components/ProductCard';
import CartIcon from '@/components/ui/CartIcon';
import SizeButton from '@/components/ui/SizeButton';

const tdpProduct = {
  id: 'tdp-demo',
  slug: 'tdp-demo',
  name: 'NCC-1701',
  description: 'Lo que per la sua gran saviesa e lo seu alt. De discreció; e per ço ab lo. E la seua felicitat no pot ésser atesa.',
  price: 15.5,
  image: '/tmp/prototip TDP.png',
  collection: 'tdp',
  variants: [
    { size: 'S' },
    { size: 'M' },
    { size: 'L' },
    { size: 'XL' },
    { size: 'XXL' }
  ]
};

const tdpMockDescription = 'Per bé que sia cosa de gran dolor, yo vull obeir lo manament que·m fa la altesa vostra. Car yo viu a la sereníssima senyora emperadriu.';

function TdpPage() {
  const handleAddToCart = () => {};
  const selectedSize = 'M';
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

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

        <div className="relative flex w-full justify-center overflow-auto">
          <img
            src="/tmp/prototip TDP.png"
            alt="Prototip TDP"
            className="block h-auto max-w-none opacity-0"
            style={{ width: '25%' }}
          />
          <div
            className="absolute left-1/2 top-0 h-full -translate-x-1/2 bg-muted"
            style={{ width: '25%' }}
          />
          <div
            className="absolute left-1/2 top-[20px] -translate-x-1/2 bg-background"
            style={{ width: 'calc(25% - 40px)', height: 'calc(100% - 40px)' }}
          />
          <img
            src="/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png"
            alt="Samarreta blanca Gildan 5000"
            className="absolute left-1/2 top-[20px] -translate-x-1/2 object-contain"
            style={{
              width: '19.127028015%',
              opacity: 0.85
            }}
          />
          <div
            className="absolute left-1/2 grid -translate-x-1/2 grid-cols-5"
            style={{
              bottom: 'calc(4.6% + 19px)',
              width: 'calc(18.3825% + 8px)',
              gap: '5px'
            }}
          >
            {sizes.map((size) => (
              <div
                key={size}
                className="overflow-hidden"
                style={{
                  height: 'calc(100% - 0.5px)',
                  width: 'calc(100% + 1px)',
                  marginLeft: '-0.5px',
                  marginRight: '-0.5px'
                }}
              >
                <SizeButton
                  size={size}
                  selected={selectedSize === size}
                  onClick={() => {}}
                  className={`!font-light [&>span]:text-[calc(clamp(0.75rem,3.2vw,1.25rem)-0.1667rem)] ${selectedSize === size ? '' : '!bg-muted'}`}
                />
              </div>
            ))}
          </div>
          <div
            className="absolute left-1/2 grid -translate-x-1/2 grid-cols-5 items-center"
            style={{
              bottom: 'calc(4.6% + 63px)',
              width: 'calc(18.3825% + 8px)',
              gap: '5px'
            }}
          >
            <span
              className="relative inline-flex justify-self-center font-oswald font-light leading-none text-foreground"
              style={{ fontSize: '23.67px', transform: 'translateY(2px)', width: '4ch', justifyContent: 'center' }}
            >
              <span>15,50</span>
              <span className="absolute left-full">€</span>
            </span>
            <div className="col-start-5 justify-self-center" style={{ transform: 'translateY(3.5px)' }}>
              <CartIcon
                count={0}
                onClick={() => {}}
                iconSize="21px"
                className="!bg-transparent"
              />
            </div>
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 overflow-hidden font-roboto font-normal text-foreground"
            style={{
              bottom: 'calc(4.6% + 102px + 9pt + 1px - 6pt)',
              width: 'calc(18.3825% + 8px)',
              height: '36pt',
              fontSize: '10pt',
              lineHeight: '12pt'
            }}
          >
            {tdpMockDescription}
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center font-oswald font-bold uppercase leading-none text-foreground"
            style={{
              bottom: 'calc(4.6% + 102px + 9pt + 1px - 6pt + 56px)',
              width: 'calc(18.3825% + 8px)',
              fontSize: '14pt'
            }}
          >
            NCC-1701
          </div>
        </div>

        <div className="mx-auto mt-12 w-full max-w-[360px]">
          <ProductCard product={tdpProduct} onAddToCart={handleAddToCart} cartItems={[]} />
        </div>
      </section>
    </main>
  );
}

export default TdpPage;
