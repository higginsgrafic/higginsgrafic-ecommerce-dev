import React from 'react';
import { Link } from 'react-router-dom';

function LabHomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">LAB</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">Hub</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-black/60">
            Punts d’entrada del LAB (test, demos i WIP).
          </p>
        </div>

        <div className="mt-10 grid gap-3">
          <Link to="/lab/proves" className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.03]">
            <div className="text-sm font-semibold text-black">Proves</div>
            <div className="mt-1 text-xs text-black/60">/lab/proves</div>
          </Link>

          <Link to="/lab/demos" className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.03]">
            <div className="text-sm font-semibold text-black">Demos</div>
            <div className="mt-1 text-xs text-black/60">/lab/demos</div>
          </Link>

          <Link to="/lab/wip" className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.03]">
            <div className="text-sm font-semibold text-black">WIP</div>
            <div className="mt-1 text-xs text-black/60">/lab/wip</div>
          </Link>
        </div>

        <div className="mt-10 rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/60">
          La col·lecció LAB es manté a{' '}
          <Link to="/lab/proves" className="font-semibold text-black/80 underline underline-offset-4 hover:text-black">
            /lab/proves
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

export default LabHomePage;
