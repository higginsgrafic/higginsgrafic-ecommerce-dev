import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/api/supabase-products';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [authReady, setAuthReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [bypassUnderConstruction, setBypassUnderConstruction] = useState(() => {
    return false;
  });

  const allowedAdminEmails = (() => {
    const raw = (import.meta?.env?.VITE_ADMIN_EMAILS || '').toString().trim();
    if (!raw) return null;
    const parts = raw
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);
    return parts.length > 0 ? new Set(parts) : null;
  })();

  const isAllowedAdminEmail = (email) => {
    const normalized = (email || '').toString().trim().toLowerCase();
    if (!normalized) return false;
    if (!allowedAdminEmails) return true;
    return allowedAdminEmails.has(normalized);
  };

  const enableAdminWithGoogle = async ({ redirectTo } = {}) => {
    if (!supabase?.auth) return { ok: false, error: 'Supabase auth no disponible' };
    try {
      const options = {};
      if (redirectTo) {
        options.redirectTo = redirectTo;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options,
      });

      if (error) return { ok: false, error: error.message || 'Error autenticant amb Google' };
      return { ok: true, error: null };
    } catch {
      return { ok: false, error: 'Error autenticant amb Google' };
    }
  };

  useEffect(() => {
    let unsubscribe = null;

    const init = async () => {
      if (!supabase?.auth) {
        setAuthReady(true);
        setIsAdmin(false);
        setAdminEmail(null);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const email = data?.session?.user?.email || null;
        const ok = !!email && isAllowedAdminEmail(email);
        setAdminEmail(email);
        setIsAdmin(ok);

        if (ok) {
          const savedBypass = localStorage.getItem('bypassUnderConstruction');
          const bypass = savedBypass === null ? true : savedBypass === 'true';
          if (savedBypass === null) {
            localStorage.setItem('bypassUnderConstruction', 'true');
          }
          setBypassUnderConstruction(bypass);
        }
      } catch {
        setIsAdmin(false);
        setAdminEmail(null);
      } finally {
        setAuthReady(true);
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        const email = session?.user?.email || null;
        const ok = !!email && isAllowedAdminEmail(email);
        setAdminEmail(email);
        setIsAdmin(ok);
        if (!ok) {
          localStorage.removeItem('bypassUnderConstruction');
          setBypassUnderConstruction(false);
          setEditMode(false);
        }
      });

      unsubscribe = listener?.subscription?.unsubscribe || null;
    };

    init();

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Netejar el bypass quan l'usuari deixa de ser admin
  useEffect(() => {
    if (!isAdmin) {
      localStorage.removeItem('bypassUnderConstruction');
      setBypassUnderConstruction(false);
    }
  }, [isAdmin]);

  const enableAdmin = async ({ email, password }) => {
    if (!supabase?.auth) return { ok: false, error: 'Supabase auth no disponible' };
    const normalizedEmail = (email || '').toString().trim();
    if (!normalizedEmail) return { ok: false, error: 'Email obligatori' };
    if (!isAllowedAdminEmail(normalizedEmail)) return { ok: false, error: 'Email no autoritzat' };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: (password || '').toString(),
      });
      if (error) return { ok: false, error: error.message || 'Error autenticant' };
      const signedEmail = data?.user?.email || normalizedEmail;
      if (!isAllowedAdminEmail(signedEmail)) {
        await supabase.auth.signOut();
        return { ok: false, error: 'Email no autoritzat' };
      }
      localStorage.setItem('bypassUnderConstruction', 'true');
      setBypassUnderConstruction(true);
      return { ok: true, error: null };
    } catch {
      return { ok: false, error: 'Error autenticant' };
    }
  };

  const disableAdmin = async () => {
    localStorage.removeItem('bypassUnderConstruction');
    setIsAdmin(false);
    setEditMode(false);
    setBypassUnderConstruction(false);
    setAdminEmail(null);
    if (supabase?.auth) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
  };

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  const toggleBypassUnderConstruction = () => {
    // Només els administradors autenticats poden canviar el bypass
    if (!isAdmin) {
      console.warn('⚠️ Bypass Under Construction can only be toggled by admins');
      return;
    }
    setBypassUnderConstruction(prev => {
      const newValue = !prev;
      localStorage.setItem('bypassUnderConstruction', newValue.toString());
      console.log('🔄 Bypass Under Construction toggled:', newValue);
      return newValue;
    });
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      authReady,
      adminEmail,
      editMode,
      bypassUnderConstruction,
      setEditMode,
      toggleEditMode,
      toggleBypassUnderConstruction,
      enableAdmin,
      enableAdminWithGoogle,
      disableAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
