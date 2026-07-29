import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import SEO from '@/components/SEO';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/perfil';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn({ email, password });
    setLoading(false);
    if (res.ok) {
      navigate(from);
    } else {
      setError(res.error || 'No s\'ha pogut iniciar sessió');
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Introdueix el teu email per recuperar la contrasenya');
      return;
    }
    setError('');
    setResetting(true);
    const res = await resetPassword({ email });
    setResetting(false);
    if (res.ok) {
      setResetSent(true);
    } else {
      setError(res.error || 'Error enviant email de recuperació');
    }
  };

  return (
    <>
      <SEO title="Inici de sessió — Higgins Gràfic" />
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md pt-[129px] lg:pt-[145px]">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-neutral-100 rounded-full">
                <LogIn className="w-8 h-8 text-neutral-700" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">
              Inicia sessió
            </h1>
            <p className="text-center text-neutral-500 text-sm mb-6">
              Accedeix al teu compte per comprar i fer seguiment de comandes
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {resetSent && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                T'hem enviat un email per restablir la contrasenya.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    placeholder="el-teu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Contrasenya
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    placeholder="La teva contrasenya"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciant sessió...' : 'Iniciar sessió'}
              </button>
            </form>

            <button
              onClick={handleResetPassword}
              disabled={resetting}
              className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 mt-4"
            >
              {resetting ? 'Enviant...' : 'Has oblidat la contrasenya?'}
            </button>

            <p className="text-center text-sm text-neutral-500 mt-6">
              No tens compte?{' '}
              <Link to="/register" className="text-neutral-900 font-medium hover:underline">
                Registra't
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
