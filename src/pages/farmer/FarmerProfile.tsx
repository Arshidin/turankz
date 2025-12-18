/**
 * FARMER PROFILE PAGE
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
import { AlertCircle } from 'lucide-react';
import { useCurrentFarmer } from '@/hooks/useCurrentFarmer';
import { useUpdateFarmerProfile } from '@/hooks/useFarmers';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { 
  ProfileIdentitySection,
  ProfileOperationalSection,
  ProfileStatusSection,
} from '@/components/profile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function FarmerProfile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: farmer, isLoading, error } = useCurrentFarmer();
  const { accountStatus } = useAccountStatus();
  const updateProfile = useUpdateFarmerProfile();

  const handleSaveOperational = async (updates: {
    contact_name?: string;
    phone?: string;
    email?: string;
    estimated_herd_size?: string;
    preferred_delivery_periods?: string[];
  }) => {
    if (!farmer) return;

    // Build changes for logging
    const changes: Record<string, { previous: string | null; new: string | null }> = {};
    
    if (updates.contact_name !== undefined && updates.contact_name !== farmer.contact_name) {
      changes.contact_name = { previous: farmer.contact_name, new: updates.contact_name };
    }
    if (updates.phone !== undefined && updates.phone !== farmer.phone) {
      changes.phone = { previous: farmer.phone, new: updates.phone };
    }
    if (updates.email !== undefined && updates.email !== farmer.email) {
      changes.email = { previous: farmer.email, new: updates.email || null };
    }

    // Update the profile
    await updateProfile.mutateAsync({
      id: farmer.id,
      contact_name: updates.contact_name,
      phone: updates.phone,
      email: updates.email || undefined,
    });

    // Log each change to activity log
    for (const [field, change] of Object.entries(changes)) {
      await supabase.from('farmer_activity_log').insert({
        farmer_id: farmer.id,
        action_type: 'profile_update',
        previous_value: change.previous,
        new_value: change.new,
        note: `Updated ${field}`,
        performed_by: 'Self',
      });
    }
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

  if (error || !farmer) {
    return (
      <MainLayout>
        <PageHeader title={t('profile.title')} description={t('profile.description')} />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
            type: 'farmer',
            name: farmer.name,
            farmerId: farmer.farmer_id,
            region: farmer.region,
            farmType: farmer.farm_type,
          }}
        />

        {/* Section B: Operational Profile (self-editable) */}
        <ProfileOperationalSection
          data={{
            type: 'farmer',
            contactName: farmer.contact_name,
            phone: farmer.phone,
            email: farmer.email,
          }}
          onSave={handleSaveOperational}
          isSaving={updateProfile.isPending}
        />

        {/* Section C: Status & Compliance (read-only) */}
        <ProfileStatusSection
          role="farmer"
          accountStatus={accountStatus}
          registrationStatus={farmer.registration_status}
          createdAt={farmer.created_at}
          updatedAt={farmer.updated_at}
          grading={farmer.grading}
          reliability={farmer.reliability}
          isRestricted={farmer.is_restricted}
          restrictionReason={farmer.restriction_reason}
        />
      </div>
    </MainLayout>
  );
}
