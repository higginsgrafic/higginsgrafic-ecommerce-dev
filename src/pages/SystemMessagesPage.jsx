import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, ChevronDown, FileText, Folder, Search, RotateCcw } from 'lucide-react';
import { systemMessages as defaultSystemMessages } from '@/data/systemMessages';
import SEO from '@/components/SEO';

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

export default function SystemMessagesPage() {
  const [systemMessages, setSystemMessages] = useState(defaultSystemMessages);
  const [expandedNodes, setExpandedNodes] = useState(new Set(Object.keys(defaultSystemMessages)));
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentColumn, setCurrentColumn] = useState(0);
  const scrollContainerRef = useRef(null);
  const { toast } = useToast();

  const columnCount = Object.keys(systemMessages).length;

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
    const newMessages = JSON.parse(JSON.stringify(systemMessages));

    let current = newMessages;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = newValue;

    setSystemMessages(newMessages);
  };

  const handleSave = () => {
    setSaving(true);
    setAutoSaveStatus('saving');
    try {
      localStorage.setItem('systemMessages', JSON.stringify(systemMessages));
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Error saving messages:', error);
      setAutoSaveStatus('error');
      toast({
        title: 'Error',
        description: 'No s\'ha pogut desar els missatges',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSystemMessages(defaultSystemMessages);
    localStorage.removeItem('systemMessages');
    toast({
      title: 'Reiniciat!',
      description: 'Els missatges s\'han restaurat als valors originals',
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
    collectPaths(systemMessages);
    setExpandedNodes(allPaths);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(Object.keys(defaultSystemMessages)));
  };

  useEffect(() => {
    const saved = localStorage.getItem('systemMessages');
    if (saved) {
      try {
        setSystemMessages(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    }
    setInitialLoad(false);
  }, []);

  useEffect(() => {
    if (initialLoad) {
      return;
    }

    setAutoSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [systemMessages]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const columnWidth = 336; // 320px width + 16px gap
      const newColumn = Math.round(scrollLeft / columnWidth);
      setCurrentColumn(newColumn);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToColumn = (index) => {
    if (!scrollContainerRef.current) return;
    const columnWidth = 336; // 320px width + 16px gap
    scrollContainerRef.current.scrollTo({
      left: columnWidth * index,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <SEO
        title="Textos de Sistema"
        description="Gestiona els missatges del sistema, notificacions i feedback de l'aplicació"
      />

      <div className="h-screen bg-gray-50 overflow-y-hidden flex flex-col">
        <div className="flex flex-col max-w-[1800px] mx-auto h-full w-full">
          <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold">Textos de Sistema</h2>
              <div className="flex items-center gap-2">
                <p className="text-gray-600 text-sm">Gestiona missatges del sistema, notificacions i feedback de l'aplicació</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                  autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {autoSaveStatus === 'saved' ? '✓ Desat' :
                   autoSaveStatus === 'saving' ? '↻ Desant...' :
                   '✗ Error'}
                </span>
              </div>
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
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg border overflow-hidden flex flex-col min-h-0 mx-4 mb-4">
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

            <div className="py-2 flex items-center justify-center gap-1.5 border-b bg-gray-50">
              {Array.from({ length: columnCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToColumn(index)}
                  className={`transition-all ${
                    currentColumn === index
                      ? 'w-6 h-1.5 bg-blue-600'
                      : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                  } rounded-full`}
                  aria-label={`Anar a columna ${index + 1}`}
                />
              ))}
              <span className="ml-2 text-xs text-gray-500 font-medium">
                {currentColumn + 1} / {columnCount}
              </span>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-x-auto overflow-y-hidden p-4">
              <div className="flex gap-4 h-full items-start">
                {Object.entries(systemMessages).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex-shrink-0 w-80 flex flex-col max-h-full">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300 flex-shrink-0">
                      <Folder className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{key}</h3>
                    </div>
                    <div className="space-y-2 overflow-y-auto flex-1">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <TreeNode
                          key={`${key}.${subKey}`}
                          label={subKey}
                          path={`${key}.${subKey}`}
                          value={subValue}
                          expandedNodes={expandedNodes}
                          onToggle={toggleNode}
                          onChange={handleTextChange}
                          level={0}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 text-xs text-gray-500 text-center flex-shrink-0">
            Els canvis es desen a localStorage. Descarrega els fitxers modificats manualment.
          </div>
        </div>
      </div>
    </>
  );
}
