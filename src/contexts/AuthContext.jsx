import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabase-products';

const AuthContext = createContext();

const DEFAULT_VALUE = {
  user: null,
  authReady: false,
  signIn: async () => ({ ok: false, error: 'AuthProvider no disponible' }),
  signUp: async () => ({ ok: false, error: 'AuthProvider no disponible' }),
  signOut: async () => {},
  resetPassword: async () => ({ ok: false, error: 'AuthProvider no disponible' }),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribe = null;

    const init = async () => {
      if (!supabase?.auth) {
        setAuthReady(true);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        setUser(data?.session?.user || null);
      } catch {
        setUser(null);
      } finally {
        setAuthReady(true);
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      unsubscribe = listener?.subscription?.unsubscribe || null;
    };

    init();

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase?.auth) return { ok: false, error: 'Supabase auth no disponible' };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { ok: false, error: error.message };
      setUser(data?.user || null);
      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: err.message || 'Error iniciant sessió' };
    }
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (!supabase?.auth) return { ok: false, error: 'Supabase auth no disponible' };
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName || '' },
        },
      });
      if (error) return { ok: false, error: error.message };
      setUser(data?.user || null);
      return { ok: true, error: null, needsConfirmation: !data?.session };
    } catch (err) {
      return { ok: false, error: err.message || 'Error registrant' };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase?.auth) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const resetPassword = useCallback(async ({ email }) => {
    if (!supabase?.auth) return { ok: false, error: 'Supabase auth no disponible' };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: err.message || 'Error enviant email' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, authReady, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext) || DEFAULT_VALUE;
}
