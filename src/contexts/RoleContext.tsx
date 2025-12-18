import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

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
  const { role: authRole, isLoading } = useAuthContext();
  const [role, setRole] = useState<UserRole>('farmer');

  // Keep UI role in sync with authenticated role from backend
  useEffect(() => {
    if (authRole) {
      setRole(authRole);
      return;
    }

    // Once auth has finished loading and there is no authenticated role, reset to default.
    if (!isLoading) {
      setRole('farmer');
    }
  }, [authRole, isLoading]);

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
