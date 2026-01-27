import React, { useLayoutEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EpisodeControls = ({ currentEpisode, onPrevious, onNext, layout = 'desktop' }) => {
  if (layout === 'desktop') {
    const [arrowsLeft, setArrowsLeft] = useState(null);

    useLayoutEffect(() => {
      const compute = () => {
        const cartButton = document.querySelector('[data-cart-button="1"]');
        if (!cartButton) {
          setArrowsLeft(null);
          return;
        }

        const desktopContainer = document.querySelector('[data-pdp-desktop="1"]');
        if (!desktopContainer) {
          setArrowsLeft(null);
          return;
        }

        const cartRect = cartButton.getBoundingClientRect();
        const desktopRect = desktopContainer.getBoundingClientRect();

        const rightLimit = cartRect.right - desktopRect.left;
        const desiredLeft = rightLimit - 70;

        const minLeft = 0;
        const maxLeft = desktopRect.width - 70;
        const clampedLeft = Math.max(minLeft, Math.min(desiredLeft, maxLeft));

        setArrowsLeft(`${Math.round(clampedLeft)}px`);
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
      <>
        <div className="font-roboto text-right flex flex-col items-end justify-center gap-0.5" style={{ position: 'absolute', top: '78px', left: '768px', width: '219.5px', height: '32px', transform: 'scale(1.01)', paddingRight: '8px', zIndex: 2 }}>
          <div style={{ backgroundColor: 'transparent', borderRadius: '3px', padding: '3px 8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="overflow-hidden whitespace-nowrap leading-tight" style={{ textOverflow: 'ellipsis', fontSize: '8pt', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
              {currentEpisode.title}
            </span>
            <span className="font-light text-[7pt] leading-tight" style={{ color: 'hsl(var(--foreground))', fontWeight: 300 }}>
              Temporada {currentEpisode.season} - Episodi {currentEpisode.episode}
            </span>
          </div>
        </div>

        <div style={{ position: 'absolute', top: '78px', left: arrowsLeft || '975px', height: '32px', width: '70px', transform: 'scale(1.01)', zIndex: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <button
            onClick={onPrevious}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--foreground))',
              padding: 0,
              margin: 0,
              flexShrink: 0
            }}
            aria-label="Episodi anterior"
            title="Episodi anterior"
          >
            <ChevronLeft strokeWidth={2.5} style={{ width: '20px', height: '20px', display: 'block' }} />
          </button>
          <button
            onClick={onNext}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--foreground))',
              padding: 0,
              margin: 0,
              flexShrink: 0
            }}
            aria-label="Episodi següent"
            title="Episodi següent"
          >
            <ChevronRight strokeWidth={2.5} style={{ width: '20px', height: '20px', display: 'block' }} />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 ml-3">
      <div className="font-roboto text-xs flex flex-col gap-0.5 bg-[#F9FAFB] px-3 py-2" style={{ borderRadius: '3px' }}>
        <span className="leading-tight" style={{ fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>
          {currentEpisode.title}
        </span>
        <span className="font-light text-[10px] leading-tight" style={{ fontWeight: 300, color: 'hsl(var(--foreground))' }}>
          Temporada {currentEpisode.season} - Episodi {currentEpisode.episode}
        </span>
      </div>
      <button
        onClick={onPrevious}
        className="bg-transparent text-foreground p-2"
        aria-label="Episodi anterior"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
      </button>
      <button
        onClick={onNext}
        className="bg-transparent text-foreground p-2"
        aria-label="Episodi següent"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default EpisodeControls;
