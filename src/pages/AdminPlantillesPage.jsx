import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function AdminPlantillesPage() {
  return (
    <>
      <SEO title="Plantilles" description="Plantilles" />
      <div className="mx-auto max-w-[2000px] px-4 pt-16 pb-6 overflow-hidden sm:px-6 lg:px-8">
        <div className="py-10">
          <div className="text-sm font-semibold text-foreground uppercase tracking-wide">Plantilles</div>
          <div className="mt-3 border-l border-border">
            <Link
              to="/plantilla-cataleg-components"
              className="flex items-start gap-3 pl-3 pr-[28px] py-2 text-sm font-light text-foreground hover:bg-muted/60"
            >
              <span className="min-w-0 flex-1 whitespace-normal break-words text-left">Plantilla catàleg components</span>
              <span className="mt-0.5 text-xs text-muted-foreground">›</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
