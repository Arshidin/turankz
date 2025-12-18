import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'farmer' | 'mpk';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roleName: string;
}

const roleNames: Record<UserRole, string> = {
  admin: 'Admin',
  farmer: 'Farmer',
  mpk: 'Meat Processing Plant',
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('farmer');

  // Sync role from database on mount and when auth state changes
  useEffect(() => {
    const fetchRole = async (userId: string) => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data?.role) {
        setRole(data.role as UserRole);
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole('farmer');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, roleName: roleNames[role] }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
