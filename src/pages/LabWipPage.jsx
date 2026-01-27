import React from 'react';
import { Link } from 'react-router-dom';

function LabWipPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">LAB</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">WIP</h1>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-black/60">
              Hub de pàgines en construcció. Quan hi hagi una WIP, quedarà publicada sota{' '}
              <span className="font-semibold text-black/70">/proves/wip-*</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/lab/demos"
              className="h-10 shrink-0 rounded-full border border-black/15 bg-white px-4 text-xs font-semibold tracking-[0.18em] uppercase text-black/70 hover:bg-black/5"
            >
              LAB Demos
            </Link>
            <Link
              to="/lab/proves"
              className="h-10 shrink-0 rounded-full border border-black/15 bg-white px-4 text-xs font-semibold tracking-[0.18em] uppercase text-black/70 hover:bg-black/5"
            >
              LAB Proves
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-black/15 p-6 text-sm text-black/60">
          Encara no hi ha WIP publicades.
        </div>
      </div>
    </div>
  );
}

export default LabWipPage;
