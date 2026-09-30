import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import { Lock, Eye, EyeOff } from 'lucide-react';
import SEO from '@/components/SEO';

export default function AdminLoginPage() {
  return (
    <AdminProvider>
      <AdminLoginPageInner />
    </AdminProvider>
  );
}

function AdminLoginPageInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { enableAdmin, enableAdminWithGoogle, isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const nextPath = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search || '');
      const raw = params.get('next');
      if (!raw) return '/admin';
      if (raw.startsWith('/')) return raw;
      return '/admin';
    } catch {
      return '/admin';
    }
  }, [location.search]);

  React.useEffect(() => {
    if (isAdmin) {
      navigate(nextPath);
    }
  }, [isAdmin, navigate, nextPath]);

  const handleGoogleLogin = async () => {
    setError('');
    const redirectTo = `${window.location.origin}${nextPath}`;
    const res = await enableAdminWithGoogle({ redirectTo });
    if (!res?.ok) {
      setError(res?.error || 'No s\'ha pogut iniciar sessió amb Google');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    const res = await enableAdmin({ email, password });
    setLoading(false);
    if (res?.ok) {
      navigate(nextPath);
      return;
    }
    setError(res?.error || 'No s\'ha pogut iniciar sessió');
  };

  return (
    <>
      <SEO title="Login Admin" />
      <div className="min-h-screen bg-paper-soft flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-paper rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-ink-strong mb-2">
              Accés Administrador
            </h1>
            <p className="text-center text-ink-2 mb-6">
              Inicieu sessió per accedir al panell d'administració
            </p>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-paper border border-line-strong text-ink-strong py-3 rounded-lg font-medium hover:bg-paper-soft transition-colors"
            >
              Entreu amb Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-paper px-3 text-xs text-ink-soft">o</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink-2 mb-2">
                  Correu electrònic
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-line-strong rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="email@domini.com"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink-2 mb-2">
                  Contrasenya
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-line-strong rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-ink-2 transition-colors"
                    aria-label={showPassword ? 'Amagar contrasenya' : 'Mostrar contrasenya'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-paper py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {loading ? 'Accedint...' : 'Entreu'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-ink-2 hover:text-ink-strong transition-colors"
              >
                Torneu a l'inici
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-ink-soft">
            Accés restringit a administradors
          </div>
        </div>
      </div>
    </>
  );
}
