import React, { useLayoutEffect, useState } from 'react';

const EpisodeDisplay = ({
  currentEpisode,
  isEditing,
  editedText,
  onTextChange,
  onSave,
  onCancel,
  onDoubleClick,
  layout = 'desktop'
}) => {
  if (layout === 'desktop') {
    const [desktopWidth, setDesktopWidth] = useState(null);

    useLayoutEffect(() => {
      const compute = () => {
        const cartButton = document.querySelector('[data-cart-button="1"]');
        if (!cartButton) {
          setDesktopWidth(null);
          return;
        }

        const desktopContainer = document.querySelector('[data-pdp-desktop="1"]');
        if (!desktopContainer) {
          setDesktopWidth(null);
          return;
        }

        const cartRect = cartButton.getBoundingClientRect();
        const desktopRect = desktopContainer.getBoundingClientRect();

        const left = 645;
        const rightLimit = cartRect.right - desktopRect.left;
        const width = Math.max(0, Math.round(rightLimit - left));
        if (width > 0) setDesktopWidth(`${width}px`);
      };

      const raf1 = requestAnimationFrame(compute);
      const raf2 = requestAnimationFrame(compute);
      window.addEventListener('resize', compute);
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        window.removeEventListener('resize', compute);
      };
    }, []);

    return (
      <div style={{ position: 'absolute', top: '133px', left: '645px', width: desktopWidth || '322.5px', height: 'calc(24pt * 6)', transform: 'scale(1.01)' }}>
        {isEditing ? (
          <div className="relative">
            <textarea
              value={editedText}
              onChange={(e) => onTextChange(e.target.value)}
              className="font-roboto font-normal w-full h-full p-2 border-2 border-blue-500 rounded resize-none focus:outline-none focus:border-blue-600"
              style={{ fontSize: '16pt', lineHeight: '24pt', height: 'calc(24pt * 6)' }}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={onSave}
                className="bg-green-600 text-white px-4 py-1 rounded text-sm font-oswald hover:bg-green-700 transition-colors"
              >
                GUARDAR
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-400 text-white px-4 py-1 rounded text-sm font-oswald hover:bg-gray-500 transition-colors"
              >
                CANCEL·LAR
              </button>
            </div>
          </div>
        ) : (
          <div
            className="font-roboto font-normal cursor-pointer hover:bg-gray-50 transition-colors p-1 rounded"
            style={{
              fontSize: '16pt',
              lineHeight: '24pt',
              height: 'calc(24pt * 6)',
              color: 'hsl(var(--foreground))',
              overflow: 'hidden',
              letterSpacing: '0em',
              wordSpacing: '0em'
            }}
            onDoubleClick={onDoubleClick}
            title="Fes doble clic per editar"
          >
            {currentEpisode.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6">
      {isEditing ? (
        <div>
          <textarea
            value={editedText}
            onChange={(e) => onTextChange(e.target.value)}
            className="font-roboto w-full p-4 border-2 border-blue-500 rounded-lg resize-none focus:outline-none text-base"
            rows={7}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={onSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-oswald hover:bg-green-700"
            >
              GUARDAR
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg font-oswald hover:bg-gray-500"
            >
              CANCEL·LAR
            </button>
          </div>
        </div>
      ) : (
        <div
          className="font-roboto text-base leading-relaxed cursor-pointer p-4 rounded-lg border border-gray-300"
          onDoubleClick={onDoubleClick}
          title="Fes doble clic per editar"
        >
          {currentEpisode.text}
        </div>
      )}
    </div>
  );
};

export default EpisodeDisplay;
