import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Package, 
  User, 
  Lock, 
  Unlock, 
  Calendar, 
  MapPin, 
  Scale,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  FileCheck,
  ShieldCheck,
  History
} from 'lucide-react';

interface BatchForMatching {
  id: string;
  batch_number: string;
  user_id: string;
  heads: number;
  grade: string;
  region: string;
  status: string;
  target_week: string;
  breed: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
  standard_status: string | null;
  delivery_period: 'short_term' | 'mid_term' | 'long_term' | null;
  matched_heads: number;
  available_heads: number;
  created_at?: string;
  updated_at?: string;
  // Farmer info (admin-only)
  farmer_name?: string;
  farmer_id?: string;
  farmer_grading?: string;
  farmer_reliability?: string;
}

interface MatchingEligibility {
  eligible: boolean;
  reasons: string[];
}

interface BatchDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: BatchForMatching | null;
  activeMatchingWindow?: {
    id: string;
    name: string;
    eligible_delivery_periods?: string[] | null;
  } | null;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0">Confirmed</Badge>;
    case 'soft_committed':
      return <Badge className="bg-status-soft-bg text-status-soft border-0">Soft Committed</Badge>;
    case 'forecast':
      return <Badge className="bg-status-forecast-bg text-status-forecast border-0">Forecast</Badge>;
    case 'matched':
      return <Badge className="bg-violet-500/10 text-violet-600 border-0">Matched</Badge>;
    case 'delivered':
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Delivered</Badge>;
    case 'closed':
      return <Badge className="bg-slate-500/10 text-slate-600 border-0">Closed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDeliveryPeriodLabel = (period: string | null) => {
  switch (period) {
    case 'short_term':
      return 'Short Term (0-2 weeks)';
    case 'mid_term':
      return 'Mid Term (2-4 weeks)';
    case 'long_term':
      return 'Long Term (4+ weeks)';
    default:
      return 'Not specified';
  }
};

const getStandardStatusBadge = (status: string | null) => {
  switch (status) {
    case 'high_standard':
      return <Badge className="bg-amber-500/10 text-amber-600 border-0">High Standard</Badge>;
    case 'standard':
      return <Badge className="bg-blue-500/10 text-blue-600 border-0">Standard</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground">Non-Standard</Badge>;
  }
};

