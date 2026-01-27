import React, { useState, useEffect } from 'react';
import { Truck, ChevronDown, X, Pin, Download } from 'lucide-react';
import { getPromotionsConfig, updatePromotionsConfig, togglePromotionsBanner } from '@/api/promotions';
import { useToast } from '@/components/ui/use-toast';
import SEO from '@/components/SEO';

export default function PromotionsManagerPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [textHistory, setTextHistory] = useState([]);
  const [pinnedTexts, setPinnedTexts] = useState([]);
  const [config, setConfig] = useState({
    enabled: true,
    text: 'Enviament gratuït en comandes superiors a 50€',
    bgColor: '#111827',
    textColor: '#ffffff',
    fontSize: '14px',
    font: 'Roboto',
    link: '',
    clickable: false
  });

  useEffect(() => {
    loadConfig();
    loadTextHistory();
    loadPinnedTexts();
  }, []);

  const loadTextHistory = () => {
    const history = JSON.parse(localStorage.getItem('promoTextHistory') || '[]');
    setTextHistory(history);
  };

  const loadPinnedTexts = () => {
    const pinned = JSON.parse(localStorage.getItem('promoPinnedTexts') || '[]');
    setPinnedTexts(pinned);
  };

  const saveToHistory = (text) => {
    if (!text.trim()) return;
    const history = JSON.parse(localStorage.getItem('promoTextHistory') || '[]');
    if (!history.includes(text)) {
      const newHistory = [text, ...history].slice(0, 20);
      localStorage.setItem('promoTextHistory', JSON.stringify(newHistory));
      setTextHistory(newHistory);
    }
  };

  const deleteFromHistory = (text) => {
    const history = textHistory.filter(t => t !== text);
    localStorage.setItem('promoTextHistory', JSON.stringify(history));
    setTextHistory(history);
  };

  const togglePin = (text) => {
    let pinned = [...pinnedTexts];
    if (pinned.includes(text)) {
      pinned = pinned.filter(t => t !== text);
    } else {
      pinned.push(text);
    }
    localStorage.setItem('promoPinnedTexts', JSON.stringify(pinned));
    setPinnedTexts(pinned);
  };

  const exportTexts = () => {
    const data = { history: textHistory, pinned: pinnedTexts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promo-texts.json';
    a.click();
  };

  const importTexts = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.history) {
          localStorage.setItem('promoTextHistory', JSON.stringify(data.history));
          setTextHistory(data.history);
        }
        if (data.pinned) {
          localStorage.setItem('promoPinnedTexts', JSON.stringify(data.pinned));
          setPinnedTexts(data.pinned);
        }
        toast({ title: 'Importat correctament' });
      } catch (err) {
        toast({ title: 'Error', description: 'Fitxer no vàlid', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getPromotionsConfig();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut carregar la configuració',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      saveToHistory(config.text);
      await updatePromotionsConfig(config);
      window.dispatchEvent(new Event('promotionsConfigChanged'));
      toast({ title: 'Desat' });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: 'Error', description: 'No s\'ha pogut desar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    try {
      setSaving(true);
      const newEnabled = !config.enabled;
      await togglePromotionsBanner(newEnabled);
      setConfig(prev => ({ ...prev, enabled: newEnabled }));
      window.dispatchEvent(new Event('promotionsConfigChanged'));
      toast({ title: newEnabled ? 'Activat' : 'Desactivat' });
    } catch (error) {
      console.error('Error toggling:', error);
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregant...</p>
      </div>
    );
  }

  const allTexts = [...new Set([...pinnedTexts, ...textHistory])];

  return (
    <>
      <SEO title="Gestor de Promocions" description="Gestiona el banner de promocions" />

      <div className="h-screen bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
        {/* Header amb botó activar/desactivar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium">Gestor de Promocions</h1>
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`px-4 py-2 text-sm disabled:opacity-50 ${
              config.enabled
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {config.enabled ? 'Activat' : 'Desactivat'}
          </button>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-2">Vista prèvia</label>
          <div className="border border-gray-200">
            <div
              className="h-10 flex items-center justify-center"
              style={{
                backgroundColor: config.bgColor,
                cursor: config.clickable && config.link ? 'pointer' : 'default'
              }}
            >
              <Truck className="h-5 w-5 scale-x-[-1] mr-2" style={{ color: config.textColor }} />
              <span style={{ fontFamily: config.font, fontSize: config.fontSize, color: config.textColor }}>
                {config.text}
              </span>
            </div>
          </div>
          {config.clickable && config.link && (
            <p className="text-xs text-gray-500 mt-1">
              Enllaç: <span className="font-mono">{config.link}</span>
            </p>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Text Editor amb històric */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-xs text-gray-500">Text</label>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                Històric
              </button>
              <button
                onClick={exportTexts}
                className="text-xs text-gray-400 hover:text-gray-600"
                title="Exportar"
              >
                <Download className="h-3 w-3" />
              </button>
              <label className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer" title="Importar">
                <Download className="h-3 w-3 rotate-180" />
                <input type="file" accept=".json" onChange={importTexts} className="hidden" />
              </label>
            </div>

            {showHistory && allTexts.length > 0 && (
              <div className="mb-2 border border-gray-200 bg-gray-50 max-h-40 overflow-y-auto">
                {allTexts.map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white border-b border-gray-100 last:border-0"
                  >
                    <button
                      onClick={() => handleChange('text', text)}
                      className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
                    >
                      {text}
                    </button>
                    <button
                      onClick={() => togglePin(text)}
                      className={`${pinnedTexts.includes(text) ? 'text-blue-500' : 'text-gray-300'} hover:text-blue-600`}
                      title="Fixar"
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteFromHistory(text)}
                      className="text-gray-300 hover:text-red-500"
                      title="Esborrar"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={config.text}
              onChange={(e) => handleChange('text', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Color de fons</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                  className="h-9 w-14 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.bgColor}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 font-mono text-xs focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Color del text</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="h-9 w-14 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 font-mono text-xs focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Mida</label>
              <input
                type="text"
                value={config.fontSize}
                onChange={(e) => handleChange('fontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 font-mono text-xs focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipografia</label>
              <select
                value={config.font}
                onChange={(e) => handleChange('font', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="Roboto">Roboto</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
          </div>

          {/* Link i Clickable */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-sm font-medium mb-3">Configuració d'enllaç</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="clickable"
                  checked={config.clickable}
                  onChange={(e) => handleChange('clickable', e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="clickable" className="text-sm cursor-pointer">
                  Fer el banner clicable
                </label>
              </div>

              {config.clickable && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Enllaç (URL interna o externa)
                  </label>
                  <input
                    type="text"
                    value={config.link || ''}
                    onChange={(e) => handleChange('link', e.target.value)}
                    placeholder="/offers o https://exemple.com"
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Exemples: /offers (intern) o https://exemple.com (extern)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gray-900 text-white text-sm disabled:opacity-50 hover:bg-gray-800"
            >
              {saving ? 'Desant...' : 'Desar'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
