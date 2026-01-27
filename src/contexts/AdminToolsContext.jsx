import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AdminToolsContext = createContext(null);

const DEFAULT_TOOLS_VALUE = {
  tools: {
    layoutInspector: false
  },
  setTools: () => {},
  setTool: () => {},
  toggleTool: () => {}
};

const STORAGE_KEY = 'adminTools';

export function AdminToolsProvider({ children }) {
  const [tools, setTools] = useState({
    layoutInspector: false
  });

  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
    } catch {
      // ignore
    }
  }, [tools]);

  const value = useMemo(() => ({
    tools,
    setTools,
    setTool: (key, value) => setTools((prev) => ({ ...prev, [key]: value })),
    toggleTool: (key) => setTools((prev) => ({ ...prev, [key]: !prev?.[key] }))
  }), [tools]);

  return (
    <AdminToolsContext.Provider value={value}>
      {children}
    </AdminToolsContext.Provider>
  );
}

export function useAdminTools() {
  const ctx = useContext(AdminToolsContext);
  return ctx || DEFAULT_TOOLS_VALUE;
}
