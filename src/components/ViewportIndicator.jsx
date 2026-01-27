import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

function ViewportIndicator({ visible = true, onClose }) {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!visible) return null;

  // Calcular aspect ratio simplificat
  const calculateAspectRatio = (width, height) => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const w = Math.round(width / divisor);
    const h = Math.round(height / divisor);

    // Comprovar ratios comuns
    if (Math.abs(width / height - 16/9) < 0.05) return '16:9';
    if (Math.abs(width / height - 16/10) < 0.05) return '16:10';
    if (Math.abs(width / height - 4/3) < 0.05) return '4:3';
    if (Math.abs(width / height - 3/2) < 0.05) return '3:2';
    if (Math.abs(width / height - 21/9) < 0.05) return '21:9';

    return `${w}:${h}`;
  };

  // Detectar tipus de dispositiu
  const getDeviceType = (width) => {
    if (width < 640) return { type: 'Mòbil', icon: Smartphone, color: 'bg-blue-500' };
    if (width < 1024) return { type: 'Tablet', icon: Tablet, color: 'bg-green-500' };
    if (width < 1920) return { type: 'Desktop', icon: Monitor, color: 'bg-blue-500' };
    return { type: 'Desktop Gran', icon: Monitor, color: 'bg-red-500' };
  };

  // Detectar orientació
  const getOrientation = (width, height) => {
    return width > height ? 'Horitzontal' : 'Vertical';
  };

  // Component de marc visual
  const ViewportFrame = () => (
    <>
      {/* Marc superior */}
      <div className="fixed top-0 left-0 right-0 h-0 border-t-4 border-blue-500 z-[9999] pointer-events-none debug-exempt"
           style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
        <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-b text-xs font-mono font-bold shadow-lg">
          {dimensions.width}px
        </div>
      </div>

      {/* Marc inferior */}
      <div className="fixed bottom-0 left-0 right-0 h-0 border-b-4 border-blue-500 z-[9999] pointer-events-none debug-exempt"
           style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-t text-xs font-mono font-bold shadow-lg">
          {dimensions.width}px
        </div>
      </div>

      {/* Marc esquerre */}
      <div className="fixed top-0 bottom-0 left-0 w-0 border-l-4 border-green-500 z-[9999] pointer-events-none debug-exempt"
           style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-green-500 text-white px-2 py-1 rounded-r text-xs font-mono font-bold shadow-lg writing-mode-vertical">
          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            {dimensions.height}px
          </div>
        </div>
      </div>

      {/* Marc dret */}
      <div className="fixed top-0 bottom-0 right-0 w-0 border-r-4 border-green-500 z-[9999] pointer-events-none debug-exempt"
           style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-500 text-white px-2 py-1 rounded-l text-xs font-mono font-bold shadow-lg">
          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            {dimensions.height}px
          </div>
        </div>
      </div>

      {/* Cantonada superior esquerra - Info del dispositiu */}
      <div className="fixed top-2 left-2 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-lg shadow-xl z-[9999] pointer-events-none px-3 py-2 debug-exempt">
        <div className="flex items-center gap-2">
          {getDeviceType(dimensions.width).icon === Smartphone && <Smartphone className="w-4 h-4" />}
          {getDeviceType(dimensions.width).icon === Tablet && <Tablet className="w-4 h-4" />}
          {getDeviceType(dimensions.width).icon === Monitor && <Monitor className="w-4 h-4" />}
          <span className="text-xs font-bold">{getDeviceType(dimensions.width).type}</span>
        </div>
        <div className="text-xs font-mono mt-1">{calculateAspectRatio(dimensions.width, dimensions.height)}</div>
        <div className="text-xs mt-1">{getOrientation(dimensions.width, dimensions.height)}</div>
      </div>

      {/* Botó de tancar a la cantonada superior dreta */}
      {onClose && (
        <button
          onClick={onClose}
          className="fixed top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-xl z-[9999] transition-all hover:scale-110 debug-exempt"
          aria-label="Tancar marc"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </>
  );

  return <ViewportFrame />;
}

export default ViewportIndicator;
