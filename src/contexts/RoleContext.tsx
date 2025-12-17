import { createContext, useContext, useState, ReactNode } from 'react';

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
