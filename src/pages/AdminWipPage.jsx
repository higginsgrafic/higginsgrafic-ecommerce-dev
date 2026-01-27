import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminWipPage() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-none px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">ADMIN</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">WIP</h1>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
              Hub d’elements en construcció dins l’admin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="h-10 shrink-0 rounded-full border border-border bg-background px-4 text-xs font-semibold tracking-[0.18em] uppercase text-foreground hover:bg-muted"
            >
              Admin
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border p-6">
          <div className="text-sm font-semibold text-foreground">Enllaços</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/admin"
              className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              Admin
            </Link>
            <Link
              to="/full-wide-slide"
              className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              FullWideSlide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
