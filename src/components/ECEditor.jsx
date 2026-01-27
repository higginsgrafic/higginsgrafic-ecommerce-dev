import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase-products';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, ChevronDown, FileText, Folder, Search, Save, RotateCcw } from 'lucide-react';
import { ca } from '@/i18n/ca';
import { siteTexts } from '@/data/siteTexts';
import { systemMessages } from '@/data/systemMessages';

function TreeNode({ label, path, value, expandedNodes, onToggle, onChange, level = 0 }) {
  const isObject = typeof value === 'object' && value !== null;
  const hasChildren = isObject && Object.keys(value).length > 0;
  const isExpanded = expandedNodes.has(path);

  return (
    <div style={{ marginLeft: `${level * 16}px` }} className="mb-1">
      <div className="flex items-start gap-1">
        {hasChildren && (
          <button
            onClick={() => onToggle(path)}
            className="mt-1 p-0.5 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <Folder className="w-3 h-3 text-yellow-600 flex-shrink-0" />
            ) : (
              <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
            )}
            <span className="text-xs font-medium text-gray-700">{label}</span>
          </div>

          {!hasChildren && (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(path, e.target.value)}
              className="w-full mt-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Text..."
            />
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {Object.entries(value).map(([key, val]) => (
            <TreeNode
              key={`${path}.${key}`}
              label={key}
              path={`${path}.${key}`}
              value={val}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onChange={onChange}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ECEditor() {
  const [allTexts, setAllTexts] = useState({ ca, siteTexts, systemMessages });
  const [expandedNodes, setExpandedNodes] = useState(new Set(['ca', 'siteTexts', 'systemMessages']));
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const labelMap = {
    'ca': 'Català',
    'siteTexts': 'Textos del Lloc',
    'systemMessages': 'Missatges del Sistema'
  };

  const toggleNode = (path) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const handleTextChange = (path, newValue) => {
    const pathParts = path.split('.');
    const newTexts = JSON.parse(JSON.stringify(allTexts));

    let current = newTexts;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = newValue;

    setAllTexts(newTexts);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('allTexts', JSON.stringify(allTexts));

      toast({
        title: 'Desat!',
        description: 'Tots els textos s\'han desat correctament a localStorage',
      });
    } catch (error) {
      console.error('Error saving texts:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut desar els textos',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAllTexts({ ca, siteTexts, systemMessages });
    localStorage.removeItem('allTexts');
    toast({
      title: 'Reiniciat!',
      description: 'Tots els textos s\'han restaurat als valors originals',
    });
  };

  const expandAll = () => {
    const allPaths = new Set();
    const collectPaths = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const path = prefix ? `${prefix}.${key}` : key;
        allPaths.add(path);
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          collectPaths(obj[key], path);
        }
      });
    };
    collectPaths(allTexts);
    setExpandedNodes(allPaths);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['ca', 'siteTexts', 'systemMessages']));
  };

  useEffect(() => {
    const saved = localStorage.getItem('allTexts');
    if (saved) {
      try {
        setAllTexts(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved texts:', error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col p-4 max-w-[1800px] mx-auto" style={{ height: 'calc(100vh - 40px)' }}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Editor de Textos del Web</h2>
          <p className="text-gray-600 text-sm">Gestiona tots els textos del lloc web en una estructura d'arbre</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={collapseAll} variant="outline" size="sm">
            Contraure Tot
          </Button>
          <Button onClick={expandAll} variant="outline" size="sm">
            Expandir Tot
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reiniciar
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Desant...' : 'Desar'}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg border overflow-hidden flex flex-col">
        <div className="p-3 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca textos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(allTexts).map(([key, value]) => (
            <TreeNode
              key={key}
              label={labelMap[key] || key}
              path={key}
              value={value}
              expandedNodes={expandedNodes}
              onToggle={toggleNode}
              onChange={handleTextChange}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Els canvis es desen a localStorage. Descarrega els fitxers modificats manualment.
      </div>
    </div>
  );
}

export default ECEditor;
