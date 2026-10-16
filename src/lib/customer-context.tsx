import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface CustomerProfile {
  id: string;
  full_name: string;
  phone: string | null;  role: string;
  created_at: string;
}

interface CustomerContextValue {
  session: Session | null;
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadProfile = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
      .eq('id', uid)
      .maybeSingle();
    if (error || !data) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    setProfile(data as CustomerProfile);
    setIsAdmin((data as CustomerProfile).role === 'admin');
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        loadProfile(session?.user?.id).finally(() => {
          if (mounted) setLoading(false);
        });
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      (async () => {
        await loadProfile(session?.user?.id);
      })();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'بيانات الدخول غير صحيحة' };
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });
    if (error) {
      console.error('Signup error:', error.message, error.status);
      if (error.message.includes('already') || error.message.includes('registered'))
        return { error: 'هذا البريد الإلكتروني مسجل بالفعل. سجّل الدخول بدلاً من ذلك.' };
      if (error.message.includes('password') && error.message.includes('6'))
        return { error: 'كلمة المرور ضعيفة. استخدم 12 حرف على الأقل.' };
      return { error: `تعذر إنشاء الحساب: ${error.message}` };
    }
    if (data.user && !data.session) {
      return { error: null };
    }
    return { error: null };
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/account`
        : '/account';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error.message);
        return { error: 'تعذر تسجيل الدخول بحساب جوجل. حاول مرة أخرى.' };
      }

      return { error: null };
    } catch (err) {
      console.error('Google sign-in unexpected error:', err);
      return { error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول بجوجل.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    await loadProfile(user?.id);
  };

  return (
    <CustomerContext.Provider value={{ session, user, profile, loading, isAdmin, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
