import React from 'react';
import { Layers, LayoutGrid } from 'lucide-react';

export default function MegaCatalogPanel({ megaTileSize }) {
  if (!megaTileSize) return null;

  return (
    <div
      className="absolute top-0 z-[20]"
      style={{
        width: `${Math.round(megaTileSize * (4 / 3))}px`,
        height: `${megaTileSize}px`,
        right: 0,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md bg-muted">
        <button
          type="button"
          aria-label="CATÀLEG"
          className="group absolute left-0 top-0 flex h-1/2 w-full items-center justify-center bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
        >
          <LayoutGrid
            className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80 group-hover:opacity-0"
            style={{ left: `${Math.round(megaTileSize * (13 / 12))}px` }}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-end whitespace-nowrap text-right font-roboto text-[13px] font-bold uppercase text-foreground opacity-0 group-hover:opacity-100"
            style={{ paddingRight: `${Math.round(megaTileSize / 4 - 10)}px` }}
          >
            Catàleg
          </span>
        </button>

        <button
          type="button"
          aria-label="COL·LECCIÓ"
          className="group absolute left-0 bottom-0 flex h-1/2 w-full items-center justify-center bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
        >
          <Layers
            className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80 group-hover:opacity-0"
            style={{ left: `${Math.round(megaTileSize * (13 / 12))}px` }}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-end whitespace-nowrap text-right font-roboto text-[13px] font-bold uppercase text-foreground opacity-0 group-hover:opacity-100"
            style={{ paddingRight: `${Math.round(megaTileSize / 4 - 10)}px` }}
          >
            Col·lecció
          </span>
        </button>
      </div>
    </div>
  );
}
