import { createContext, useContext, useState, useEffect } from 'react';

const GridDebugContext = createContext();

export function GridDebugProvider({ children }) {
  const [debugMode, setDebugMode] = useState(() => {
    const saved = localStorage.getItem('gridDebugMode');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      sections: {
        productCard: true,
        productDetail: true,
        cart: true,
        checkout: true,
        header: true,
        footer: true,
        layout: true
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('gridDebugMode', JSON.stringify(debugMode));
  }, [debugMode]);

  const toggleDebug = (section = null) => {
    if (section) {
      setDebugMode(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [section]: !prev.sections[section]
        }
      }));
    } else {
      setDebugMode(prev => ({
        ...prev,
        enabled: !prev.enabled
      }));
    }
  };

  const enableAll = () => {
    setDebugMode(prev => ({
      enabled: true,
      sections: Object.keys(prev.sections).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    }));
  };

  const disableAll = () => {
    setDebugMode(prev => ({
      ...prev,
      enabled: false
    }));
  };

  const getDebugClasses = (section) => {
    if (!debugMode.enabled || !debugMode.sections[section]) {
      return '';
    }

    const colors = {
      productCard: 'border-2 border-blue-500',
      productDetail: 'border-2 border-blue-500',
      cart: 'border-2 border-green-500',
      checkout: 'border-2 border-yellow-500',
      header: 'border-2 border-red-500',
      footer: 'border-2 border-pink-500',
      layout: 'border-2 border-orange-500'
    };

    return colors[section] || 'border-2 border-gray-500';
  };

  const getDebugStyle = (section, subSection = null) => {
    if (!debugMode.enabled || !debugMode.sections[section]) {
      return {};
    }

    const colors = {
      main: { border: '2px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' },
      row1: { border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' },
      row2: { border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' },
      item: { border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }
    };

    return colors[subSection] || colors.main;
  };

  const value = {
    debugMode,
    toggleDebug,
    enableAll,
    disableAll,
    getDebugClasses,
    getDebugStyle,
    isEnabled: debugMode.enabled,
    isSectionEnabled: (section) => debugMode.enabled && debugMode.sections[section]
  };

  return (
    <GridDebugContext.Provider value={value}>
      {children}
    </GridDebugContext.Provider>
  );
}

export function useGridDebug() {
  const context = useContext(GridDebugContext);
  if (!context) {
    throw new Error('useGridDebug must be used within GridDebugProvider');
  }
  return context;
}
