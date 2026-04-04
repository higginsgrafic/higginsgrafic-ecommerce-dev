import { useState, ReactNode } from 'react';
import { Plus, X } from 'lucide-react';

export interface Tab {
  id: string;
  name: string;
  content: ReactNode;
}

interface TabsSystemProps {
  initialTabs?: Tab[];
  minTabs?: number;
  allowAddTabs?: boolean;
  allowRemoveTabs?: boolean;
  allowRenameTabs?: boolean;
  onTabChange?: (tabId: string) => void;
}

export function TabsSystem({
  initialTabs = [{ id: '1', name: 'Pestanya 1', content: <div>Contingut 1</div> }],
  minTabs = 1,
  allowAddTabs = true,
  allowRemoveTabs = true,
  allowRenameTabs = true,
  onTabChange,
}: TabsSystemProps) {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState(initialTabs[0]?.id || '1');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const addTab = () => {
    if (!allowAddTabs) return;

    const newId = Date.now().toString();
    let baseName = 'Pestanya nova';
    let finalName = baseName;
    let counter = 2;

    while (tabs.some(tab => tab.name === finalName)) {
      finalName = `${baseName} ${counter}`;
      counter++;
    }

    const newTab: Tab = {
      id: newId,
      name: finalName,
      content: <div className="p-8 text-center text-gray-500">Contingut de {finalName}</div>,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    onTabChange?.(newId);
  };

  const removeTab = (id: string) => {
    if (!allowRemoveTabs || tabs.length <= minTabs) return;

    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);

    if (activeTabId === id) {
      const newActiveId = newTabs[0].id;
      setActiveTabId(newActiveId);
      onTabChange?.(newActiveId);
    }
  };

  const startEditing = (tab: Tab) => {
    if (!allowRenameTabs) return;
    setEditingTabId(tab.id);
    setEditingName(tab.name);
  };

  const finishEditing = () => {
    if (editingTabId && editingName.trim()) {
      setTabs(tabs.map(tab =>
        tab.id === editingTabId ? { ...tab, name: editingName.trim() } : tab
      ));
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingTabId(null);
    setEditingName('');
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute top-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between p-1">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`group relative flex items-center gap-1 px-3 py-1.5 text-sm transition-all ${
                  activeTabId === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                }`}
              >
                {allowRemoveTabs && tabs.length > minTabs && (
                  <button
                    onClick={() => removeTab(tab.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded flex-shrink-0"
                    title="Eliminar pestanya"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                {editingTabId === tab.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEditing();
                      if (e.key === 'Escape') cancelEditing();
                    }}
                    className="px-2 py-0.5 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-900"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleTabClick(tab.id)}
                    onDoubleClick={() => startEditing(tab)}
                    className="px-1 whitespace-nowrap"
                    title={allowRenameTabs ? "Doble clic per editar" : undefined}
                  >
                    {tab.name}
                  </button>
                )}
              </div>
            ))}
            {allowAddTabs && (
              <button
                onClick={addTab}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Afegir pestanya"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {activeTab?.content}
        </div>
      </div>
    </div>
  );
}
