/**
 * PROFILE IDENTITY SECTION
 * 
 * Read-only identity information.
 * Editable ONLY by Admin via management pages.
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock } from 'lucide-react';

interface FarmerIdentity {
  type: 'farmer';
  name: string;
  farmerId: string;
  region: string;
  farmType: string | null;
}

interface MpkIdentity {
  type: 'mpk';
  name: string;
  mpkId: string;
  intakeRegions: string[];
}

type IdentityData = FarmerIdentity | MpkIdentity;

interface ProfileIdentitySectionProps {
  data: IdentityData;
}

export function ProfileIdentitySection({ data }: ProfileIdentitySectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              {t('profile.identity.title')}
            </CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            <Lock className="w-3 h-3" />
            {t('profile.identity.readOnly')}
          </Badge>
        </div>
        <CardDescription>
          {t('profile.identity.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.type === 'farmer' ? (
          <FarmerIdentityContent data={data} />
        ) : (
          <MpkIdentityContent data={data} />
        )}
      </CardContent>
    </Card>
  );
}

function FarmerIdentityContent({ data }: { data: FarmerIdentity }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {t('profile.identity.farmName')}
        </p>
        <p className="font-medium">{data.name}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {t('profile.identity.farmerId')}
        </p>
        <p className="font-mono text-sm">{data.farmerId}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {t('profile.identity.region')}
        </p>
        <p className="font-medium">{data.region}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {t('profile.identity.farmType')}
        </p>
        <p className="font-medium">{data.farmType || '—'}</p>
      </div>
    </div>
  );
}

function MpkIdentityContent({ data }: { data: MpkIdentity }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            {t('profile.identity.legalName')}
          </p>
          <p className="font-medium">{data.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            {t('profile.identity.mpkId')}
          </p>
          <p className="font-mono text-sm">{data.mpkId}</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {t('profile.identity.processingRegions')}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {data.intakeRegions.length > 0 ? (
            data.intakeRegions.map((region) => (
              <Badge key={region} variant="secondary" className="text-xs">
                {region}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
