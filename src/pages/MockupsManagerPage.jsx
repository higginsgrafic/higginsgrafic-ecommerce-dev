import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockupsAPI } from '../api/mockups';
import { useToast } from '../components/ui/use-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Filter, Upload, Download } from 'lucide-react';
import { getPublicUrl as getMediaPublicUrl } from '@/api/storage';

export default function MockupsManagerPage() {
  const [mockups, setMockups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [allMockups, setAllMockups] = useState([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showGridView, setShowGridView] = useState(false);
  const [gridSource, setGridSource] = useState('auto');
  const [filters, setFilters] = useState({
    collection: '',
    design_name: '',
    base_color: '',
    drawing_color: '',
    product_type: '',
    is_active: undefined
  });
  const [collections, setCollections] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const normalizeMockupRow = (row) => {
    const m = row && typeof row === 'object' ? row : {};
    const design = (m.design_name || '').toString().trim();
    const base = (m.base_color || '').toString().trim();
    const knownColors = new Set([
      'white', 'blanc',
      'black', 'negre',
      'navy',
      'royal',
      'forest',
      'militar', 'military',
      'red', 'vermell',
      'blue', 'blau',
      'natural'
    ]);

    const splitColorSuffix = (value) => {
      const raw = (value || '').toString().trim();
      if (!raw) return null;
      const parts = raw.split('-').filter(Boolean);
      if (parts.length < 2) return null;
      const last = parts[parts.length - 1].toLowerCase();
      if (!knownColors.has(last)) return null;
      return { name: parts.slice(0, -1).join('-'), color: last };
    };

    const a = splitColorSuffix(design);
    const b = splitColorSuffix(base);

    if (design && base && design === base && a) {
      return { ...m, design_name: a.name, base_color: a.color };
    }

    if (a && base && a.color && base.toLowerCase() === a.color.toLowerCase()) {
      return { ...m, design_name: a.name };
    }

    if (base && !knownColors.has(base.toLowerCase()) && b && !a) {
      return { ...m, base_color: b.color };
    }

    return m;
  };

  const normalizeMediaKey = (inputKey, colorCtx = {}) => {
    let key = (inputKey || '').toString().trim();
    if (!key) return '';

    const normalizeToStorageColor = (c) => {
      const v = (c || '').toString().trim().toLowerCase();
      if (!v) return null;
      if (['white', 'blanc', 'blanco'].includes(v)) return 'blanc';
      if (['black', 'negre', 'negro'].includes(v)) return 'negre';
      return null;
    };

    key = key.startsWith('/') ? key.slice(1) : key;
    if (key.startsWith('media/')) key = key.slice('media/'.length);

    key = key.replace(/^first-contact\//i, 'first_contact/');
    key = key.replace(/^the-human-inside\//i, 'the_human_inside/');

    key = key.replace(/\/(white)\//gi, '/blanc/');
    key = key.replace(/\/(black)\//gi, '/negre/');

    const baseFolder = normalizeToStorageColor(colorCtx?.base_color);
    const drawingFolder = normalizeToStorageColor(colorCtx?.drawing_color);
    if (baseFolder && drawingFolder) {
      key = key.replace(
        /\/(blanc|negre)\/(blanc|negre)\//gi,
        `/${baseFolder}/${drawingFolder}/`
      );
    }

    key = key
      .split('/')
      .map((seg, idx) => {
        if (seg.includes('.')) return seg;
        if (idx === 0) return seg;
        return seg.replace(/-/g, '_');
      })
      .join('/');

    const parts = key.split('/').filter(Boolean);
    const dedup = [];
    for (const p of parts) {
      if (dedup.length && dedup[dedup.length - 1] === p) continue;
      dedup.push(p);
    }
    key = dedup.join('/');
    return key;
  };

  const getPreviewSrc = (value, ctx = {}) => {
    const raw = (value || '').toString().trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return encodeURI(raw);

    // Already a public media URL path
    if (raw.startsWith('/storage/v1/object/public/') || raw.startsWith('storage/v1/object/public/')) {
      const path = raw.startsWith('/') ? raw : `/${raw}`;
      const base = (import.meta?.env?.VITE_SUPABASE_URL || '').toString().replace(/\/+$/, '');
      const marker = '/storage/v1/object/public/media/';
      const idx = path.indexOf(marker);
      if (idx !== -1) {
        const key = path.slice(idx + marker.length);
        const normalizedKey = normalizeMediaKey(key, ctx);
        if (normalizedKey) {
          const fixedPath = `${marker}${normalizedKey}`;
          if (base) return encodeURI(`${base}${fixedPath}`);
          return encodeURI(fixedPath);
        }
      }
      if (base) return encodeURI(`${base}${path}`);
      return encodeURI(path);
    }

    // Local public assets
    if (raw.startsWith('/mockups/') || raw.startsWith('/placeholders/') || raw.startsWith('/custom_logos/')) {
      return encodeURI(raw);
    }

    // Supabase media bucket key (common for mockups): mockups/... or media/mockups/...
    let key = raw;
    key = normalizeMediaKey(key, ctx);

    try {
      const publicUrl = getMediaPublicUrl(key);
      return encodeURI(publicUrl);
    } catch {
      // Fallback to relative (might still work for local dev if served)
      return encodeURI(`/${key}`);
    }
  };

  useEffect(() => {
    loadMockups();
    loadCollections();
    loadCounts({});
    loadAllMockups();
  }, []);

  useEffect(() => {
    loadMockups();
    loadCounts({});
  }, [filters]);

  const normalizeMediaKeyForDiagnostics = (value, ctx = {}) => {
    const raw = (value || '').toString().trim();
    if (!raw) return '';

    const base = (import.meta?.env?.VITE_SUPABASE_URL || '').toString().replace(/\/+$/, '');
    const marker = '/storage/v1/object/public/media/';

    if (raw.startsWith('/storage/v1/object/public/') || raw.startsWith('storage/v1/object/public/')) {
      const path = raw.startsWith('/') ? raw : `/${raw}`;
      const idx = path.indexOf(marker);
      if (idx !== -1) {
        return normalizeMediaKey(path.slice(idx + marker.length), ctx);
      }
      if (base && raw.startsWith(base)) {
        const idx2 = raw.indexOf(marker);
        if (idx2 !== -1) return normalizeMediaKey(raw.slice(idx2 + marker.length), ctx);
      }
      return '';
    }

    if (/^https?:\/\//i.test(raw)) {
      const idx = raw.indexOf(marker);
      if (idx !== -1) return normalizeMediaKey(raw.slice(idx + marker.length), ctx);
      return '';
    }

    let key = raw;
    key = key.startsWith('/') ? key.slice(1) : key;
    if (key.startsWith('media/')) key = key.slice('media/'.length);
    return normalizeMediaKey(key, ctx);
  };

  const diagnostics = useMemo(() => {
    const rows = Array.isArray(allMockups) ? allMockups : [];

    const normalizedRows = rows.map((r) => normalizeMockupRow(r));

    const totalRows = normalizedRows.length;
    const activeRows = normalizedRows.filter((r) => r?.is_active === true).length;
    const inactiveRows = normalizedRows.filter((r) => r?.is_active === false).length;

    const classifyFilePath = (fp) => {
      const s = String(fp || '');
      if (!s.trim()) return 'empty';
      if (s.includes('/mockups/') || s.startsWith('/mockups/') || s.startsWith('mockups/')) return 'mockups';
      if (s.includes('/storage/v1/object/public/media/') || s.startsWith('media/')) return 'media';
      return 'other';
    };

    const bySource = { mockups: 0, media: 0, other: 0, empty: 0 };
    for (const r of normalizedRows) {
      const k = classifyFilePath(r?.file_path);
      bySource[k] = (bySource[k] || 0) + 1;
    }

    const byCollectionCounts = new Map();
    for (const r of normalizedRows) {
      const c = String(r?.collection || '').toLowerCase().trim();
      const next = (byCollectionCounts.get(c) || 0) + 1;
      byCollectionCounts.set(c, next);
    }
    const collectionsTop = [...byCollectionCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    const byKey = new Map();
    for (const r of normalizedRows) {
      const k = normalizeMediaKeyForDiagnostics(r?.file_path, r);
      if (!k) continue;
      const arr = byKey.get(k) || [];
      arr.push(r);
      byKey.set(k, arr);
    }

    const uniqueKeys = byKey.size;

    const duplicateKeyGroups = [...byKey.entries()]
      .filter(([, arr]) => arr.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    const bySemantic = new Map();
    for (const r of normalizedRows) {
      const parts = [
        String(r?.collection || '').toLowerCase().replace(/^first-contact$/, 'first_contact').replace(/^the-human-inside$/, 'the_human_inside'),
        r?.design_name || '',
        r?.product_type || '',
        r?.base_color || '',
        r?.drawing_color || ''
      ].map((v) => String(v).toLowerCase().trim());
      const k = parts.join('|');
      const arr = bySemantic.get(k) || [];
      arr.push(r);
      bySemantic.set(k, arr);
    }

    const uniqueSemantic = bySemantic.size;

    const duplicateSemanticGroups = [...bySemantic.entries()]
      .filter(([, arr]) => arr.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    return {
      totalRows,
      activeRows,
      inactiveRows,
      bySource,
      collectionsTop,
      uniqueKeys,
      uniqueSemantic,
      duplicateKeyGroups,
      duplicateSemanticGroups
    };
  }, [allMockups]);

  const gridData = useMemo(() => {
    const allRows = (Array.isArray(allMockups) ? allMockups : []).map((r) => normalizeMockupRow(r));

    const isMockups = (fp) => {
      const s = String(fp || '');
      return s.includes('/mockups/') || s.startsWith('/mockups/') || s.startsWith('mockups/');
    };
    const isMedia = (fp) => {
      const s = String(fp || '');
      return s.includes('/storage/v1/object/public/media/') || s.startsWith('media/');
    };

    const mockupsCount = allRows.filter((r) => isMockups(r?.file_path)).length;
    const mediaCount = allRows.filter((r) => isMedia(r?.file_path)).length;

    const effectiveSource = (() => {
      if (gridSource === 'mockups' || gridSource === 'media' || gridSource === 'all') return gridSource;
      // auto
      if (mockupsCount > 0) return 'mockups';
      if (mediaCount > 0) return 'media';
      return 'all';
    })();

    const rows = allRows.filter((r) => {
      const fp = r?.file_path;
      if (effectiveSource === 'mockups') return isMockups(fp);
      if (effectiveSource === 'media') return isMedia(fp);
      return true;
    });

    const normalizeInk = (v) => {
      const s = String(v || '').toLowerCase().trim();
      if (['white', 'blanc', 'blanco'].includes(s)) return 'white';
      if (['black', 'negre', 'negro'].includes(s)) return 'black';
      return 'other';
    };

    const normalizeCollection = (v) => {
      const s = String(v || '').toLowerCase().trim();
      if (s === 'first-contact') return 'first_contact';
      if (s === 'the-human-inside') return 'the_human_inside';
      return s;
    };

    const byCollection = new Map();
    for (const r of rows) {
      const collection = normalizeCollection(r?.collection);
      const design = String(r?.design_name || '').toLowerCase().trim();
      const ink = normalizeInk(r?.drawing_color);
      const cMap = byCollection.get(collection) || new Map();
      const entry = cMap.get(design) || { white: [], black: [], other: [] };
      entry[ink].push(r);
      cMap.set(design, entry);
      byCollection.set(collection, cMap);
    }

    const collections = [...byCollection.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([collection, designsMap]) => {
        const designs = [...designsMap.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([design, entry]) => {
            const sortFn = (x, y) => {
              const bx = String(x?.base_color || '').toLowerCase();
              const by = String(y?.base_color || '').toLowerCase();
              if (bx !== by) return bx.localeCompare(by);
              const fx = String(x?.file_path || '');
              const fy = String(y?.file_path || '');
              return fx.localeCompare(fy);
            };
            return {
              design,
              white: [...entry.white].sort(sortFn),
              black: [...entry.black].sort(sortFn),
              other: [...entry.other].sort(sortFn)
            };
          });

        return { collection, designs };
      });

    return {
      effectiveSource,
      total: allRows.length,
      mockupsCount,
      mediaCount,
      shown: rows.length,
      collections
    };
  }, [allMockups, gridSource]);

  useEffect(() => {
    if (filters.collection) {
      loadDesigns(filters.collection);
    }
  }, [filters.collection]);

  async function loadMockups() {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined)
      );

      // Apply base/drawing color filtering client-side after normalization.
      // This keeps legacy rows like design_name/base_color="wormhole-black" discoverable.
      const {
        base_color: baseColorFilter,
        drawing_color: drawingColorFilter,
        design_name: designFilter,
        ...serverFilters
      } = cleanFilters;

      const data = await mockupsAPI.getAll(serverFilters);
      const normalized = (Array.isArray(data) ? data : []).map(normalizeMockupRow);
      const filtered = normalized.filter((m) => {
        if (designFilter && String(m?.design_name || '').toLowerCase() !== String(designFilter).toLowerCase()) {
          return false;
        }
        if (baseColorFilter && String(m?.base_color || '').toLowerCase() !== String(baseColorFilter).toLowerCase()) {
          return false;
        }
        if (
          drawingColorFilter &&
          String(m?.drawing_color || '').toLowerCase() !== String(drawingColorFilter).toLowerCase()
        ) {
          return false;
        }
        return true;
      });

      setMockups(filtered);
      setFilteredCount(filtered.length);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No s\'han pogut carregar els mockups',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadAllMockups() {
    try {
      const data = await mockupsAPI.getAll({});
      setAllMockups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading all mockups:', error);
      setAllMockups([]);
    }
  }

  async function loadCounts(nextFilters) {
    try {
      const total = await mockupsAPI.countAll({});
      setTotalCount(total);
    } catch (error) {
      // Keep page usable even if count endpoint fails
      console.error('Error loading mockup counts:', error);
    }
  }

  async function loadCollections() {
    try {
      const data = await mockupsAPI.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  }

  async function loadDesigns(collection) {
    try {
      const data = await mockupsAPI.getDesignNames(collection);
      setDesigns(data);
    } catch (error) {
      console.error('Error loading designs:', error);
    }
  }

  async function handleToggleActive(id) {
    try {
      await mockupsAPI.toggleActive(id);
      toast({
        title: 'Actualitzat',
        description: 'Estat del mockup actualitzat'
      });
      loadMockups();
      loadCounts(filters);
      loadAllMockups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Segur que vols eliminar aquest mockup?')) return;

    try {
      await mockupsAPI.delete(id);
      toast({
        title: 'Eliminat',
        description: 'Mockup eliminat correctament'
      });
      loadMockups();
      loadCounts(filters);
      loadAllMockups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  function startEdit(mockup) {
    setEditingId(mockup.id);
    setEditForm(mockup);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    try {
      await mockupsAPI.update(editingId, editForm);
      toast({
        title: 'Guardat',
        description: 'Mockup actualitzat correctament'
      });
      cancelEdit();
      loadMockups();
      loadCounts(filters);
      loadAllMockups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await mockupsAPI.create(editForm);
      toast({
        title: 'Afegit',
        description: 'Mockup afegit correctament'
      });
      setShowAddForm(false);
      setEditForm({});
      loadMockups();
      loadCounts(filters);
      loadAllMockups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  function exportToCSV() {
    const headers = ['collection', 'subcategory', 'sub_subcategory', 'design_name', 'drawing_color', 'base_color', 'product_type', 'file_path', 'variant_id', 'display_order', 'is_active'];
    const rows = mockups.map(m => [
      m.collection,
      m.subcategory || '',
      m.sub_subcategory || '',
      m.design_name,
      m.drawing_color,
      m.base_color,
      m.product_type,
      m.file_path,
      m.variant_id || '',
      m.display_order,
      m.is_active
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mockups-export.csv';
    a.click();
  }

  if (loading && mockups.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregant mockups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestió de Mockups</h1>
            <p className="mt-2 text-gray-600">Gestiona les imatges de previsualització dels productes</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Tornar
            </Link>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Afegir Mockup
            </button>
            <button
              onClick={() => setShowGridView((v) => !v)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {showGridView ? 'Amagar grid' : 'Veure grid'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Registres: {diagnostics.totalRows} (actius: {diagnostics.activeRows}, inactius: {diagnostics.inactiveRows}) · Keys úniques: {diagnostics.uniqueKeys} · Combinacions úniques: {diagnostics.uniqueSemantic} · Duplicats (mateix key): {diagnostics.duplicateKeyGroups.length} · Duplicats (mateixa combinació): {diagnostics.duplicateSemanticGroups.length}
            </div>
            <button
              onClick={() => setShowDiagnostics((v) => !v)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showDiagnostics ? 'Amagar diagnosi' : 'Veure diagnosi'}
            </button>
          </div>

          {showDiagnostics && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-900 mb-2">Resum</div>
                <div className="text-xs text-gray-700">
                  mockups: {diagnostics.bySource.mockups} · media: {diagnostics.bySource.media} · other: {diagnostics.bySource.other} · empty: {diagnostics.bySource.empty}
                </div>

                <div className="mt-3 text-xs text-gray-700">
                  <div className="font-semibold text-gray-900 mb-1">Top col·leccions (per nombre de registres)</div>
                  <div className="space-y-1">
                    {diagnostics.collectionsTop.map(([c, n]) => (
                      <div key={c} className="font-mono break-all">{n} · {c || '(buit)'}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-900 mb-2">Duplicats per key normalitzat</div>
                {diagnostics.duplicateKeyGroups.length === 0 ? (
                  <div className="text-sm text-gray-500">Cap</div>
                ) : (
                  <div className="space-y-3">
                    {diagnostics.duplicateKeyGroups.slice(0, 20).map(([key, items]) => (
                      <div key={key} className="text-xs">
                        <div className="font-mono break-all text-gray-800">{items.length}x · {key}</div>
                        <div className="text-gray-600 mt-1">
                          {items.map((m) => `${m.id}:${m.collection}/${m.design_name}/${m.product_type}/${m.base_color}/${m.drawing_color}`).join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-3 lg:col-span-2">
                <div className="text-sm font-semibold text-gray-900 mb-2">Duplicats per combinació (collection+design+type+colors)</div>
                {diagnostics.duplicateSemanticGroups.length === 0 ? (
                  <div className="text-sm text-gray-500">Cap</div>
                ) : (
                  <div className="space-y-3">
                    {diagnostics.duplicateSemanticGroups.slice(0, 20).map(([key, items]) => (
                      <div key={key} className="text-xs">
                        <div className="font-mono break-all text-gray-800">{items.length}x · {key}</div>
                        <div className="text-gray-600 mt-1">
                          {items.map((m) => `${m.id}:${m.file_path || ''}`).join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Filtres</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Col·lecció</label>
              <select
                value={filters.collection}
                onChange={e => setFilters({ ...filters, collection: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Totes</option>
                {collections.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disseny</label>
              <select
                value={filters.design_name}
                onChange={e => setFilters({ ...filters, design_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!filters.collection}
              >
                <option value="">Tots</option>
                {designs.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color base</label>
              <input
                type="text"
                value={filters.base_color}
                onChange={e => setFilters({ ...filters, base_color: e.target.value })}
                placeholder="white, black..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color dibuix</label>
              <input
                type="text"
                value={filters.drawing_color}
                onChange={e => setFilters({ ...filters, drawing_color: e.target.value })}
                placeholder="black, white..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipus producte</label>
              <input
                type="text"
                value={filters.product_type}
                onChange={e => setFilters({ ...filters, product_type: e.target.value })}
                placeholder="tshirt, mug..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estat</label>
              <select
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={e => setFilters({
                  ...filters,
                  is_active: e.target.value === '' ? undefined : e.target.value === 'true'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tots</option>
                <option value="true">Actius</option>
                <option value="false">Inactius</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredCount} / {totalCount} mockup{totalCount !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setFilters({
                collection: '',
                design_name: '',
                base_color: '',
                drawing_color: '',
                product_type: '',
                is_active: undefined
              })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Esborrar filtres
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Afegir Mockup</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Col·lecció *</label>
                <input
                  type="text"
                  required
                  value={editForm.collection || ''}
                  onChange={e => setEditForm({ ...editForm, collection: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom disseny *</label>
                <input
                  type="text"
                  required
                  value={editForm.design_name || ''}
                  onChange={e => setEditForm({ ...editForm, design_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color dibuix *</label>
                <input
                  type="text"
                  required
                  value={editForm.drawing_color || ''}
                  onChange={e => setEditForm({ ...editForm, drawing_color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color base *</label>
                <input
                  type="text"
                  required
                  value={editForm.base_color || ''}
                  onChange={e => setEditForm({ ...editForm, base_color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipus producte *</label>
                <input
                  type="text"
                  required
                  value={editForm.product_type || 'tshirt'}
                  onChange={e => setEditForm({ ...editForm, product_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ruta fitxer *</label>
                <input
                  type="text"
                  required
                  value={editForm.file_path || ''}
                  onChange={e => setEditForm({ ...editForm, file_path: e.target.value })}
                  placeholder="/mockups/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                <input
                  type="text"
                  value={editForm.subcategory || ''}
                  onChange={e => setEditForm({ ...editForm, subcategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-subcategoria</label>
                <input
                  type="text"
                  value={editForm.sub_subcategory || ''}
                  onChange={e => setEditForm({ ...editForm, sub_subcategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setEditForm({}); }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Afegir
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previsualització
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Col·lecció
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disseny
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockups.map(mockup => (
                  <tr key={mockup.id} className={!mockup.is_active ? 'opacity-50' : ''}>
                    {editingId === mockup.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={getPreviewSrc(editForm.file_path, editForm)}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              if (e?.currentTarget?.dataset?.failed === '1') return;
                              e.currentTarget.dataset.failed = '1';
                              e.currentTarget.src = '/placeholder-product.svg';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.collection}
                            onChange={e => setEditForm({ ...editForm, collection: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.design_name}
                            onChange={e => setEditForm({ ...editForm, design_name: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.drawing_color}
                            onChange={e => setEditForm({ ...editForm, drawing_color: e.target.value })}
                            placeholder="Dibuix"
                            className="w-full px-2 py-1 border rounded text-sm mb-1"
                          />
                          <input
                            type="text"
                            value={editForm.base_color}
                            onChange={e => setEditForm({ ...editForm, base_color: e.target.value })}
                            placeholder="Base"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.product_type}
                            onChange={e => setEditForm({ ...editForm, product_type: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.display_order || 0}
                            onChange={e => setEditForm({ ...editForm, display_order: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mockup.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {mockup.is_active ? 'Actiu' : 'Inactiu'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel·lar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={getPreviewSrc(mockup.file_path, mockup)}
                            alt={mockup.design_name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              if (e?.currentTarget?.dataset?.failed === '1') return;
                              e.currentTarget.dataset.failed = '1';
                              e.currentTarget.src = '/placeholder-product.svg';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{mockup.collection}</div>
                          {mockup.subcategory && (
                            <div className="text-xs text-gray-500">{mockup.subcategory}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{mockup.design_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">🎨 {mockup.drawing_color}</div>
                          <div className="text-sm text-gray-500">📦 {mockup.base_color}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{mockup.product_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mockup.display_order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mockup.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {mockup.is_active ? 'Actiu' : 'Inactiu'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleActive(mockup.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title={mockup.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {mockup.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => startEdit(mockup)}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mockup.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mockups.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No s'han trobat mockups amb aquests filtres</p>
            </div>
          )}
        </div>

        {showGridView && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="text-sm text-gray-700">
                Vista per col·lecció → disseny, dividida per color de dibuix (white vs black)
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-600">
                  total: {gridData.total} · mockups: {gridData.mockupsCount} · media: {gridData.mediaCount} · mostrats: {gridData.shown}
                </div>
                <select
                  value={gridSource}
                  onChange={(e) => setGridSource(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="mockups">/mockups</option>
                  <option value="media">media</option>
                  <option value="all">Tots</option>
                </select>
              </div>
            </div>

            {gridData.shown === 0 ? (
              <div className="text-sm text-gray-600">
                No hi ha registres per aquesta font: <span className="font-mono">{gridData.effectiveSource}</span>.
                Prova a canviar el selector (Auto / /mockups / media / Tots).
              </div>
            ) : (
              <div className="space-y-8">
                {gridData.collections.map((c) => (
                  <div key={c.collection}>
                    <div className="text-lg font-semibold text-gray-900 mb-3">{c.collection}</div>

                    <div className="space-y-6">
                      {c.designs.map((d) => (
                        <div key={`${c.collection}-${d.design}`} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-sm font-semibold text-gray-900">{d.design}</div>
                            <div className="text-xs text-gray-600">
                              white: {d.white.length} · black: {d.black.length}{d.other.length ? ` · other: ${d.other.length}` : ''}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-medium text-gray-700 mb-2">Dibuix blanc</div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {d.white.map((m) => (
                                  <a
                                    key={m.id}
                                    href={getPreviewSrc(m.file_path, m)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                    title={`${m.id} · ${m.base_color} · ${m.product_type}`}
                                  >
                                    <img
                                      src={getPreviewSrc(m.file_path, m)}
                                      alt={m.design_name}
                                      className="w-full aspect-square object-cover rounded border"
                                      onError={(e) => {
                                        if (e?.currentTarget?.dataset?.failed === '1') return;
                                        e.currentTarget.dataset.failed = '1';
                                        e.currentTarget.src = '/placeholder-product.svg';
                                      }}
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-medium text-gray-700 mb-2">Dibuix negre</div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {d.black.map((m) => (
                                  <a
                                    key={m.id}
                                    href={getPreviewSrc(m.file_path, m)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                    title={`${m.id} · ${m.base_color} · ${m.product_type}`}
                                  >
                                    <img
                                      src={getPreviewSrc(m.file_path, m)}
                                      alt={m.design_name}
                                      className="w-full aspect-square object-cover rounded border"
                                      onError={(e) => {
                                        if (e?.currentTarget?.dataset?.failed === '1') return;
                                        e.currentTarget.dataset.failed = '1';
                                        e.currentTarget.src = '/placeholder-product.svg';
                                      }}
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>

                          {d.other.length > 0 && (
                            <div className="mt-4">
                              <div className="text-xs font-medium text-gray-700 mb-2">Altres colors de dibuix</div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {d.other.map((m) => (
                                  <a
                                    key={m.id}
                                    href={getPreviewSrc(m.file_path, m)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                    title={`${m.id} · ${m.drawing_color}/${m.base_color} · ${m.product_type}`}
                                  >
                                    <img
                                      src={getPreviewSrc(m.file_path, m)}
                                      alt={m.design_name}
                                      className="w-full aspect-square object-cover rounded border"
                                      onError={(e) => {
                                        if (e?.currentTarget?.dataset?.failed === '1') return;
                                        e.currentTarget.dataset.failed = '1';
                                        e.currentTarget.src = '/placeholder-product.svg';
                                      }}
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Com importar mockups:</h3>
          <code className="block bg-white p-3 rounded text-sm mb-2">
            node scripts/import-mockups.js --csv mockups.csv
          </code>
          <code className="block bg-white p-3 rounded text-sm">
            node scripts/import-mockups.js --scan ./public/mockups
          </code>
        </div>
      </div>
    </div>
  );
}
