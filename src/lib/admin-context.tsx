import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const AUTH_TIMEOUT_MS = 8000;

interface AdminContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAdmin = useCallback(async (email: string | undefined, uid: string | undefined) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }
    // First check the legacy admins table
    const { data: adminData } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    if (adminData) {
      setIsAdmin(true);
      return;
    }
    // Then check profiles.role via is_admin() RPC
    if (uid) {
      const { data: rpcResult } = await supabase.rpc('is_admin');
      if (rpcResult === true) {
        setIsAdmin(true);
        return;
      }
    }
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, AUTH_TIMEOUT_MS);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        checkAdmin(session?.user?.email, session?.user?.id).finally(() => {
          if (mounted) setLoading(false);
        });
      })
      .catch(() => {
        if (mounted) {
          setAuthError('تعذّر الاتصال بالخادم. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.');
          setLoading(false);
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      (async () => {
        await checkAdmin(session?.user?.email, session?.user?.id);
      })();
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  // Auto-logout on idle
  useEffect(() => {
    if (!session) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        supabase.auth.signOut();
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'بيانات الدخول غير صحيحة' };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AdminContext.Provider value={{ session, user, loading, isAdmin, authError, signIn, signOut }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
