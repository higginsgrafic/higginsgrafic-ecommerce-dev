import { useState, useEffect, useCallback, Fragment } from 'react';
import { supabase } from '../api/supabase-products';

const COLLECTIONS = ['first-contact', 'the-human-inside', 'austen', 'cube', 'miscellania'];
const GELATO_SHIPPING = 4.29;
const IVA_RATE = 0.21;

export default function PricingConfigPage() {
  const [globalPrice, setGlobalPrice] = useState(15.50);
  const [collectionPrices, setCollectionPrices] = useState({});
  const [products, setProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [expandedCollections, setExpandedCollections] = useState({});
  const [variantPrices, setVariantPrices] = useState({});
  const [variantCosts, setVariantCosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [dirty, setDirty] = useState({});

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);

      const { data: pricing } = await supabase
        .from('pricing_config')
        .select('*');
      if (pricing) {
        const global = pricing.find(p => p.scope === 'global');
        if (global) setGlobalPrice(global.price);
        const collMap = {};
        pricing.filter(p => p.scope === 'collection').forEach(p => {
          collMap[p.collection] = p.price;
        });
        setCollectionPrices(collMap);
      }

      const { data: prods, error: prodError } = await supabase
        .from('products')
        .select(`
          id, name, collection, price, currency,
          product_variants (id, size, color, price, gelato_cost, gelato_variant_id)
        `)
        .eq('is_active', true)
        .order('name');
      const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
      const sizeRank = (s) => { const i = SIZE_ORDER.indexOf(s); return i === -1 ? 99 : i; };

      const sorted = (prods || []).map(p => ({
        ...p,
        product_variants: (p.product_variants || []).slice().sort((a, b) => {
          const s = sizeRank(a.size) - sizeRank(b.size);
          if (s !== 0) return s;
          return (a.color || '').localeCompare(b.color || '');
        })
      }));
      setProducts(sorted);

      const vPrices = {};
      const vCosts = {};
      sorted.forEach(p => {
        (p.product_variants || []).forEach(v => {
          vPrices[v.id] = v.price;
          vCosts[v.id] = v.gelato_cost != null ? String(v.gelato_cost) : '';
        });
      });
      setVariantPrices(vPrices);
      setVariantCosts(vCosts);
    } catch (err) {
      console.error('Error loading pricing:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const resolvePrice = (productId, collection, variantId) => {
    if (variantId != null && variantPrices[variantId] != null) return variantPrices[variantId];
    if (collection && collectionPrices[collection] != null) return collectionPrices[collection];
    const product = products.find(p => p.id === productId);
    if (product && product.price != null) return product.price;
    return globalPrice;
  };

  const saveGlobal = async () => {
    setSaving('global');
    try {
      const { error } = await supabase
        .from('pricing_config')
        .upsert({ scope: 'global', collection: null, price: parseFloat(globalPrice) }, { onConflict: 'scope,collection' });
      if (error) throw error;
      setDirty(d => ({ ...d, global: false }));
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  const saveCollection = async (collection) => {
    setSaving(`coll-${collection}`);
    try {
      const price = parseFloat(collectionPrices[collection]);
      if (isNaN(price)) {
        const { error } = await supabase
          .from('pricing_config')
          .delete()
          .eq('scope', 'collection')
          .eq('collection', collection);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pricing_config')
          .upsert({ scope: 'collection', collection, price }, { onConflict: 'scope,collection' });
        if (error) throw error;
      }
      setDirty(d => ({ ...d, [`coll-${collection}`]: false }));
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  const saveVariant = async (variantId) => {
    setSaving(`var-${variantId}`);
    try {
      const updates = {};
      if (dirty[`varprice-${variantId}`]) updates.price = parseFloat(variantPrices[variantId]);
      if (dirty[`varcost-${variantId}`]) updates.gelato_cost = parseFloat(variantCosts[variantId]);
      if (Object.keys(updates).length === 0) return;
      const { error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', variantId);
      if (error) throw error;
      setDirty(d => ({ ...d, [`varprice-${variantId}`]: false, [`varcost-${variantId}`]: false }));
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  const applyGlobalToAll = async () => {
    if (!confirm(`Aplicar ${globalPrice}€ a tots els productes i variants?`)) return;
    setSaving('apply-all');
    try {
      const price = parseFloat(globalPrice);
      await supabase.from('products').update({ price }).eq('is_active', true);
      const allVariantIds = products.flatMap(p => (p.product_variants || []).map(v => v.id));
      if (allVariantIds.length > 0) {
        await supabase.from('product_variants').update({ price }).in('id', allVariantIds);
      }
      await loadAll();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  const applyCollectionToProducts = async (collection) => {
    const price = parseFloat(collectionPrices[collection]);
    if (isNaN(price)) return;
    setSaving(`apply-coll-${collection}`);
    try {
      const collProducts = products.filter(p => p.collection === collection);
      const productIds = collProducts.map(p => p.id);
      const variantIds = collProducts.flatMap(p => (p.product_variants || []).map(v => v.id));
      if (productIds.length > 0) {
        await supabase.from('products').update({ price }).in('id', productIds);
      }
      if (variantIds.length > 0) {
        await supabase.from('product_variants').update({ price }).in('id', variantIds);
      }
      await loadAll();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuració de Preus</h1>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">Preu global, per col·lecció i per variant. El preu final és: variant &gt; col·lecció &gt; global.</p>

        {/* Global */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preu Global</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={globalPrice}
                onChange={(e) => { setGlobalPrice(e.target.value); setDirty(d => ({ ...d, global: true })); }}
                className="border border-gray-300 rounded px-3 py-2 text-lg w-32"
              />
              <span className="text-gray-500">€</span>
            </div>
            <button
              onClick={saveGlobal}
              disabled={!dirty.global || saving === 'global'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium whitespace-nowrap"
            >
              {saving === 'global' ? 'Desant...' : 'Desar preu global'}
            </button>
            <button
              onClick={applyGlobalToAll}
              disabled={saving === 'apply-all'}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-300 text-sm font-medium whitespace-nowrap ml-auto"
            >
              {saving === 'apply-all' ? 'Aplicant...' : 'Aplicar a tots els productes'}
            </button>
          </div>
        </div>

        {/* Collections */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preu per Col·lecció</h2>
          <div className="space-y-3">
            {COLLECTIONS.map(col => (
              <div key={col} className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-gray-700 w-48 capitalize whitespace-nowrap">{col}</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="—"
                  value={collectionPrices[col] ?? ''}
                  onChange={(e) => {
                    setCollectionPrices(d => ({ ...d, [col]: e.target.value }));
                    setDirty(d => ({ ...d, [`coll-${col}`]: true }));
                  }}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-32"
                />
                <span className="text-gray-500 text-sm">€</span>
                <button
                  onClick={() => saveCollection(col)}
                  disabled={!dirty[`coll-${col}`] || saving === `coll-${col}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 text-xs font-medium whitespace-nowrap"
                >
                  {saving === `coll-${col}` ? 'Desant...' : 'Desar'}
                </button>
                {collectionPrices[col] != null && (
                  <button
                    onClick={() => applyCollectionToProducts(col)}
                    disabled={saving === `apply-coll-${col}`}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:bg-gray-300 text-xs font-medium"
                  >
                    {saving === `apply-coll-${col}` ? '...' : 'Aplicar a productes'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 p-6 pb-4">Preu per Variant</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Producte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Variant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Cost Gelato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Transport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">IVA (21%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Preu venda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Marge</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {COLLECTIONS.map(col => {
                  const colProducts = products.filter(p => p.collection === col);
                  if (colProducts.length === 0) return null;
                  const isExpanded = expandedCollections[col] !== false;
                  return (
                    <Fragment key={`coll-${col}`}>
                      <tr
                        className="bg-gray-100 cursor-pointer"
                        onClick={() => setExpandedCollections(d => ({ ...d, [col]: !isExpanded }))}
                      >
                        <td colSpan={8} className="px-6 py-2 text-sm font-bold text-gray-700 uppercase whitespace-nowrap">
                          <span className="mr-2">{isExpanded ? '▼' : '▶'}</span>
                          {col} ({colProducts.length} productes)
                        </td>
                      </tr>
                      {isExpanded && colProducts.map(product => (
                        <Fragment key={product.id}>
                          <tr
                            key={product.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                          >
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                              <span className="mr-2">{expandedProduct === product.id ? '▼' : '▶'}</span>
                              {product.name}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {(product.product_variants || []).length} variants
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {(() => {
                                const vs = product.product_variants || [];
                                if (vs.length === 0) return '—';
                                const avg = vs.reduce((s, v) => s + (parseFloat(v.gelato_cost) || 0), 0) / vs.length;
                                return avg.toFixed(2) + '€';
                              })()}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {GELATO_SHIPPING.toFixed(2)}€
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {(() => {
                                const price = parseFloat(product.price);
                                if (isNaN(price)) return '—';
                                const iva = price * IVA_RATE / (1 + IVA_RATE);
                                return iva.toFixed(2) + '€';
                              })()}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-900 whitespace-nowrap">{product.price}€</td>
                            <td className="px-6 py-3 text-sm font-medium whitespace-nowrap">
                              {(() => {
                                const price = parseFloat(product.price);
                                const vs = product.product_variants || [];
                                if (isNaN(price) || vs.length === 0) return '—';
                                const avgCost = vs.reduce((s, v) => s + (parseFloat(v.gelato_cost) || 0), 0) / vs.length;
                                const base = price / (1 + IVA_RATE);
                                const margin = base - avgCost - GELATO_SHIPPING;
                                const pct = ((margin / base) * 100).toFixed(0);
                                const color = margin > 0 ? 'text-green-600' : 'text-red-600';
                                return <span className={color}>{margin.toFixed(2)}€ ({pct}%)</span>;
                              })()}
                            </td>
                            <td className="px-6 py-3"></td>
                          </tr>
                          {expandedProduct === product.id && (product.product_variants || []).map(variant => (
                            <tr key={variant.id} className="bg-gray-50">
                              <td className="px-6 py-2"></td>
                              <td className="px-6 py-2 text-sm text-gray-700 whitespace-nowrap">
                                {variant.size} — {variant.color}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    step="0.01"
                                    value={variantCosts[variant.id] || ''}
                                    onChange={(e) => {
                                      setVariantCosts(d => ({ ...d, [variant.id]: e.target.value }));
                                      setDirty(d => ({ ...d, [`varcost-${variant.id}`]: true }));
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                                  />
                                  <span className="text-gray-500 text-sm">€</span>
                                </div>
                              </td>
                              <td className="px-6 py-2 text-sm text-gray-500 whitespace-nowrap">
                                {GELATO_SHIPPING.toFixed(2)}€
                              </td>
                              <td className="px-6 py-2 text-sm text-gray-500 whitespace-nowrap">
                                {(() => {
                                  const price = parseFloat(variantPrices[variant.id]);
                                  if (isNaN(price)) return '—';
                                  const iva = price * IVA_RATE / (1 + IVA_RATE);
                                  return iva.toFixed(2) + '€';
                                })()}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    step="0.01"
                                    value={variantPrices[variant.id] || ''}
                                    onChange={(e) => {
                                      setVariantPrices(d => ({ ...d, [variant.id]: e.target.value }));
                                      setDirty(d => ({ ...d, [`varprice-${variant.id}`]: true }));
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                                  />
                                  <span className="text-gray-500 text-sm">€</span>
                                </div>
                              </td>
                              <td className="px-6 py-2 text-sm font-medium whitespace-nowrap">
                                {(() => {
                                  const price = parseFloat(variantPrices[variant.id]);
                                  const cost = parseFloat(variantCosts[variant.id]);
                                  if (isNaN(price) || isNaN(cost)) return '—';
                                  const base = price / (1 + IVA_RATE);
                                  const margin = base - cost - GELATO_SHIPPING;
                                  const pct = ((margin / base) * 100).toFixed(0);
                                  const color = margin > 0 ? 'text-green-600' : 'text-red-600';
                                  return <span className={color}>{margin.toFixed(2)}€ ({pct}%)</span>;
                                })()}
                              </td>
                              <td className="px-6 py-2">
                                <button
                                  onClick={() => saveVariant(variant.id)}
                                  disabled={(!dirty[`varprice-${variant.id}`] && !dirty[`varcost-${variant.id}`]) || saving === `var-${variant.id}`}
                                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 text-xs font-medium"
                                >
                                  {saving === `var-${variant.id}` ? '...' : 'Desar'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