function checkMatchingEligibility(
  batch: BatchForMatching,
  activeWindow?: { eligible_delivery_periods?: string[] | null } | null
): MatchingEligibility {
  const reasons: string[] = [];

  // Check if batch is confirmed
  if (batch.status !== 'confirmed') {
    reasons.push(`Batch status is "${batch.status}" - must be "confirmed" to match`);
  }

  // Check if there's available volume
  if (batch.available_heads <= 0) {
    reasons.push('No available volume - batch is fully matched');
  }

  // Check delivery period alignment with window
  if (activeWindow && batch.delivery_period) {
    const eligiblePeriods = activeWindow.eligible_delivery_periods || [];
    if (eligiblePeriods.length > 0 && !eligiblePeriods.includes(batch.delivery_period)) {
      reasons.push(`Delivery period "${batch.delivery_period}" not eligible for current matching window`);
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export function BatchDetailSheet({
  open,
  onOpenChange,
  batch,
  activeMatchingWindow,
}: BatchDetailSheetProps) {
  if (!batch) return null;

  const isLocked = ['matched', 'delivered', 'closed'].includes(batch.status);
  const eligibility = checkMatchingEligibility(batch, activeMatchingWindow);
  
  // Calculate volumes
  const declaredVolume = batch.heads;
  const matchedVolume = batch.matched_heads;
  const remainingVolume = batch.available_heads;

  // Determine if this is a predictability premium candidate
  // (simplified: confirmed status + no post-soft-commit changes would qualify)
  const isPredictabilityEligible = batch.status === 'confirmed' && batch.standard_status !== 'non_standard';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px] sm:max-w-[600px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* 1. Header */}
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="flex items-center gap-2 text-xl">
                    <Package className="h-5 w-5" />
                    {batch.batch_number}
                  </SheetTitle>
                  {batch.farmer_name && (
                    <SheetDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {batch.farmer_name}
                      {batch.farmer_id && (
                        <span className="text-xs text-muted-foreground">({batch.farmer_id})</span>
                      )}
                    </SheetDescription>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(batch.status)}
                  {isLocked ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
                      <Lock className="h-3 w-3" />
                      Locked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground gap-1">
                      <Unlock className="h-3 w-3" />
                      Editable
                    </Badge>
                  )}
                </div>
              </div>
            </SheetHeader>

            {/* 4. Matching Eligibility Indicator */}
            <Card className={`mb-6 ${eligibility.eligible ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {eligibility.eligible ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${eligibility.eligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {eligibility.eligible ? 'Eligible for Matching' : 'Not Eligible for Matching'}
                    </p>
                    {!eligibility.eligible && eligibility.reasons.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {eligibility.reasons.map((reason, i) => (
                          <li key={i} className="text-sm text-amber-600 flex items-start gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Supply Snapshot */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Supply Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Period */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delivery Period</span>
                  <span className="font-medium">{getDeliveryPeriodLabel(batch.delivery_period)}</span>
                </div>

                <Separator />

                {/* Volume Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-semibold">{declaredVolume}</p>
                    <p className="text-xs text-muted-foreground">Declared</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${
                    matchedVolume > 0 
                      ? 'bg-violet-500/10 text-violet-600' 
                      : 'bg-muted/50'
                  }`}>
                    <p className="text-lg font-semibold">{matchedVolume}</p>
                    <p className="text-xs opacity-80">Matched</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${
                    remainingVolume > 0 
                      ? 'bg-emerald-500/10 text-emerald-600' 
                      : 'bg-muted/50'
                  }`}>
                    <p className="text-lg font-semibold">{remainingVolume}</p>
                    <p className="text-xs opacity-80">Remaining</p>
                  </div>
                </div>

                {/* Target Week */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Target Week
                  </span>
                  <span className="font-medium">{batch.target_week}</span>
                </div>

                {/* Region */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Region
                  </span>
                  <span className="font-medium">{batch.region}</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Quality Envelope */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Quality Envelope
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Grade */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Grade</span>
                  <Badge variant="outline" className="font-medium">Grade {batch.grade}</Badge>
                </div>

                {/* Age Range */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Age Range</span>
                  <span className="font-medium">
                    {batch.age_min || '–'} – {batch.age_max || '–'} months
                  </span>
                </div>

                {/* Sex / Gender */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sex</span>
                  <span className="font-medium">{batch.gender || 'Not specified'}</span>
                </div>

                {/* Weight Range */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weight Range</span>
                  <span className="font-medium">
                    {batch.weight_min || '–'} – {batch.weight_max || '–'} kg
                  </span>
                </div>

                {/* Breed */}
                {batch.breed && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Breed</span>
                    <Badge variant="outline">{batch.breed}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5. Compliance & Discipline */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Compliance & Discipline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Standard Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Standard Status</span>
                  {getStandardStatusBadge(batch.standard_status)}
                </div>

                {/* Confirmation timestamp (using updated_at as proxy) */}
                {batch.status === 'confirmed' && batch.updated_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Confirmed At
                    </span>
                    <span className="text-sm font-medium">
                      {format(new Date(batch.updated_at), 'PPp')}
                    </span>
                  </div>
                )}

                <Separator />

                {/* Post-soft commit changes indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Post–Soft Commit Changes</span>
                  <Badge variant="outline" className="text-muted-foreground">
                    {/* Would need change tracking data - showing N/A for now */}
                    N/A
                  </Badge>
                </div>

                {/* Predictability Premium Eligibility */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Predictability Premium
                  </span>
                  {isPredictabilityEligible ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-0 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Eligible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Eligible
                    </Badge>
                  )}
                </div>

                {/* Farmer Reliability (if available) */}
                {batch.farmer_reliability && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Farmer Reliability</span>
                    <Badge 
                      variant="outline" 
                      className={
                        batch.farmer_reliability === 'high' 
                          ? 'text-emerald-600 border-emerald-300' 
                          : batch.farmer_reliability === 'medium'
                          ? 'text-amber-600 border-amber-300'
                          : 'text-red-600 border-red-300'
                      }
                    >
                      {batch.farmer_reliability.charAt(0).toUpperCase() + batch.farmer_reliability.slice(1)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            {batch.created_at && (
              <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5">
                  <History className="h-3 w-3" />
                  Created: {format(new Date(batch.created_at), 'PPpp')}
                </p>
                {batch.updated_at && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Updated: {format(new Date(batch.updated_at), 'PPpp')}
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Compact inline card for batch list items
export function BatchDescriptionCard({ batch }: { batch: BatchForMatching }) {
  const eligibility = checkMatchingEligibility(batch, null);
  
  return (
    <div className="space-y-2">
      {/* Eligibility Indicator */}
      <div className="flex items-center gap-2">
        {eligibility.eligible ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs text-emerald-600 font-medium">Eligible</span>
          </>
        ) : (
          <>
            <XCircle className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs text-amber-600 font-medium">Not Eligible</span>
          </>
        )}
        {batch.standard_status && batch.standard_status !== 'non_standard' && (
          <Badge variant="outline" className="text-xs py-0 ml-auto">
            {batch.standard_status === 'high_standard' ? 'High Std' : 'Standard'}
          </Badge>
        )}
      </div>
    </div>
  );
}
