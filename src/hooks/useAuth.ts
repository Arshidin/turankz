import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type AppRole = 'admin' | 'farmer' | 'mpk';
export type RegistrationStatus = 'pending' | 'active' | 'rejected' | 'clarification_needed';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  registrationStatus: RegistrationStatus | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    registrationStatus: null,
    isLoading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer role fetching to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            role: null,
            registrationStatus: null,
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Get role from user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleData?.role) {
        const role = roleData.role as AppRole;
        
        // Get registration status based on role
        let registrationStatus: RegistrationStatus | null = null;
        
        if (role === 'farmer') {
          const { data: farmerData } = await supabase
            .from('farmers')
            .select('registration_status')
            .eq('user_id', userId)
            .maybeSingle();
          registrationStatus = farmerData?.registration_status as RegistrationStatus || null;
        } else if (role === 'mpk') {
          const { data: mpkData } = await supabase
            .from('mpks')
            .select('registration_status')
            .eq('user_id', userId)
            .maybeSingle();
          registrationStatus = mpkData?.registration_status as RegistrationStatus || null;
        } else if (role === 'admin') {
          registrationStatus = 'active';
        }

        setAuthState(prev => ({
          ...prev,
          role,
          registrationStatus,
          isLoading: false,
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          role: null,
          registrationStatus: null,
          isLoading: false,
        }));
      }
    } catch (error) {
      logger.error('Failed to fetch user role', error, { action: 'fetchUserRole' });
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuthState({
        user: null,
        session: null,
        role: null,
        registrationStatus: null,
        isLoading: false,
      });
    }
    return { error };
  };

  const assignRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });
    return { error };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    assignRole,
    refetchRole: () => authState.user && fetchUserRole(authState.user.id),
  };
}
