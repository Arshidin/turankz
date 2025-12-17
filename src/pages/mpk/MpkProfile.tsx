import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  MapPin, 
  Package, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useMpkByMpkId, useUpdateMpkProfile, type Mpk } from '@/hooks/useMpks';
import { Skeleton } from '@/components/ui/skeleton';

// For demo purposes, using a hardcoded MPK ID
const DEMO_MPK_ID = 'MPK-001';

const AVAILABLE_REGIONS = [
  'Almaty Region',
  'Turkestan Region',
  'East Kazakhstan',
  'Akmola Region',
  'Karaganda Region',
  'Kostanay Region',
  'North Kazakhstan',
  'Pavlodar Region',
  'West Kazakhstan',
  'Aktobe Region',
];

function getStatusBadge(status: Mpk['status']) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case 'restricted':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Restricted
        </Badge>
      );
    case 'inactive':
      return (
        <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/10">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
  }
}

export default function MpkProfile() {
  const { data: mpk, isLoading } = useMpkByMpkId(DEMO_MPK_ID);
  const updateProfile = useUpdateMpkProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    intake_regions: [] as string[],
    typical_volume_min: 0,
    typical_volume_max: 0,
    common_target_weeks: [] as string[],
  });

  const startEditing = () => {
    if (mpk) {
      setEditForm({
        name: mpk.name,
        intake_regions: mpk.intake_regions,
        typical_volume_min: mpk.typical_volume_min || 0,
        typical_volume_max: mpk.typical_volume_max || 0,
        common_target_weeks: mpk.common_target_weeks || [],
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveProfile = () => {
    if (!mpk) return;
    
    updateProfile.mutate({
      mpkId: mpk.id,
      updates: {
        name: editForm.name,
        intake_regions: editForm.intake_regions,
        typical_volume_min: editForm.typical_volume_min || null,
        typical_volume_max: editForm.typical_volume_max || null,
        common_target_weeks: editForm.common_target_weeks.length > 0 ? editForm.common_target_weeks : null,
      },
    }, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const toggleRegion = (region: string) => {
    setEditForm(prev => ({
      ...prev,
      intake_regions: prev.intake_regions.includes(region)
        ? prev.intake_regions.filter(r => r !== region)
        : [...prev.intake_regions, region],
    }));
  };

  const canCreateRequests = mpk?.status === 'active' && !mpk?.is_request_restricted;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <PageHeader 
            title="MPK Profile"
            description="Manage your intake profile and access"
          />
          <div className="grid gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!mpk) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <PageHeader 
            title="MPK Profile"
            description="Manage your intake profile and access"
          />
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No MPK profile found.</p>
              <p className="text-sm text-muted-foreground mt-1">Contact administration to set up your profile.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader 
          title="MPK Profile"
          description="Manage your intake profile and access"
        />

        {/* MPK Status & Access Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Status & Access
            </CardTitle>
            <CardDescription>
              Your current status and pool request eligibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <div className="mt-1">{getStatusBadge(mpk.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">MPK ID</p>
                <p className="font-mono text-sm">{mpk.mpk_id}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-3">
                {canCreateRequests ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-600">Eligible to create pool requests</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You can create up to {mpk.max_active_requests || 5} active pool requests.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-600">Access temporarily restricted</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mpk.restriction_reason || 'Contact administration for details.'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Access level depends on request consistency and fulfillment behavior. Maintain regular activity and minimize cancellations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Intake Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Intake Profile
                </CardTitle>
                <CardDescription>
                  Define where and how you source supply
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={cancelEditing}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveProfile} disabled={updateProfile.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* MPK Name */}
            <div className="space-y-2">
              <Label>Processing Plant Name</Label>
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter plant name"
                />
              ) : (
                <p className="text-sm font-medium">{mpk.name}</p>
              )}
            </div>

            {/* Intake Regions */}
            <div className="space-y-2">
              <Label>Intake Regions</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select regions you can source livestock from
              </p>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_REGIONS.map((region) => (
                    <Badge
                      key={region}
                      variant={editForm.intake_regions.includes(region) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleRegion(region)}
                    >
                      {region}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {mpk.intake_regions.length > 0 ? (
                    mpk.intake_regions.map((region) => (
                      <Badge key={region} variant="secondary">
                        {region}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No regions configured</p>
                  )}
                </div>
              )}
            </div>

            {/* Typical Target Volumes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Typical Target Volumes (heads per request)
              </Label>
              {isEditing ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      value={editForm.typical_volume_min || ''}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        typical_volume_min: parseInt(e.target.value) || 0 
                      }))}
                      placeholder="Min"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      className="w-24"
                      value={editForm.typical_volume_max || ''}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        typical_volume_max: parseInt(e.target.value) || 0 
                      }))}
                      placeholder="Max"
                    />
                    <span className="text-sm text-muted-foreground">heads</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm">
                  {mpk.typical_volume_min && mpk.typical_volume_max
                    ? `${mpk.typical_volume_min} – ${mpk.typical_volume_max} heads`
                    : 'Not specified'}
                </p>
              )}
            </div>

            {/* Target Weeks */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Common Target Periods
              </Label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {['W1', 'W2', 'W3', 'W4', 'Monthly'].map((period) => (
                    <Badge
                      key={period}
                      variant={editForm.common_target_weeks.includes(period) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setEditForm(prev => ({
                        ...prev,
                        common_target_weeks: prev.common_target_weeks.includes(period)
                          ? prev.common_target_weeks.filter(p => p !== period)
                          : [...prev.common_target_weeks, period],
                      }))}
                    >
                      {period}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {mpk.common_target_weeks && mpk.common_target_weeks.length > 0 ? (
                    mpk.common_target_weeks.map((week) => (
                      <Badge key={week} variant="secondary">
                        {week}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Not specified</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Requesting Rules & Guidance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5" />
              Requesting Rules & Guidance
            </CardTitle>
            <CardDescription>
              How pool requests and matching work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What is a Purchase Pool Request */}
            <div className="space-y-2">
              <h4 className="font-medium">What is a Purchase Pool Request?</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  A formal declaration of intent to source livestock for a specific target week
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  Specifies required volume, grade, and acceptable source regions
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  Requests are matched against available supply from the farmer pool
                </li>
              </ul>
            </div>

            {/* How Matching Works */}
            <div className="space-y-2">
              <h4 className="font-medium">How Matching Works</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  The system identifies available batches that meet your grade and region criteria
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  Matching occurs during designated matching windows before each target week
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  Fill rate indicates what portion of your requested volume has been matched
                </li>
              </ul>
            </div>

            {/* Best Practices */}
            <div className="space-y-2">
              <h4 className="font-medium">Improving Fulfillment</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  Submit requests early — availability is allocated on a first-come basis
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  Consider multiple intake regions to increase your matching pool
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  Maintain consistent request patterns — irregular activity may affect access
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  Minimize cancellations — frequent cancellations impact your fulfillment priority
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
