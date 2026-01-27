import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdidasInspiredHeader from '@/components/AdidasInspiredHeader';
import Footer from '@/components/Footer';
import ProductTeaserCard from '@/components/ProductTeaserCard';
import { formatPrice } from '@/utils/formatters';

export default function AdidasPdpPage() {
  const [stripeDebugHit, setStripeDebugHit] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Negre');
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlistOn, setWishlistOn] = useState(false);

  const onActionKeyDown = (e, fn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  const stripeItemLeftOffsetPxByIndex = useMemo(
    () => ({
      13: -12,
    }),
    []
  );

  const product = useMemo(
    () => ({
      title: 'IRON KONG',
      subtitle: 'THE HUMAN INSIDE',
      price: '19,99 €',
      description:
        'PDP demo (adidas-inspired). Objectiu: provar header, jerarquia tipogràfica i una secció de recomanacions en document flow.',
      imgSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
    }),
    []
  );

  const colorOptions = useMemo(
    () => ([
      { name: 'Negre', swatch: '#0b0b0c' },
      { name: 'Blanc', swatch: '#f8fafc', ring: true },
      { name: 'Gris', swatch: '#9ca3af' },
      { name: 'Vermell', swatch: '#dc2626' },
      { name: 'Blau', swatch: '#1d4ed8' },
    ]),
    []
  );

  const sizeOptions = useMemo(() => ['XS', 'S', 'M', 'L', 'XL', '2XL'], []);
  const unitPriceNumber = useMemo(() => 19.99, []);
  const lineTotal = useMemo(
    () => formatPrice(unitPriceNumber * Math.max(1, quantity)),
    [quantity, unitPriceNumber]
  );

  const canPurchase = !!selectedSize;

  const addToCart = () => {
    if (!canPurchase) return;
    setCartCount((v) => v + Math.max(1, quantity));
  };

  const buyNow = () => {
    if (!canPurchase) return;
    addToCart();
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-white" data-page="adidas-pdp">
      <AdidasInspiredHeader
        forceStripeDebugHit={stripeDebugHit}
        ignoreStripeDebugFromUrl
        stripeItemLeftOffsetPxByIndex={stripeItemLeftOffsetPxByIndex}
        redistributeStripeBetweenFirstAndLast
      />

      <div className="fixed bottom-4 right-4 z-[9999]">
        <button
          type="button"
          className={`h-10 rounded-full border px-4 text-sm font-semibold shadow-sm hover:bg-black/5 ${
            stripeDebugHit ? 'border-emerald-400/60 bg-emerald-50 text-emerald-900' : 'border-black/15 bg-white text-black/80'
          }`}
          onClick={() => setStripeDebugHit((v) => !v)}
        >
          Stripe debug {stripeDebugHit ? 'ON' : 'OFF'}
        </button>
      </div>

      <main className="pt-[calc(var(--appHeaderOffset,0px)+64px)] lg:pt-[calc(var(--appHeaderOffset,0px)+80px)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="relative">
            <nav className="-mt-[15px] pt-0" aria-label="Breadcrumb" data-component="breadcrumbs">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">
                <li>
                  <Link to="/" className="hover:text-black">
                    Inici
                  </Link>
                </li>
                <li aria-hidden="true" className="text-black/25">
                  /
                </li>
                <li>
                  <Link to="/adidas-demo" className="hover:text-black">
                    Adidas
                  </Link>
                </li>
                <li aria-hidden="true" className="text-black/25">
                  /
                </li>
                <li className="text-black/70">{product.title}</li>
              </ol>
            </nav>

            <div
              className="-mt-[48px] lg:-mt-[56px] pt-10 lg:pt-14 flex items-center"
              style={{
                minHeight: 'calc(100vh - var(--appHeaderOffset, 0px) - 220px)',
              }}
              data-section="pdp"
            >
              <div className="mx-auto w-full">
                <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-2 lg:gap-16">
                  <div className="bg-black/[0.04]" data-component="pdp-media">
                    <div className="aspect-square w-full">
                      <img
                        src={product.imgSrc}
                        alt={product.title}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>

                  <div className="min-w-0" data-component="pdp-info">
                    <div data-component="pdp-info">
                      <div className="grid gap-8">
                        <div className="grid gap-4">
                          <div className="text-[10px] font-semibold tracking-[0.14em] text-black/45">{product.subtitle}</div>
                          <div className="grid gap-2">
                            <h1 className="text-[38px] font-black leading-[0.95] tracking-tight text-black sm:text-[44px]">{product.title}</h1>
                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                              <div className="text-[18px] font-semibold text-black">{product.price}</div>
                              <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-black/35">
                                al carret
                                <span className="ml-2 text-black/70">{cartCount}</span>
                              </div>
                              <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-black/35">
                                total
                                <span className="ml-2 text-black/70">{lineTotal}</span>
                              </div>
                            </div>
                          </div>
                          <p className="max-w-prose text-sm leading-relaxed text-black/60">{product.description}</p>
                        </div>

                        <div className="grid gap-8 rounded-2xl border border-black/10 bg-black/[0.02] p-6">
                          <div className="grid gap-8">
                            <div className="grid gap-4">
                              <div className="flex items-end justify-between gap-4 border-b border-black/10 pb-3">
                                <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">Color</div>
                                <div className="text-[13px] font-semibold text-black/80">{selectedColor}</div>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                                {colorOptions.map((c) => {
                                  const active = c.name === selectedColor;
                                  return (
                                    <span
                                      key={c.name}
                                      role="button"
                                      tabIndex={0}
                                      className={`select-none font-semibold tracking-[0.08em] ${
                                        active ? 'text-black underline underline-offset-[6px]' : 'text-black/40 hover:text-black/75'
                                      }`}
                                      onClick={() => setSelectedColor(c.name)}
                                      onKeyDown={(e) => onActionKeyDown(e, () => setSelectedColor(c.name))}
                                      aria-label={`Tria el color ${c.name}`}
                                    >
                                      {c.name}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid gap-4">
                              <div className="flex items-end justify-between gap-4 border-b border-black/10 pb-3">
                                <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">Talla</div>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="select-none text-[11px] font-semibold tracking-[0.18em] uppercase text-black/35 hover:text-black/70"
                                  onClick={() => setSelectedSize(null)}
                                  onKeyDown={(e) => onActionKeyDown(e, () => setSelectedSize(null))}
                                >
                                  guia de talles
                                </span>
                              </div>

                              <div className="grid grid-cols-6 gap-x-3 gap-y-2">
                                {sizeOptions.map((s) => {
                                  const active = s === selectedSize;
                                  return (
                                    <span
                                      key={s}
                                      role="button"
                                      tabIndex={0}
                                      className={`select-none text-center text-[12px] font-semibold tracking-[0.12em] ${
                                        active ? 'text-black' : 'text-black/40 hover:text-black/75'
                                      }`}
                                      onClick={() => setSelectedSize(s)}
                                      onKeyDown={(e) => onActionKeyDown(e, () => setSelectedSize(s))}
                                      aria-label={`Tria la talla ${s}`}
                                    >
                                      {active ? `— ${s} —` : s}
                                    </span>
                                  );
                                })}
                              </div>

                              {!canPurchase && (
                                <div className="text-[12px] font-semibold text-black/35">Tria una talla i continua.</div>
                              )}
                            </div>

                            <div className="grid gap-4">
                              <div className="flex items-end justify-between gap-4 border-b border-black/10 pb-3">
                                <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">Quantitat</div>
                                <div className="text-[13px] font-semibold text-black/80">{quantity}</div>
                              </div>

                              <div className="flex items-center gap-4 text-[13px]">
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="select-none font-semibold tracking-[0.18em] text-black/40 hover:text-black"
                                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                                  onKeyDown={(e) => onActionKeyDown(e, () => setQuantity((v) => Math.max(1, v - 1)))}
                                  aria-label="Disminueix la quantitat"
                                >
                                  treu-ne una
                                </span>
                                <div className="text-black/20">/</div>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="select-none font-semibold tracking-[0.18em] text-black/40 hover:text-black"
                                  onClick={() => setQuantity((v) => Math.min(99, v + 1))}
                                  onKeyDown={(e) => onActionKeyDown(e, () => setQuantity((v) => Math.min(99, v + 1)))}
                                  aria-label="Augmenta la quantitat"
                                >
                                  posa'n una més
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-4 border-t border-black/10 pt-6">
                            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">Accions</div>

                            <div className="grid gap-2 text-[13px]">
                              <span
                                role="button"
                                tabIndex={0}
                                className={`select-none font-black tracking-[0.08em] ${
                                  canPurchase ? 'text-black hover:underline hover:underline-offset-[6px]' : 'text-black/25'
                                }`}
                                onClick={() => {
                                  if (!canPurchase) return;
                                  addToCart();
                                  setCheckoutOpen(false);
                                }}
                                onKeyDown={(e) =>
                                  onActionKeyDown(e, () => {
                                    if (!canPurchase) return;
                                    addToCart();
                                    setCheckoutOpen(false);
                                  })
                                }
                                aria-disabled={!canPurchase}
                              >
                                posa-ho al carret
                              </span>
                              <span
                                role="button"
                                tabIndex={0}
                                className={`select-none font-semibold tracking-[0.08em] ${
                                  canPurchase ? 'text-black/75 hover:text-black hover:underline hover:underline-offset-[6px]' : 'text-black/25'
                                }`}
                                onClick={() => {
                                  if (!canPurchase) return;
                                  buyNow();
                                }}
                                onKeyDown={(e) =>
                                  onActionKeyDown(e, () => {
                                    if (!canPurchase) return;
                                    buyNow();
                                  })
                                }
                                aria-disabled={!canPurchase}
                              >
                                vull pagar ara
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold tracking-[0.18em] uppercase">
                              <span
                                role="button"
                                tabIndex={0}
                                className={`select-none ${wishlistOn ? 'text-emerald-800' : 'text-black/40 hover:text-black/75'}`}
                                onClick={() => setWishlistOn((v) => !v)}
                                onKeyDown={(e) => onActionKeyDown(e, () => setWishlistOn((v) => !v))}
                              >
                                {wishlistOn ? 'desat' : 'desa-ho'}
                              </span>
                              <span
                                role="button"
                                tabIndex={0}
                                className="select-none text-black/40 hover:text-black/75"
                                onClick={() => {
                                  try {
                                    const url = window.location.href;
                                    navigator?.clipboard?.writeText?.(url);
                                  } catch {
                                    // ignore
                                  }
                                }}
                                onKeyDown={(e) =>
                                  onActionKeyDown(e, () => {
                                    try {
                                      const url = window.location.href;
                                      navigator?.clipboard?.writeText?.(url);
                                    } catch {
                                      // ignore
                                    }
                                  })
                                }
                              >
                                copia l'enllaç
                              </span>
                              <span
                                role="button"
                                tabIndex={0}
                                className={`select-none ${
                                  cartCount ? 'text-black/40 hover:text-black/75' : 'text-black/20'
                                }`}
                                onClick={() => {
                                  if (!cartCount) return;
                                  setCheckoutOpen((v) => !v);
                                }}
                                onKeyDown={(e) =>
                                  onActionKeyDown(e, () => {
                                    if (!cartCount) return;
                                    setCheckoutOpen((v) => !v);
                                  })
                                }
                                aria-disabled={!cartCount}
                              >
                                {checkoutOpen ? 'amaga el checkout' : 'mostra el checkout'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 rounded-2xl border border-black/10 bg-white p-6">
                          <div className="flex items-baseline justify-between gap-6">
                            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">Carret</div>
                            <div className="text-[13px] font-semibold text-black/70">
                              {cartCount ? `${cartCount} unitats` : 'encara és buit'}
                            </div>
                          </div>
                          <div className="flex items-end justify-between gap-6">
                            <div className="text-sm font-semibold text-black/55">Import</div>
                            <div className="text-[15px] font-black text-black">
                              {cartCount ? formatPrice(unitPriceNumber * cartCount) : '—'}
                            </div>
                          </div>

                          {checkoutOpen && (
                            <div className="grid gap-4 border-t border-black/10 pt-4">
                              <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">Checkout (demo)</div>
                              <div className="text-sm leading-relaxed text-black/55">
                                Aquí és on confirmes adreça, enviament i pagament. Ho tens tot a punt quan vulguis.
                              </div>
                              <div className="grid gap-2 text-[13px]">
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className={`select-none font-black tracking-[0.08em] ${
                                    cartCount ? 'text-black hover:underline hover:underline-offset-[6px]' : 'text-black/25'
                                  }`}
                                  onClick={() => {
                                    if (!cartCount) return;
                                    window.location.assign('/checkout');
                                  }}
                                  onKeyDown={(e) =>
                                    onActionKeyDown(e, () => {
                                      if (!cartCount) return;
                                      window.location.assign('/checkout');
                                    })
                                  }
                                  aria-disabled={!cartCount}
                                >
                                  continua cap a caixa
                                </span>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="select-none font-semibold tracking-[0.08em] text-black/50 hover:text-black/75"
                                  onClick={() => setCheckoutOpen(false)}
                                  onKeyDown={(e) => onActionKeyDown(e, () => setCheckoutOpen(false))}
                                >
                                  torna al producte
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid gap-4 text-xs text-black/60">
                          <div className="grid grid-cols-2 gap-x-6 border-t border-black/10 pt-4">
                            <div className="text-black/45">Fitxa</div>
                            <div className="text-right font-semibold text-black/70">Gildan 5000</div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 border-t border-black/10 pt-4">
                            <div className="text-black/45">Impressió</div>
                            <div className="text-right font-semibold text-black/70">DTF</div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 border-t border-black/10 pt-4">
                            <div className="text-black/45">Enviament</div>
                            <div className="text-right font-semibold text-black/70">48/72h</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div data-section="footer">
          <Footer />
        </div>
      </main>
    </div>
  );
}
