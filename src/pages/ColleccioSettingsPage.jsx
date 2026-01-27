import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Check,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { supabase } from '@/api/supabase-products';
import { useToast } from '@/components/ui/use-toast';
import { useAdmin } from '@/contexts/AdminContext';
import { useProductContext } from '@/contexts/ProductContext';
import ProductGrid from '@/components/ProductGrid';

export default function ColleccioSettingsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { getRandomProductsByCollection } = useProductContext();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0);
  const initialLoadRef = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveCollections();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [collections]);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCollections(data);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      toast({
        title: "Error",
        description: "No s'han pogut carregar les col·leccions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 100);
    }
  };

  const saveCollections = async () => {
    if (collections.length === 0) return;

    try {
      setSaving(true);

      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      const collectionsToSave = collections.map((collection, index) => {
        const { id, created_at, ...collectionData } = collection;
        return {
          ...collectionData,
          display_order: index,
          updated_at: new Date().toISOString()
        };
      });

      const { error: insertError } = await supabase
        .from('collections')
        .insert(collectionsToSave);

      if (insertError) throw insertError;

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving collections:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut guardar la configuració",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCollection = (index, field, value) => {
    const newCollections = [...collections];
    newCollections[index] = { ...newCollections[index], [field]: value };
    setCollections(newCollections);
  };

  const moveCollection = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= collections.length) return;

    const newCollections = [...collections];
    [newCollections[index], newCollections[newIndex]] = [newCollections[newIndex], newCollections[index]];
    setCollections(newCollections);
  };

  const toggleActive = (index) => {
    updateCollection(index, 'is_active', !collections[index].is_active);
  };

  const addCollection = () => {
    const newCollection = {
      slug: `new-collection-${Date.now()}`,
      name: 'Nova Col·lecció',
      description: 'Descripció de la nova col·lecció',
      path: '/new-collection',
      icon_url: '',
      bg_color: 'bg-white',
      is_active: true,
      display_order: collections.length
    };
    setCollections([...collections, newCollection]);
    setEditingId(collections.length);
  };

  const deleteCollection = async (index) => {
    const newCollections = collections.filter((_, i) => i !== index);
    setCollections(newCollections);
    setDeleteConfirmDialog(null);

    if (editingId === index) {
      setEditingId(null);
    }

    const newActiveCollections = newCollections.filter(c => c.is_active);
    if (currentCollectionIndex >= newActiveCollections.length) {
      setCurrentCollectionIndex(Math.max(0, newActiveCollections.length - 1));
    }
  };

  const activeCollections = collections.filter(c => c.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregant...</div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Configuració de Col·leccions" description="Gestiona les col·leccions de productes" />

      <div className="min-h-screen bg-gray-50">
        {/* Random disabled warning */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
          <p className="text-sm text-yellow-800 text-center">
            ⚠️ Aleatori de productes <strong>DESCONNECTAT</strong> temporalment (mostra sempre els primers productes)
          </p>
        </div>

        {/* Controls header */}
        {editMode && (
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">Configuració de Col·leccions</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{activeCollections.length} col·leccions actives</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={addCollection}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Afegir
                  </button>
                  {saving ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      <span>Desant...</span>
                    </div>
                  ) : lastSaved ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Desat</span>
                    </div>
                  ) : null}
                  <button
                    onClick={() => setEditMode(false)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Sortir del mode edició"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!editMode && isAdmin && (
          <div className="fixed top-6 right-6 z-50">
            <button
              onClick={() => setEditMode(true)}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              aria-label="Activar mode edició"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Collections sections - exactly as shown on Home */}
        <div className="space-y-0">
          {activeCollections.length > 0 ? (
            activeCollections.map((collection, index) => (
              <div key={collection.slug} className="relative">
                {editMode && (
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                    <button
                      onClick={() => moveCollection(
                        collections.findIndex(c => c.slug === collection.slug),
                        'up'
                      )}
                      disabled={index === 0}
                      className="p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Moure amunt"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveCollection(
                        collections.findIndex(c => c.slug === collection.slug),
                        'down'
                      )}
                      disabled={index === activeCollections.length - 1}
                      className="p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Moure avall"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(collections.findIndex(c => c.slug === collection.slug))}
                      className="p-2 bg-transparent text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(collections.findIndex(c => c.slug === collection.slug))}
                      className="p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white shadow-md transition-colors"
                      title="Desactivar"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmDialog(collections.findIndex(c => c.slug === collection.slug))}
                      className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white shadow-md transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <ProductGrid
                  key={collection.slug}
                  title={collection.name.toUpperCase()}
                  description={collection.description}
                  products={getRandomProductsByCollection(collection.slug, 4)}
                  onAddToCart={() => {}}
                  cartItems={[]}
                  onUpdateQuantity={() => {}}
                  collectionPath={collection.path}
                  backgroundColor={collection.bg_color}
                />
              </div>
            ))
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No hi ha col·leccions actives. Afegeix-ne una per començar.
                </p>
                <button
                  onClick={addCollection}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Afegir Col·lecció
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit dialog */}
        <AnimatePresence>
          {editingId !== null && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setEditingId(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Editar Col·lecció
                    </h3>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Slug (identificador únic)
                        </label>
                        <input
                          type="text"
                          value={collections[editingId]?.slug || ''}
                          onChange={(e) => updateCollection(editingId, 'slug', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="first-contact"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={collections[editingId]?.name || ''}
                          onChange={(e) => updateCollection(editingId, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="First Contact"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripció
                      </label>
                      <textarea
                        value={collections[editingId]?.description || ''}
                        onChange={(e) => updateCollection(editingId, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Descripció de la col·lecció"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ruta
                        </label>
                        <input
                          type="text"
                          value={collections[editingId]?.path || ''}
                          onChange={(e) => updateCollection(editingId, 'path', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="/first-contact"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL Icona
                        </label>
                        <input
                          type="text"
                          value={collections[editingId]?.icon_url || ''}
                          onChange={(e) => updateCollection(editingId, 'icon_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="/logo-collection.svg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color de Fons (classe Tailwind)
                      </label>
                      <input
                        type="text"
                        value={collections[editingId]?.bg_color || ''}
                        onChange={(e) => updateCollection(editingId, 'bg_color', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="bg-gradient-to-br from-blue-900 via-slate-900 to-gray-900"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={collections[editingId]?.is_active || false}
                          onChange={(e) => updateCollection(editingId, 'is_active', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Activa</span>
                      </label>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Fet
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete confirmation dialog */}
        <AnimatePresence>
          {deleteConfirmDialog !== null && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setDeleteConfirmDialog(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Esborrar col·lecció
                    </h3>
                    <button
                      onClick={() => setDeleteConfirmDialog(null)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-6">
                    Estàs segur que vols esborrar la col·lecció "{collections[deleteConfirmDialog]?.name}"?
                    Aquesta acció no es pot desfer.
                  </p>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirmDialog(null)}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel·lar
                    </button>
                    <button
                      onClick={() => deleteCollection(deleteConfirmDialog)}
                      className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Esborrar
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
