import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase-products';
import { syncGelatoStoreProducts } from '../api/gelato';

export default function GelatoProductsManagerPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);

      const total = data?.length || 0;
      const active = data?.filter(p => p.is_active).length || 0;
      setStats({
        total,
        active,
        inactive: total - active
      });
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const storeProducts = await syncGelatoStoreProducts();

      for (const product of storeProducts) {
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('gelato_product_id', product.id)
          .maybeSingle();

        if (existingProduct) {
          await supabase
            .from('products')
            .update({
              name: product.title || product.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id);
        } else {
          await supabase
            .from('products')
            .insert({
              gelato_product_id: product.id,
              name: product.title || product.name,
              description: product.description || '',
              price: 29.99,
              is_active: false
            });
        }
      }

      await loadProducts();
      alert('Sincronització completada!');
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Error sincronitzant: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleActive = async (productId, currentState) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentState })
        .eq('id', productId);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      collection: product.collection || 'first-contact'
    });
  };

  const handleSaveEdit = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          collection: editForm.collection,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      setEditingId(null);
      setEditForm({});
      await loadProducts();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error desant: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const collections = [
    'first-contact',
    'the-human-inside',
    'austen',
    'cube',
    'outcasted'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant productes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestió de Productes Gelato
          </h1>
          <p className="text-gray-600">
            Gestiona els productes importats del teu catàleg de Gelato
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Productes</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Publicats</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Despublicats</div>
            <div className="text-3xl font-bold text-gray-400">{stats.inactive}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {syncing ? 'Sincronitzant...' : 'Sincronitzar amb Gelato'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Col·lecció
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {editingId === product.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-2"
                            rows="2"
                            placeholder="Descripció..."
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editForm.collection}
                            onChange={(e) => setEditForm({ ...editForm, collection: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          >
                            {collections.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.is_active ? 'Publicat' : 'Despublicat'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(product.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Desar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                            >
                              Cancel·lar
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...</div>
                          )}
                          {product.gelato_product_id && (
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {product.gelato_product_id}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.collection || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {product.price} {product.currency || 'EUR'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(product.id, product.is_active)}
                            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              product.is_active
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {product.is_active ? 'Publicat' : 'Despublicat'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Editar
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
            <p className="text-gray-500 mb-4">No hi ha productes importats</p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {syncing ? 'Sincronitzant...' : 'Importar de Gelato'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
