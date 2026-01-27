import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChevronLeft, ChevronRight, LogOut, Lock, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/contexts/ToastContext';

export default function AdminBanner({ rulerInset = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, disableAdmin, bypassUnderConstruction, toggleBypassUnderConstruction } = useAdmin();
  const { info, error } = useToast();

  const handleLogout = async () => {
    await disableAdmin();
    window.location.href = '/';
  };

  const copyRouteToClipboard = async () => {
    const fullUrl = `${window.location.origin}${location.pathname}${location.search || ''}${location.hash || ''}`;

    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = fullUrl;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        info('URL copiada al porta-retalls');
        return;
      }

      const ok = fallbackCopy();
      if (!ok) throw new Error('copy_failed');
      info('URL copiada al porta-retalls');
    } catch (err) {
      error('No s\'ha pogut copiar la URL');
    }
  };

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[30000] bg-red-600 h-[40px] w-full flex items-center"
      style={rulerInset ? { top: `${rulerInset}px`, left: `${rulerInset}px`, right: 0 } : undefined}
    >
      {/* Left: Navigation Arrows */}
      <div className="flex items-center gap-1.5 pl-4">
        {/* Back Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          aria-label="Anar enrere"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
          <span className="sr-only">Enrere</span>
        </Button>

        {/* Logo GRÀFIC */}
        <Link to="/" className="relative z-10 pointer-events-auto block transition-transform hover:scale-105 active:scale-95" title="GRÀFIC - Inici">
          <img
            src="/custom_logos/brand/marca-grafic-logo.svg"
            alt="GRAFC"
            className="h-[17.5px] w-auto brightness-0 invert"
          />
        </Link>

        {/* Forward Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(1)}
          className="h-8 w-8 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          aria-label="Anar endavant"
        >
          <ChevronRight className="h-5 w-5 text-white" />
          <span className="sr-only">Endavant</span>
        </Button>
      </div>

      {/* Center: Administració - absolutely centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
        {isAdmin && (
          <div className="flex h-[30px] items-center gap-2 rounded-md px-2 hover:bg-red-700 transition-all">
            <span className="text-xs font-semibold text-white">EC bypass</span>
            <button
              type="button"
              role="switch"
              aria-checked={bypassUnderConstruction}
              onClick={toggleBypassUnderConstruction}
              className={`relative inline-flex h-4 w-8 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 ${
                bypassUnderConstruction ? 'bg-white/90 border-white/70' : 'bg-white/20 border-white/40'
              }`}
              title={bypassUnderConstruction ? 'EC bypass activat (feu clic per desactivar)' : 'EC bypass desactivat (feu clic per activar)'}
              aria-label={bypassUnderConstruction ? 'Desactiveu l\'EC bypass' : 'Activeu l\'EC bypass'}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-red-600 shadow transition-transform ${
                  bypassUnderConstruction ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        )}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:bg-red-700 transition-all px-3 py-1.5 rounded group"
        >
          <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Administració</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyRouteToClipboard}
            className="h-7 w-7 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            aria-label="Copieu l'URL"
            title="Copieu l'URL"
          >
            <Copy className="h-4 w-4 text-white" />
          </Button>
          <span className="text-xs text-white/70 font-mono">
            {location.pathname}
          </span>
        </div>
      </div>

      {/* Right: Admin Controls */}
      <div className="absolute right-4 flex items-center gap-2">
        {isAdmin ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 gap-1.5"
            title="Tanqueu la sessió"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs">Sortiu</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin-login')}
            className="h-8 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 gap-1.5"
            title="Entreu com a administrador"
          >
            <Lock className="w-4 h-4" />
            <span className="text-xs">Admin</span>
          </Button>
        )}
      </div>

    </div>
  );
}
