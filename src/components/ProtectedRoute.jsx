import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * ProtectedRoute — embolcalla rutes que només poden visitar administradors autenticats.
 *
 * - Si `authReady` encara no és cert, mostra un loader (evita flash de la pàgina de login).
 * - Si no és admin, redirigeix a `/admin-login` preservant la ruta original per si l'usuari
 *   vol tornar-hi després d'autenticar-se.
 * - Si és admin, renderitza els `children`.
 */
export default function ProtectedRoute({ children }) {
  const { isAdmin, authReady } = useAdmin();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Verificant accés…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" state={{ from: location.pathname }} replace />;
  }

  return children;
}