/**
 * PROFILE STATUS & COMPLIANCE SECTION
 * 
 * Read-only status information.
 * Shows role, account_status, activation date, and admin notes.
 */

import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import type { AccountStatus } from '@/lib/account-status';

interface ProfileStatusSectionProps {
  role: 'farmer' | 'mpk';
  accountStatus: AccountStatus;
  registrationStatus: string;
  createdAt: string;
  updatedAt: string;
  // Farmer-specific
  grading?: 'observer' | 'declared_supplier' | 'standard_supplier';
  reliability?: 'high' | 'medium' | 'low';
  isRestricted?: boolean;
  restrictionReason?: string | null;
  // MPK-specific
  mpkStatus?: 'active' | 'restricted' | 'inactive';
  isRequestRestricted?: boolean;
}

function getAccountStatusBadge(status: AccountStatus, t: (key: string) => string) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {t('profile.status.active')}
        </Badge>
      );
    case 'observer':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <Eye className="w-3 h-3 mr-1" />
          {t('profile.status.observer')}
        </Badge>
      );
    case 'suspended':
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          <XCircle className="w-3 h-3 mr-1" />
          {t('profile.status.suspended')}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          {t('profile.status.pending')}
        </Badge>
      );
  }
}

function getReliabilityBadge(reliability: 'high' | 'medium' | 'low', t: (key: string) => string) {
  switch (reliability) {
    case 'high':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          {t('profile.status.reliabilityHigh')}
        </Badge>
      );
    case 'medium':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          {t('profile.status.reliabilityMedium')}
        </Badge>
      );
    case 'low':
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          {t('profile.status.reliabilityLow')}
        </Badge>
      );
  }
}

function getGradingLabel(grading: string, t: (key: string) => string) {
  switch (grading) {
    case 'observer':
      return t('farmers.observer');
    case 'declared_supplier':
      return t('farmers.declaredSupplier');
    case 'standard_supplier':
      return t('farmers.standardSupplier');
    default:
      return grading;
  }
}

export function ProfileStatusSection({
  role,
  accountStatus,
  registrationStatus,
  createdAt,
  updatedAt,
  grading,
  reliability,
  isRestricted,
  restrictionReason,
  mpkStatus,
  isRequestRestricted,
}: ProfileStatusSectionProps) {
  const { t } = useTranslation();

  const roleLabel = role === 'farmer' ? t('roles.farmer') : t('roles.mpk');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-base font-medium">
            {t('profile.status.title')}
          </CardTitle>
        </div>
        <CardDescription>
          {t('profile.status.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {t('profile.status.accountStatus')}
            </p>
            {getAccountStatusBadge(accountStatus, t)}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">
              {t('profile.status.role')}
            </p>
            <Badge variant="outline">{roleLabel}</Badge>
          </div>
        </div>

        {/* Restriction Warning */}
        {(isRestricted || isRequestRestricted) && (
          <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {t('profile.status.restricted')}
              </p>
              {restrictionReason && (
                <p className="text-sm text-muted-foreground mt-1">
                  {restrictionReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Role-specific status */}
        {role === 'farmer' && grading && reliability && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t('profile.status.grading')}
              </p>
              <p className="font-medium">{getGradingLabel(grading, t)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t('profile.status.reliability')}
              </p>
              {getReliabilityBadge(reliability, t)}
            </div>
          </div>
        )}

        {role === 'mpk' && mpkStatus && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t('profile.status.mpkStatus')}
              </p>
              <Badge variant={mpkStatus === 'active' ? 'default' : 'secondary'}>
                {mpkStatus}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t('profile.status.requestAccess')}
              </p>
              <Badge variant={isRequestRestricted ? 'destructive' : 'default'}>
                {isRequestRestricted ? t('profile.status.restricted') : t('profile.status.enabled')}
              </Badge>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {t('profile.status.memberSince')}
            </p>
            <p className="text-sm">{format(new Date(createdAt), 'dd MMM yyyy')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {t('profile.status.lastUpdated')}
            </p>
            <p className="text-sm">{format(new Date(updatedAt), 'dd MMM yyyy, HH:mm')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
