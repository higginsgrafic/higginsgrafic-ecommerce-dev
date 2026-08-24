import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2, Shuffle, Copy } from 'lucide-react';
import SEO from '@/components/SEO';
import { supabase } from '@/api/supabase-products';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const generatePassword = () => {
    const lower = 'abcdefghijkmnpqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const symbols = '!@#$%&*?';
    const all = lower + upper + digits + symbols;
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    setSuggestion(pwd);
    setCopied(false);
  };

  const copySuggestion = () => {
    if (!suggestion) return;
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useSuggestion = () => {
    setPassword(suggestion);
    setConfirmPassword(suggestion);
    setShowPassword(true);
  };

  useEffect(() => {
    const initSession = async () => {
      if (!supabase?.auth) {
        setError('Supabase auth no disponible');
        setSessionReady(true);
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          const hash = window.location.hash;
          if (hash.includes('access_token') || hash.includes('type=recovery')) {
            const { error: hashError } = await supabase.auth.getSession();
            if (hashError) {
              setError('L\'enllaç de recuperació no és vàlid o ha caducat.');
            }
          } else {
            setError('L\'enllaç de recuperació no és vàlid o ha caducat.');
          }
        }
      } catch {
        setError('No s\'ha pogut verificar l\'enllaç de recuperació.');
      } finally {
        setSessionReady(true);
      }
    };
    initSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contrasenya ha de tenir com a mínim 6 caràcters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les contrasenyes no coincideixen.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'No s\'ha pogut actualitzar la contrasenya.');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.message || 'Error actualitzant la contrasenya.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Recuperació de contrasenya — Higgins Gràfic" />
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md pt-[129px] lg:pt-[145px]">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-neutral-100 rounded-full">
                <KeyRound className="w-8 h-8 text-neutral-700" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">
              Nova contrasenya
            </h1>
            <p className="text-center text-neutral-500 text-sm mb-6">
              Introdueix la teva nova contrasenya per recuperar l'accés al compte
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {suggestion && !success && (
              <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-neutral-900 break-all">{suggestion}</code>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={copySuggestion}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded"
                      title={copied ? 'Copiat!' : 'Copia'}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={useSuggestion}
                      className="text-xs px-2 py-1 bg-neutral-900 text-white rounded hover:bg-neutral-800"
                    >
                      Usa-la
                    </button>
                  </div>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">Copiada al porta-retalls</p>
                )}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Contrasenya actualitzada. Redirigint a l'inici de sessió...</span>
              </div>
            )}

            {!success && sessionReady && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  Proposa una contrasenya aleatòria
                </button>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nova contrasenya
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="Mínim 6 caràcters"
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

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Confirmar contrasenya
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="Repeteix la contrasenya"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Actualitzant...' : 'Actualitza la contrasenya'}
                </button>
              </form>
            )}

            {error && (
              <p className="text-center text-sm text-neutral-500 mt-6">
                <Link to="/login" className="text-neutral-900 font-medium hover:underline">
                  Torna a l'inici de sessió
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
