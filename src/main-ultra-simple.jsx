console.log('🚀 ULTRA SIMPLE main.jsx starting...');

import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('📦 React imported');

function UltraSimpleApp() {
  console.log('🎨 Rendering UltraSimpleApp');
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>React Funciona!</h1>
        <p style={{ fontSize: '18px' }}>Si veus això, React està carregant correctament.</p>
        <div style={{ marginTop: '30px' }}>
          <button onClick={() => {
            console.log('Button clicked!');
            alert('React events funcionen!');
          }} style={{
            padding: '12px 24px',
            background: 'white',
            color: '#333',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            margin: '0 10px'
          }}>
            Test Events
          </button>
          <a href="/" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 10px'
          }}>
            App Principal
          </a>
        </div>
      </div>
    </div>
  );
}

console.log('🎯 Creating root...');
const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ No root element found!');
  document.body.innerHTML = '<h1 style="color: red; padding: 40px;">ERROR: No root element!</h1>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ Root created');

    root.render(<UltraSimpleApp />);
    console.log('✅ React rendered');
  } catch (error) {
    console.error('❌ Error rendering:', error);
    document.body.innerHTML = `<h1 style="color: red; padding: 40px;">ERROR: ${error.message}</h1>`;
  }
}
