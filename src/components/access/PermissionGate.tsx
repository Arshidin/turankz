import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { RolePermissions, UserRole } from '@/lib/access-control';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  children: ReactNode;
  /**
   * View permission to check
   */
  view?: keyof RolePermissions['canView'];
  /**
   * Action permission to check
   */
  action?: keyof RolePermissions['canAct'];
  /**
   * Specific roles that are allowed
   */
  allowedRoles?: UserRole[];
  /**
   * What to render when access is denied
   * - 'hide': renders nothing
   * - 'message': shows an access denied message
   * - ReactNode: custom fallback
   */
  fallback?: 'hide' | 'message' | ReactNode;
}

/**
 * PermissionGate - Conditionally renders children based on role permissions
 * 
 * Usage:
 * ```tsx
 * // Check view permission
 * <PermissionGate view="allFarmers">
 *   <FarmersList />
 * </PermissionGate>
 * 
 * // Check action permission
 * <PermissionGate action="updateFarmerGrading">
 *   <GradingControls />
 * </PermissionGate>
 * 
 * // Check specific roles
 * <PermissionGate allowedRoles={['admin']}>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * // Custom fallback
 * <PermissionGate view="auditLogs" fallback={<UpgradePrompt />}>
 *   <AuditLogViewer />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({ 
  children, 
  view, 
  action, 
  allowedRoles,
  fallback = 'hide' 
}: PermissionGateProps) {
  const { permissions, role } = usePermissions();
  
  let hasAccess = true;
  
  // Check view permission
  if (view && !permissions.canView[view]) {
    hasAccess = false;
  }
  
  // Check action permission
  if (action && !permissions.canAct[action]) {
    hasAccess = false;
  }
  
  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    hasAccess = false;
  }
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Handle fallback
  if (fallback === 'hide') {
    return null;
  }
  
  if (fallback === 'message') {
    return (
      <Alert variant="destructive" className="max-w-md">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to view this content. This area is restricted to authorized roles only.
        </AlertDescription>
      </Alert>
    );
  }
  
  return <>{fallback}</>;
}

/**
 * AdminOnly - Shorthand for admin-only content
 */
export function AdminOnly({ 
  children, 
  fallback = 'hide' 
}: { 
  children: ReactNode; 
  fallback?: 'hide' | 'message' | ReactNode;
}) {
  return (
    <PermissionGate allowedRoles={['admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * FarmerOnly - Shorthand for farmer-only content
 */
export function FarmerOnly({ 
  children, 
  fallback = 'hide' 
}: { 
  children: ReactNode; 
  fallback?: 'hide' | 'message' | ReactNode;
}) {
  return (
    <PermissionGate allowedRoles={['farmer']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * MpkOnly - Shorthand for MPK-only content
 */
export function MpkOnly({ 
  children, 
  fallback = 'hide' 
}: { 
  children: ReactNode; 
  fallback?: 'hide' | 'message' | ReactNode;
}) {
  return (
    <PermissionGate allowedRoles={['mpk']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
