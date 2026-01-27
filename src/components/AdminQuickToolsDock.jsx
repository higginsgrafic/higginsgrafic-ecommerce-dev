import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { useAdminTools } from '@/contexts/AdminToolsContext';

export default function AdminQuickToolsDock() {
  const { tools, toggleTool } = useAdminTools();

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-2 bg-background/90 backdrop-blur border border-border shadow-lg rounded-full px-2 py-2 debug-exempt"
      role="toolbar"
      aria-label="Admin quick tools"
    >
      <button
        type="button"
        onClick={() => toggleTool('layoutInspector')}
        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${tools?.layoutInspector ? 'bg-orange-600 text-whiteStrong' : 'bg-muted text-foreground/80 hover:bg-muted/80'}`}
        aria-pressed={!!tools?.layoutInspector}
        aria-label="Mostrar/Ocultar inspector de layout"
        title="Inspector de layout"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
    </div>
  );
}
