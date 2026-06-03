import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/api/supabase-products';

const AdminContext = createContext();

// ─────────────────────────────────────────────────────────────────────────
// BYPASS DE DESENVOLUPAMENT (NOMÉS LOCAL)
// Força `isAdmin = true` quan corres en mode dev (`import.meta.env.DEV`) i a
// `localhost`/`127.0.0.1`, perquè puguis veure el panell admin sense passar
// per l'autenticació de Supabase. Mai s'activa en producció, perquè el build
// de producció té `import.meta.env.DEV === false`.
// Per desactivar-lo a local: `localStorage.setItem('HG_DEV_FORCE_ADMIN','false')`.
// ─────────────────────────────────────────────────────────────────────────
const DEV_FORCE_ADMIN = (() => {
  try {
    if (!import.meta?.env?.DEV) return false;
    const host = (typeof window !== 'undefined') ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (!isLocal) return false;
    const flag = (typeof window !== 'undefined') ? window.localStorage.getItem('HG_DEV_FORCE_ADMIN') : null;
    if (flag === 'false') return false; // permet desactivar-lo explícitament
    return true;
  } catch {
    return false;
  }
})();

const DEV_FORCE_ADMIN_EMAIL = (() => {
  try {
    const raw = (import.meta?.env?.VITE_ADMIN_EMAILS || '').toString().trim();
    const first = raw.split(',').map((x) => x.trim()).filter(Boolean)[0];
    return first || 'dev-admin@localhost';
  } catch {
    return 'dev-admin@localhost';
  }
})();

export function AdminProvider({ children }) {
  const [authReady, setAuthReady] = useState(DEV_FORCE_ADMIN);
  const [adminEmail, setAdminEmail] = useState(DEV_FORCE_ADMIN ? DEV_FORCE_ADMIN_EMAIL : null);
  const [isAdmin, setIsAdmin] = useState(DEV_FORCE_ADMIN);

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
      // Bypass de dev (només local): mantenim isAdmin=true i no consultem
      // Supabase, perquè la sessió absent no reseteji l'estat forçat.
      if (DEV_FORCE_ADMIN) {
        setIsAdmin(true);
        setAdminEmail(DEV_FORCE_ADMIN_EMAIL);
        setBypassUnderConstruction(true);
        setAuthReady(true);
        return;
      }

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
    try {
      sessionStorage.removeItem('HG_MEGA_PUBLIC_LAST_ACTIVITY_AT');
      sessionStorage.removeItem('HG_MEGA_PUBLIC_SELECTOR_STATE');
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('MEGA_TILE_SELECTOR_STEP_X');
      localStorage.removeItem('MEGA_TILE_SELECTOR_STEP_Y');
      localStorage.removeItem('MEGA_TILE_SELECTOR_V2_STEP_X');
      localStorage.removeItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
      localStorage.removeItem('MEGA_TILE_SELECTOR_TARGET');
      localStorage.removeItem('MEGA_TILE_SELECTOR_V2_TARGET');
    } catch {
      // ignore
    }
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
