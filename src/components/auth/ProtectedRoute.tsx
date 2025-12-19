/**
 * PROTECTED ROUTE COMPONENT
 * 
 * Enforces role + account_status guards on ALL routes.
 * Redirects to AccessRestricted page with reason when blocked.
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { AppRole } from '@/hooks/useAuth';
import { AccountStatus } from '@/lib/account-status';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  allowedStatuses?: AccountStatus[];
  requireActive?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  allowedStatuses,
  requireActive = false,
}: ProtectedRouteProps) {
  const { user, role, registrationStatus, isLoading: authLoading } = useAuthContext();
  const { accountStatus, isLoading: statusLoading, checkRouteAccess } = useAccountStatus();
  const location = useLocation();

  // Show loading while checking auth and status
  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - redirect to landing page
  if (!user) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  // Role is still loading (user exists but role hasn't been fetched yet)
  // This prevents premature redirect while async role fetch is in progress
  if (user && !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If registration is still pending, allow read-only routes (dashboard + price grid + herd overview)
  // and redirect everything else to the Pending page.
  if (role !== 'admin' && registrationStatus === 'pending') {
    const readOnlyAllowedPaths = new Set<string>(['/overview', '/price-grid', '/herd-overview', '/pending', '/welcome']);
    if (!readOnlyAllowedPaths.has(location.pathname)) {
      return <Navigate to="/pending" replace />;
    }
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate home based on role
    const roleHomePaths: Record<AppRole, string> = {
      admin: '/overview',
      farmer: '/overview',
      mpk: '/mpk/market',
    };
    return <Navigate to={roleHomePaths[role]} replace />;
  }

  // Check account status if specific statuses are required
  if (allowedStatuses && !allowedStatuses.includes(accountStatus)) {
    return (
      <Navigate 
        to="/access-restricted" 
        state={{ 
          reason: accountStatus === 'observer' 
            ? 'This feature requires an active account. Please wait for Admin activation.'
            : 'Your account has been suspended. Please contact Admin.',
          requiredStatus: allowedStatuses.join(', '),
        }} 
        replace 
      />
    );
  }

  // Check if route requires active status
  if (requireActive && accountStatus !== 'active' && role !== 'admin') {
    const routeCheck = checkRouteAccess(location.pathname);
    
    if (!routeCheck.accessible) {
      return (
        <Navigate 
          to="/access-restricted" 
          state={{ reason: routeCheck.reason }} 
          replace 
        />
      );
    }
  }

  return <>{children}</>;
}
