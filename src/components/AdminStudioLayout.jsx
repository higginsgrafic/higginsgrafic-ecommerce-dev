import React, { useMemo } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import AdminMegaMenu from '@/components/AdminMegaMenu';

export default function AdminStudioLayout() {
  const { isAdmin, authReady } = useAdmin();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const path = `${location.pathname}${location.search || ''}${location.hash || ''}`;
    return `/admin-login?next=${encodeURIComponent(path)}`;
  }, [location.pathname, location.search, location.hash]);

  if (!authReady) return null;
  if (!isAdmin) return <Navigate to={redirectTo} replace />;

  return (
    <div className="min-h-screen bg-muted">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 min-h-screen flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="p-2 bg-foreground rounded-xl shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-whiteStrong" />
              </div>
            </Link>

            <AdminMegaMenu />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
