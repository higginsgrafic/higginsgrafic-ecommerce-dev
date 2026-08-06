import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, X } from 'lucide-react';

export default function RegisterOverlay({ onClose }) {
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { signUp, signIn, resetPassword } = useAuth();

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setSuccess('');
    setResetSent(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('La contrasenya ha de tenir com a mínim 6 caràcters');
      return;
    }

    setLoading(true);
    const res = await signUp({ email, password, fullName });
    setLoading(false);

    if (res.ok) {
      if (res.needsConfirmation) {
        setSuccess('T\'hem enviat un email de confirmació. Verifica el teu compte per continuar.');
      } else {
        onClose();
      }
    } else {
      setError(res.error || 'No s\'ha pogut completar el registre');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn({ email, password });
    setLoading(false);
    if (res.ok) {
      onClose();
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
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors"
          aria-label="Tancar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center mb-6">
            {mode === 'register'
              ? <UserPlus className="w-8 h-8 text-neutral-700" />
              : <LogIn className="w-8 h-8 text-neutral-700" />
            }
        </div>

        <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">
          {mode === 'register' ? 'Crea el teu compte' : 'Inicia sessió'}
        </h1>
        <p className="text-center text-neutral-500 text-sm mb-6">
          {mode === 'register'
            ? 'per a poder comprar i fer el seguiment de les comandes.'
            : 'per a poder comprar i fer el seguiment de les comandes.'
          }
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}

        {resetSent && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            T'hem enviat un email per restablir la contrasenya.
          </div>
        )}

        <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  autoComplete="off"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="El teu nom"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                required
                autoComplete="off"
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
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="..."
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
            {loading
              ? (mode === 'register' ? 'Registrant...' : 'Iniciant sessió...')
              : (mode === 'register' ? 'Registra\'t' : 'Iniciar sessió')
            }
          </button>
        </form>

        {mode === 'login' && (
          <button
            onClick={handleResetPassword}
            disabled={resetting}
            className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 mt-4"
          >
            {resetting ? 'Enviant...' : 'Has oblidat la contrasenya?'}
          </button>
        )}

        <p className="text-center text-sm text-neutral-500 mt-6">
          {mode === 'register' ? (
            <>Ja tens compte?{' '}
              <button type="button" onClick={() => switchMode('login')} className="text-neutral-900 font-medium hover:underline">
                Inicia sessió
              </button>
            </>
          ) : (
            <>No tens compte?{' '}
              <button type="button" onClick={() => switchMode('register')} className="text-neutral-900 font-medium hover:underline">
                Registra't
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
