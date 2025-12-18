import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, type ReadinessStatus } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Edit, 
  Calendar, 
  MapPin, 
  Users,
  ArrowUpCircle,
  Save,
  X,
  Loader2,
  ArrowDownCircle,
  Lock,
  Info,
  Clock,
  ShieldCheck,
  Unlock,

} from 'lucide-react';
import { useBatch, useConfirmBatch, useUpdateBatch, type BatchStatus } from '@/hooks/useBatches';
import { toast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { useRole } from '@/contexts/RoleContext';

// Data integrity components
import {
  ChangeConfirmationDialog,
  EditHelperNote,
  ReadinessTransitionDialog,
  SoftCommitEditDialog,
} from '@/components/data-integrity';
import { BatchFSMPanel } from '@/components/batches';
import { CurrentMatchingWindowBanner } from '@/components/admin/CurrentMatchingWindowBanner';
import { useChangeTracking } from '@/hooks/useChangeTracking';
import { DEFAULT_CONSTRAINTS, requiresReadinessConfirmation } from '@/lib/change-constraints';
import {
  isBatchReadOnly,
  requiresEditConfirmation,
  getLockedFieldTooltip,
  getEditRulesForStatus,
  type BatchLifecycleStatus,
} from '@/lib/batch-lifecycle';
import { useBatchTimeLock } from '@/hooks/useBatchTimeLock';
import { getTimeLockedTooltip } from '@/lib/batch-time-lock';
import { validateBatchEdit, formatValidationError } from '@/lib/batch-transition-guard';
import { useAdminOverride, useBatchAdminUnlockStatus } from '@/hooks/useAdminOverride';
import { AdminOverrideDialog } from '@/components/admin/AdminOverrideDialog';
import { AdminOverrideBadge } from '@/components/admin/AdminOverrideBadge';
import { RoleAwarePremiumBreakdown } from '@/components/premium/RoleAwarePremiumBreakdown';
import { useCalculatePremiumEligibility } from '@/hooks/usePremiumEligibility';
import { useCurrentFarmer } from '@/hooks/useCurrentFarmer';

const REGIONS = [
  'Almaty',
  'Astana',
  'Shymkent',
  'Aktobe',
  'Karaganda',
  'Pavlodar',
  'Kostanay',
  'East Kazakhstan',
  'West Kazakhstan',
  'North Kazakhstan',
];

const GRADES = ['A', 'B', 'C'];

// Generate target week options
function getTargetWeekOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  
  for (let i = 0; i < 16; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i * 7);
    const year = date.getFullYear();
    const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1) / 7);
    const value = `${year}-W${week.toString().padStart(2, '0')}`;
    const label = `Week ${week}, ${year}`;
    options.push({ value, label });
  }
  
  return options;
}

const formSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  heads: z.coerce.number().min(1, 'At least 1 head required').max(10000, 'Maximum 10,000 heads'),
  avg_weight: z.coerce.number().min(100, 'Minimum weight is 100 kg').max(1000, 'Maximum weight is 1000 kg').optional().or(z.literal('')),
  grade: z.string().min(1, 'Grade is required'),
  target_week: z.string().min(1, 'Target week is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

type FormData = z.infer<typeof formSchema>;

// Map database status to StatusBadge status
const mapStatus = (status: string): BatchStatus => {
  if (status === 'soft_committed') return 'soft_committed';
  if (status === 'delivered') return 'closed'; // legacy mapping
  return status as BatchStatus;
};

const getStatusLabel = (status: BatchStatus): string => {
  switch (status) {
    case 'draft': return 'Draft';
    case 'forecast': return 'Forecast';
    case 'soft_committed': return 'Soft Committed';
    case 'confirmed': return 'Confirmed';
    case 'matched': return 'Matched';
    case 'closed': return 'Closed';
    default: return status;
  }
};

const getNextStatus = (status: BatchStatus): BatchStatus | null => {
  if (status === 'forecast') return 'soft_committed';
  if (status === 'soft_committed') return 'confirmed';
  return null;
};

export default function BatchDetail() {
  const { batchId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const action = searchParams.get('action') || 'view';
  
  const [isEditing, setIsEditing] = useState(action === 'update');
  const [showQuantityConfirm, setShowQuantityConfirm] = useState(false);
  const [showReadinessDialog, setShowReadinessDialog] = useState(false);
  const [showSoftCommitEditDialog, setShowSoftCommitEditDialog] = useState(false);
  const [showAdminUnlockDialog, setShowAdminUnlockDialog] = useState(false);
  const [showAdminRelockDialog, setShowAdminRelockDialog] = useState(false);
  const [pendingQuantityChange, setPendingQuantityChange] = useState<{ old: number; new: number } | null>(null);
  
  const { data: batch, isLoading, error } = useBatch(batchId ? `BTH-${batchId}` : undefined);
  const confirmBatch = useConfirmBatch();
  const updateBatch = useUpdateBatch();
  const { trackBatchQuantityChange, trackReadinessChange, trackMonthChange } = useChangeTracking();
  const { role } = useRole();
  const { data: currentFarmer } = useCurrentFarmer();

  // Premium eligibility calculation for matched/confirmed batches
  const showPremiumBreakdown = batch && ['confirmed', 'matched', 'closed'].includes(batch.status);
  const { data: premiumBreakdown, isLoading: loadingPremiums } = useCalculatePremiumEligibility(
    showPremiumBreakdown ? batch?.id : null,
    showPremiumBreakdown ? currentFarmer?.id : null
  );

  // Check edit rules based on status
  const isStatusReadOnly = batch ? isBatchReadOnly(batch.status) : false;
  const needsConfirmation = batch ? requiresEditConfirmation(batch.status) : false;
  const statusLockedTooltip = batch ? getLockedFieldTooltip(batch.status) : '';
  const editRules = batch ? getEditRulesForStatus(batch.status) : null;

  // Admin override hooks
  const { data: adminUnlockStatus } = useBatchAdminUnlockStatus(batch?.id || '');
  const { unlockBatch, relockBatch, isAdmin } = useAdminOverride();

  // Time-based locking from matching window (now with admin unlock support)
  const { 
    lockStatus: timeLockStatus, 
    canEdit: canEditByTime, 
    canTransition, 
    bannerInfo: timeLockBanner, 
    matchingWindow,
    isAdminUnlocked 
  } = useBatchTimeLock(batch?.status || 'draft', {
    adminUnlockInfo: adminUnlockStatus,
  });

  // Combined lock status: locked by status OR locked by time (unless admin unlocked)
  const isReadOnly = isStatusReadOnly || !canEditByTime;
  const lockedTooltip = !canEditByTime 
    ? getTimeLockedTooltip() 
    : statusLockedTooltip;

  const weekOptions = getTargetWeekOptions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: batch ? {
      region: batch.region,
      heads: batch.heads,
      avg_weight: batch.avg_weight || '',
      grade: batch.grade,
      target_week: batch.target_week,
      notes: batch.notes || '',
    } : undefined,
  });

  const handleSave = async (data: FormData) => {
    if (!batch) return;
    
    // Check for quantity reduction
    if (data.heads < batch.heads) {
      setPendingQuantityChange({ old: batch.heads, new: data.heads });
      setShowQuantityConfirm(true);
      return;
    }
    
    await performSave(data);
  };

  const performSave = async (data: FormData, reason?: string) => {
    if (!batch) return;
    
    // UNIFIED EDIT GUARD: Validate BOTH status-based and time-based constraints
    const editValidation = validateBatchEdit(
      batch.status as BatchLifecycleStatus,
      role as 'farmer' | 'admin' | 'mpk',
      matchingWindow,
      'en',
      adminUnlockStatus
    );
    
    if (!editValidation.allowed) {
      const errorInfo = formatValidationError(editValidation);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });
      return;
    }
    
    // Track changes
    if (data.heads !== batch.heads) {
      await trackBatchQuantityChange(batch.id, batch.heads, data.heads, reason);
    }
    if (data.target_week !== batch.target_week) {
      await trackMonthChange(batch.id, batch.target_week, data.target_week, reason);
    }
    
    await updateBatch.mutateAsync({
      id: batch.id,
      region: data.region,
      heads: data.heads,
      avg_weight: data.avg_weight ? Number(data.avg_weight) : null,
      grade: data.grade,
      target_week: data.target_week,
      notes: data.notes || null,
      requires_action: false,
      action_type: null,
    });
    
    toast({
      title: 'Batch Updated',
      description: `${batch.batch_number} has been updated.`,
    });
    setIsEditing(false);
    setPendingQuantityChange(null);
  };

  const handleQuantityConfirm = (reason?: string) => {
    if (!pendingQuantityChange) return;
    const formData = form.getValues();
    performSave(formData, reason);
    setShowQuantityConfirm(false);
  };

  const handleEscalateStatus = async () => {
    if (!batch) return;
    
    const nextStatus = getNextStatus(batch.status);
    if (!nextStatus) return;
    
    await trackReadinessChange(batch.id, batch.status, nextStatus);
    
    await updateBatch.mutateAsync({
      id: batch.id,
      status: nextStatus,
      requires_action: false,
      action_type: null,
    });
    
    toast({
      title: 'Status Updated',
      description: `Batch status changed to ${getStatusLabel(nextStatus)}.`,
    });
  };

  const handleReadinessChange = async (newStatus: ReadinessStatus, reason?: string) => {
    if (!batch) return;
    
    const dbStatus = newStatus.replace('-', '_') as BatchStatus;
    
    await trackReadinessChange(batch.id, batch.status, dbStatus, reason);
    
    await updateBatch.mutateAsync({
      id: batch.id,
      status: dbStatus,
      requires_action: false,
      action_type: null,
    });
    
    toast({
      title: 'Status Updated',
      description: `Batch status changed to ${getStatusLabel(dbStatus)}.`,
    });
  };

  const handleConfirm = async () => {
    if (!batch) return;
    await confirmBatch.mutateAsync(batch.id);
    navigate('/farmer/batches');
  };

  // Handler for FSM panel transitions
  const handleFSMTransition = async (toStatus: BatchLifecycleStatus) => {
    if (!batch) return;
    
    await trackReadinessChange(batch.id, batch.status, toStatus as BatchStatus);
    
    await updateBatch.mutateAsync({
      id: batch.id,
      status: toStatus as BatchStatus,
      requires_action: false,
      action_type: null,
    });
    
    toast({
      title: 'Status Updated',
      description: `Batch status changed to ${toStatus.replace('_', ' ')}.`,
    });
  };

  const handleAcceptInvitation = async () => {
    if (!batch) return;
    
    await updateBatch.mutateAsync({
      id: batch.id,
      status: 'soft_committed',
      requires_action: false,
      action_type: null,
    });
    
    toast({
      title: 'Invitation Accepted',
      description: 'You have accepted the pool invitation.',
    });
    navigate('/farmer/batches');
  };

  const handleDeclineInvitation = async () => {
    if (!batch) return;
    
    await updateBatch.mutateAsync({
      id: batch.id,
      requires_action: false,
      action_type: null,
      mpk_interest: null,
    });
    
    toast({
      title: 'Invitation Declined',
      description: 'The pool invitation has been declined.',
    });
    navigate('/farmer/batches');
  };

  // Admin override handlers
  const handleAdminUnlock = (reason: string) => {
    if (!batch) return;
    unlockBatch.mutate({
      batchId: batch.id,
      batchNumber: batch.batch_number,
      reason,
    });
    setShowAdminUnlockDialog(false);
  };

  const handleAdminRelock = (reason: string) => {
    if (!batch) return;
    relockBatch.mutate({
      batchId: batch.id,
      batchNumber: batch.batch_number,
      reason,
    });
    setShowAdminRelockDialog(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mb-4">
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </MainLayout>
    );
  }

  if (error || !batch) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">Batch not found</p>
          <p className="text-sm text-muted-foreground mb-4">The requested batch could not be located.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  const nextStatus = getNextStatus(batch.status);

  return (
    <MainLayout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/farmer/batches')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Batches
        </Button>
      </div>

      <div className="flex items-start justify-between mb-6">
        <PageHeader 
          title={batch.batch_number}
          description={isEditing ? 'Edit batch information' : 'View and manage batch details'}
        />
        {!isEditing && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (needsConfirmation) {
                        setShowSoftCommitEditDialog(true);
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    disabled={isReadOnly}
                  >
                    {isReadOnly ? (
                      <Lock className="w-4 h-4 mr-2" />
                    ) : (
                      <Edit className="w-4 h-4 mr-2" />
                    )}
                    Edit
                  </Button>
                </span>
              </TooltipTrigger>
              {isReadOnly && (
                <TooltipContent>
                  <p>{lockedTooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Current Matching Window Banner */}
      <div className="mb-6">
        <CurrentMatchingWindowBanner compact />
      </div>

      {/* Time-locked Banner */}
      {timeLockBanner?.show && !isAdminUnlocked && (
        <Alert className="mb-6 border-amber-500/30 bg-amber-500/5">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">{timeLockBanner.title}</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {timeLockBanner.description}
          </AlertDescription>
          {/* Admin unlock button */}
          {isAdmin && timeLockStatus.canAdminOverride && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 gap-2 border-amber-500/50 hover:bg-amber-500/10"
              onClick={() => setShowAdminUnlockDialog(true)}
            >
              <Unlock className="h-4 w-4" />
              Admin Unlock
            </Button>
          )}
        </Alert>
      )}

      {/* Admin Override Badge - shows when batch is unlocked by admin */}
      {isAdminUnlocked && adminUnlockStatus && (
        <div className="mb-6 flex items-center gap-3">
          <AdminOverrideBadge
            reason={adminUnlockStatus.unlockReason}
            unlockedBy={adminUnlockStatus.unlockedBy}
            unlockedAt={adminUnlockStatus.unlockedAt}
          />
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowAdminRelockDialog(true)}
            >
              <Lock className="h-4 w-4" />
              Re-Lock
            </Button>
          )}
        </div>
      )}

      {/* Action Alert for Review */}
      {action === 'review' && batch.mpk_interest && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Pool Invitation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {batch.mpk_interest} has expressed interest in this batch.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAcceptInvitation} disabled={updateBatch.isPending}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={handleDeclineInvitation} disabled={updateBatch.isPending}>
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            /* Edit Form */
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Edit Batch Information</CardTitle>
                <CardDescription>Update the batch details below</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {REGIONS.map((region) => (
                                  <SelectItem key={region} value={region}>
                                    {region}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {GRADES.map((grade) => (
                                  <SelectItem key={grade} value={grade}>
                                    Grade {grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="heads"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Heads</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="avg_weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avg. Weight (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g. 450"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">Optional</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="target_week"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Week</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select target week" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {weekOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional details..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Data integrity helper note - varies by status */}
                    {needsConfirmation ? (
                      <EditHelperNote
                        variant="warning"
                        message="This batch is Soft Committed. Changes may affect your matching priority and buyer trust."
                        className="mt-2"
                      />
                    ) : (
                      <EditHelperNote
                        variant="info"
                        message="Frequent changes reduce matching priority."
                        className="mt-2"
                      />
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          form.reset();
                          setIsEditing(false);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateBatch.isPending}>
                        {updateBatch.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            /* View Mode */
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Batch Information</CardTitle>
                  <div className="flex items-center gap-2">
                    {isReadOnly && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{lockedTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <StatusBadge status={mapStatus(batch.status)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Read-only lock message */}
                {isReadOnly && (
                  <Alert className="mb-4 border-amber-500/30 bg-amber-500/5">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm text-amber-700">
                      This batch is locked due to its confirmed status. All fields are read-only.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      {isReadOnly && <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Batch ID</p>
                        <p className="text-sm font-semibold">{batch.batch_number}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      {isReadOnly && <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Number of Heads</p>
                        <p className="text-sm font-semibold">{batch.heads}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      {isReadOnly && <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Average Weight</p>
                        <p className={`text-sm font-semibold ${!batch.avg_weight ? 'text-amber-600' : ''}`}>
                          {batch.avg_weight ? `${batch.avg_weight} kg` : '—'}
                          {!batch.avg_weight && (
                            <span className="text-xs font-normal text-amber-600 ml-2">Not set</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      {isReadOnly && <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Grade</p>
                        <Badge variant="outline">Grade {batch.grade}</Badge>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      {isReadOnly ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Region</p>
                        <p className="text-sm font-medium">{batch.region}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      {isReadOnly ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      ) : (
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Target Week</p>
                        <p className="text-sm font-medium">{batch.target_week}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Livestock Characteristics */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    {isReadOnly && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                    <p className="text-xs text-muted-foreground">Livestock Characteristics</p>
                  </div>
                  {(batch.breed || batch.gender || batch.age_min || batch.age_max || batch.weight_min || batch.weight_max) ? (
                    <div className="grid grid-cols-2 gap-4">
                      {batch.breed && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Breed</p>
                          <p className="text-sm font-medium">{batch.breed}</p>
                        </div>
                      )}
                      {batch.gender && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Gender</p>
                          <p className="text-sm font-medium">{batch.gender}</p>
                        </div>
                      )}
                      {(batch.age_min || batch.age_max) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Age Range</p>
                          <p className="text-sm font-medium">
                            {batch.age_min ?? '–'} – {batch.age_max ?? '–'} months
                          </p>
                        </div>
                      )}
                      {(batch.weight_min || batch.weight_max) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Weight Range</p>
                          <p className="text-sm font-medium">
                            {batch.weight_min ?? '–'} – {batch.weight_max ?? '–'} kg
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No characteristics specified</p>
                  )}
                </div>

                {batch.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-1">
                      {isReadOnly && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                      <p className="text-xs text-muted-foreground">Notes</p>
                    </div>
                    <p className="text-sm">{batch.notes}</p>
                  </div>
                )}

                {batch.mpk_interest && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Interested Party</p>
                    <p className="text-sm font-medium">{batch.mpk_interest}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          {!isEditing && (
            <Card>
              <CardContent className="py-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Created: {format(parseISO(batch.created_at), 'MMM d, yyyy h:mm a')}</span>
                  <span>Last updated: {format(parseISO(batch.updated_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FSM Verification Panel - Primary Status Management */}
          <BatchFSMPanel
            currentStatus={batch.status as BatchLifecycleStatus}
            batchId={batch.batch_number}
            onTransition={handleFSMTransition}
            isTransitioning={updateBatch.isPending || confirmBatch.isPending}
            isTimeLocked={!canTransition}
            timeLockTooltip={timeLockStatus.lockReason || getTimeLockedTooltip()}
            matchingWindow={matchingWindow}
          />

          {/* Price Breakdown - for confirmed/matched batches */}
          {showPremiumBreakdown && premiumBreakdown && (
            <RoleAwarePremiumBreakdown
              breakdown={premiumBreakdown}
              isLocked={batch.status === 'matched' || batch.status === 'closed'}
            />
          )}

          {/* Quick Actions */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          onClick={() => {
                            if (needsConfirmation) {
                              setShowSoftCommitEditDialog(true);
                            } else {
                              setIsEditing(true);
                            }
                          }}
                          disabled={isReadOnly}
                        >
                          {isReadOnly ? (
                            <Lock className="w-4 h-4 mr-2" />
                          ) : (
                            <Edit className="w-4 h-4 mr-2" />
                          )}
                          Edit Details
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {isReadOnly && (
                      <TooltipContent>
                        <p>{lockedTooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/farmer/calendar')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View in Calendar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Data Integrity Dialogs */}
      <ChangeConfirmationDialog
        open={showQuantityConfirm}
        onOpenChange={setShowQuantityConfirm}
        changeType="quantity_reduction"
        entityName={batch?.batch_number || ''}
        previousValue={pendingQuantityChange ? `${pendingQuantityChange.old} heads` : ''}
        newValue={pendingQuantityChange ? `${pendingQuantityChange.new} heads` : ''}
        requiresReason={false}
        onConfirm={handleQuantityConfirm}
        onCancel={() => setPendingQuantityChange(null)}
      />

      <ReadinessTransitionDialog
        open={showReadinessDialog}
        onOpenChange={setShowReadinessDialog}
        batchNumber={batch?.batch_number || ''}
        currentStatus={mapStatus(batch?.status || 'forecast')}
        onConfirm={handleReadinessChange}
      />

      <SoftCommitEditDialog
        open={showSoftCommitEditDialog}
        onOpenChange={setShowSoftCommitEditDialog}
        onConfirm={() => {
          setShowSoftCommitEditDialog(false);
          setIsEditing(true);
        }}
        onCancel={() => setShowSoftCommitEditDialog(false)}
      />

      {/* Admin Override Dialogs */}
      <AdminOverrideDialog
        open={showAdminUnlockDialog}
        onOpenChange={setShowAdminUnlockDialog}
        title="Unlock Batch"
        description="This will temporarily unlock this batch, allowing edits despite the Matching Window deadline."
        actionType="unlock"
        targetName={batch?.batch_number || ''}
        onConfirm={handleAdminUnlock}
        isLoading={unlockBatch.isPending}
      />

      <AdminOverrideDialog
        open={showAdminRelockDialog}
        onOpenChange={setShowAdminRelockDialog}
        title="Re-Lock Batch"
        description="This will remove the admin override and re-lock this batch according to the Matching Window rules."
        actionType="relock"
        targetName={batch?.batch_number || ''}
        onConfirm={handleAdminRelock}
        isLoading={relockBatch.isPending}
      />
    </MainLayout>
  );
}
