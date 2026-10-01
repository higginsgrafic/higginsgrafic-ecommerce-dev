import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ShoppingBag, Loader2, Package, TrendingUp } from 'lucide-react';
import { productsService } from '../api/supabase-products';
import { formatPrice } from '@/utils/formatters';

export default function FulfillmentPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await productsService.getAllProducts();

      const gelatoProducts = data.filter(p =>
        p.gelatoProductId &&
        p.gelatoProductId !== `mock-${p.id}`
      );

      setProducts(gelatoProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err?.message || 'Error carregant productes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ink-strong mx-auto mb-4" />
          <p className="text-ink-2 font-roboto">Carregant catàleg...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <Package className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="font-oswald text-2xl font-bold text-ink-strong mb-2">
            Error carregant catàleg
          </h2>
          <p className="text-ink-2 mb-6">{error}</p>
          <button
            onClick={loadProducts}
            className="px-6 py-3 bg-ink-strong text-paper rounded-lg hover:bg-ink transition-colors font-oswald uppercase"
          >
            Tornar a intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Catàleg Print on Demand | GRÀFIC</title>
        <meta name="description" content="Descobreix la nostra col·lecció de productes personalitzables amb impressió sota demanda" />
      </Helmet>

      <div className="min-h-screen bg-paper">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-paper-soft rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-ink-2" />
              <span className="text-sm font-oswald uppercase text-ink-2">Print on Demand</span>
            </div>
            <h1 className="font-oswald text-4xl lg:text-5xl font-bold uppercase mb-4" style={{ color: 'hsl(var(--grey-ink-strong))' }}>
              Catàleg de Productes
            </h1>
            <p className="font-roboto text-lg max-w-2xl mx-auto" style={{ color: 'hsl(var(--grey-ink-strong))', opacity: 0.8 }}>
              Productes d&apos;alta qualitat amb impressió personalitzada. Cada peça és única i feta especialment per a tu.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h2 className="font-oswald text-2xl font-bold text-ink-strong mb-2">
                Cap producte disponible
              </h2>
              <p className="text-ink-2 font-roboto">
                De moment no hi ha productes al catàleg
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/fulfillment/${product.id}`}
                  className="group"
                >
                  <div className="bg-paper border border-line rounded-lg overflow-hidden transition-all hover:shadow-xl hover:border-ink-strong">
                    <div className="aspect-square bg-paper-soft overflow-hidden relative">
                      <img
                        src={product.images[0] || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />

                      {product.variants && product.variants.length > 0 && (
                        <div className="absolute top-4 right-4 bg-paper/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-xs font-oswald font-semibold text-ink-strong">
                            {product.variants.length} variants
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-paper-soft rounded-full text-xs font-oswald uppercase text-ink-2 mb-3">
                          {product.collection}
                        </span>
                        <h3 className="font-oswald text-xl font-bold uppercase mb-2" style={{ color: 'hsl(var(--grey-ink-strong))' }}>
                          {product.name}
                        </h3>
                        <p className="font-roboto text-sm line-clamp-2" style={{ color: 'hsl(var(--grey-ink-strong))', opacity: 0.7 }}>
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-line">
                        <p className="font-oswald text-2xl font-normal" style={{ color: 'hsl(var(--grey-ink-strong))' }}>
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-2">
                          {product.variants && product.variants.length > 0 && (
                            <div className="flex -space-x-1">
                              {product.variants.slice(0, 3).map((variant, idx) => (
                                variant.colorHex && (
                                  <div
                                    key={idx}
                                    className="w-6 h-6 rounded-full border-2 border-line"
                                    style={{ backgroundColor: variant.colorHex }}
                                    title={variant.color}
                                  />
                                )
                              ))}
                              {product.variants.length > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-line bg-paper-tint flex items-center justify-center">
                                  <span className="text-xs font-bold text-ink-2">
                                    +{product.variants.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {product.variants && product.variants.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-line">
                          <div className="flex flex-wrap gap-2">
                            {[...new Set(product.variants.map(v => v.size))].slice(0, 4).map((size, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-paper-soft rounded text-xs font-oswald font-medium text-ink-2"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 pt-12 border-t border-line">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--grey-ink-strong))' }} />
                <h3 className="font-oswald font-semibold text-lg mb-2 uppercase" style={{ color: 'hsl(var(--grey-ink-strong))' }}>
                  Print on Demand
                </h3>
                <p className="font-roboto text-sm" style={{ color: 'hsl(var(--grey-ink-strong))', opacity: 0.7 }}>
                  Cada producte s&apos;imprimeix especialment per a tu quan fas la comanda
                </p>
              </div>
              <div>
                <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--grey-ink-strong))' }} />
                <h3 className="font-oswald font-semibold text-lg mb-2 uppercase" style={{ color: 'hsl(var(--grey-ink-strong))' }}>
                  Alta Qualitat
                </h3>
                <p className="font-roboto text-sm" style={{ color: 'hsl(var(--grey-ink-strong))', opacity: 0.7 }}>
                  Materials premium i impressió d&apos;última generació per garantir la millor qualitat
                </p>
              </div>
              <div>
                <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--grey-ink-strong))' }} />
                <h3 className="font-oswald font-semibold text-lg mb-2 uppercase" style={{ color: 'hsl(var(--grey-ink-strong))' }}>
                  Personalitzable
                </h3>
                <p className="font-roboto text-sm" style={{ color: 'hsl(var(--grey-ink-strong))', opacity: 0.7 }}>
                  Dissenys únics adaptats als teus gustos i necessitats
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
