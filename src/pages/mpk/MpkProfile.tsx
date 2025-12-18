/**
 * MPK PROFILE PAGE
 * 
 * Governed profile management with three sections:
 * - Identity (read-only)
 * - Operational Profile (self-editable with logging)
 * - Status & Compliance (read-only)
 */

import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';
import { useCurrentMpk } from '@/hooks/useCurrentMpk';
import { useUpdateMpkProfile } from '@/hooks/useMpks';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { 
  ProfileIdentitySection,
  ProfileOperationalSection,
  ProfileStatusSection,
} from '@/components/profile';
import { supabase } from '@/integrations/supabase/client';

export default function MpkProfile() {
  const { t } = useTranslation();
  const { data: mpk, isLoading } = useCurrentMpk();
  const { accountStatus } = useAccountStatus();
  const updateProfile = useUpdateMpkProfile();

  const handleSaveOperational = async (updates: {
    contact_person?: string;
    phone?: string;
    email?: string;
    planned_capacity?: string;
    preferred_delivery_periods?: string[];
  }) => {
    if (!mpk) return;

    // Build changes for logging
    const changes: Record<string, { previous: string | null; new: string | null }> = {};
    
    // Map planned_capacity to typical_volume
    const volumeUpdates: { typical_volume_min?: number | null; typical_volume_max?: number | null } = {};
    if (updates.planned_capacity) {
      const [min, max] = updates.planned_capacity.replace('+', '').split('-').map(v => parseInt(v.trim()));
      volumeUpdates.typical_volume_min = min || null;
      volumeUpdates.typical_volume_max = max || min || null;
    }

    // Map preferred_delivery_periods to common_target_weeks
    const periodsUpdates: { common_target_weeks?: string[] | null } = {};
    if (updates.preferred_delivery_periods) {
      periodsUpdates.common_target_weeks = updates.preferred_delivery_periods;
    }

    // Update the profile
    await updateProfile.mutateAsync({
      mpkId: mpk.id,
      updates: {
        ...volumeUpdates,
        ...periodsUpdates,
      },
    });

    // Log change to activity log
    await supabase.from('mpk_activity_log').insert({
      mpk_id: mpk.id,
      action_type: 'profile_update',
      previous_value: null,
      new_value: JSON.stringify(updates),
      note: 'Updated operational profile',
      performed_by: 'Self',
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title={t('profile.title')} description={t('common.loading')} />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </MainLayout>
    );
  }

  if (!mpk) {
    return (
      <MainLayout>
        <PageHeader title={t('profile.title')} description={t('profile.description')} />
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">{t('profile.noProfileFound')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('profile.contactAdmin')}
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title={t('profile.title')} 
        description={t('profile.governedDescription')} 
      />

      <div className="space-y-6">
        {/* Section A: Identity (read-only) */}
        <ProfileIdentitySection
          data={{
            type: 'mpk',
            name: mpk.name,
            mpkId: mpk.mpk_id,
            intakeRegions: mpk.intake_regions,
          }}
        />

        {/* Section B: Operational Profile (self-editable) */}
        <ProfileOperationalSection
          data={{
            type: 'mpk',
            typicalVolumeMin: mpk.typical_volume_min,
            typicalVolumeMax: mpk.typical_volume_max,
            commonTargetWeeks: mpk.common_target_weeks,
          }}
          onSave={handleSaveOperational}
          isSaving={updateProfile.isPending}
        />

        {/* Section C: Status & Compliance (read-only) */}
        <ProfileStatusSection
          role="mpk"
          accountStatus={accountStatus}
          registrationStatus={mpk.registration_status}
          createdAt={mpk.created_at}
          updatedAt={mpk.updated_at}
          mpkStatus={mpk.status}
          isRequestRestricted={mpk.is_request_restricted}
          restrictionReason={mpk.restriction_reason}
        />
      </div>
    </MainLayout>
  );
}
