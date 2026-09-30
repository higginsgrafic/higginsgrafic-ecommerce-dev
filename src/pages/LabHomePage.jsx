import React from 'react';
import { Link } from 'react-router-dom';

function LabHomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-ink-pure/45">LAB</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink-pure sm:text-4xl">Hub</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-pure/60">
            Punts d’entrada del LAB (test, demos i WIP).
          </p>
        </div>

        <div className="mt-10 grid gap-3">
          <Link to="/lab/demos" className="rounded-xl border border-ink-pure/10 p-4 hover:bg-black/[0.03]">
            <div className="text-sm font-semibold text-ink-pure">Demos</div>
            <div className="mt-1 text-xs text-ink-pure/60">/lab/demos</div>
          </Link>

          <Link to="/lab/wip" className="rounded-xl border border-ink-pure/10 p-4 hover:bg-black/[0.03]">
            <div className="text-sm font-semibold text-ink-pure">WIP</div>
            <div className="mt-1 text-xs text-ink-pure/60">/lab/wip</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LabHomePage;
