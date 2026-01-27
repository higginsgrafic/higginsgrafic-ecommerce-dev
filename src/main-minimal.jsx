console.log('🚀 main-minimal.jsx is loading...');

import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('📦 React imported successfully');

function MinimalApp() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>React Funciona!</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>Si veus això, React està funcionant correctament.</p>
        <div style={{ marginTop: '30px' }}>
          <a href="/" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            margin: '0 10px'
          }}>
            🔄 Intentar App Normal
          </a>
          <a href="/debug.html" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            margin: '0 10px'
          }}>
            🔧 Debug
          </a>
        </div>
      </div>
    </div>
  );
}

console.log('🎯 About to render minimal React app...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<MinimalApp />);
  console.log('✅ Minimal React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering minimal app:', error);
}
