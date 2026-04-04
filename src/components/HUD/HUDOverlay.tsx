import { TabsSystem, Tab } from './TabsSystem';

interface HUDOverlayProps {
  isVisible?: boolean;
}

export function HUDOverlay({ isVisible = true }: HUDOverlayProps) {
  const initialTabs: Tab[] = [
    {
      id: 'general',
      name: 'General',
      content: (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Configuració General</h2>
          <p className="text-gray-600">Contingut de la pestanya General</p>
        </div>
      ),
    },
    {
      id: 'stripe',
      name: 'Stripe',
      content: (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Configuració Stripe</h2>
          <p className="text-gray-600">Controls per calibrar el stripe overlay</p>
        </div>
      ),
    },
    {
      id: 'layout',
      name: 'Layout',
      content: (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Configuració Layout</h2>
          <p className="text-gray-600">Controls per ajustar el layout del mega menu</p>
        </div>
      ),
    },
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      <div className="pointer-events-auto">
        <TabsSystem
          initialTabs={initialTabs}
          minTabs={1}
          allowAddTabs={true}
          allowRemoveTabs={true}
          allowRenameTabs={true}
          onTabChange={(tabId) => {
            console.log('Active tab:', tabId);
          }}
        />
      </div>
    </div>
  );
}
