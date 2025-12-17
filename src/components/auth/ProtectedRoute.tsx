import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { AppRole } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  requireActive?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireActive = true 
}: ProtectedRouteProps) {
  const { user, role, registrationStatus, isLoading } = useAuthContext();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // No role assigned yet - redirect to auth (registration incomplete)
  if (!role) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user is active (for non-admin roles)
  if (requireActive && role !== 'admin' && registrationStatus !== 'active') {
    return <Navigate to="/pending" replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate home based on role
    const roleHomePaths: Record<AppRole, string> = {
      admin: '/admin/farmers',
      farmer: '/',
      mpk: '/mpk/market',
    };
    return <Navigate to={roleHomePaths[role]} replace />;
  }

  return <>{children}</>;
}
